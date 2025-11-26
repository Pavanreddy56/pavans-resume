# Docker Hosting Guide - Step by Step

Complete guide to host your Pavan Reddy portfolio website using Docker.

---

## Step 1: Create Dockerfile

Create a file named `Dockerfile` in your project root:

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build 2>/dev/null || true

# Production stage
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache curl

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client ./client
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared

RUN mkdir -p /app/uploads

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5000/api/hero || exit 1

CMD ["npm", "run", "dev"]
```

---

## Step 2: Create Docker Compose File

Create a file named `docker-compose.yml` in your project root:

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - SESSION_SECRET=${SESSION_SECRET}
      - PGHOST=${PGHOST}
      - PGPORT=${PGPORT}
      - PGUSER=${PGUSER}
      - PGPASSWORD=${PGPASSWORD}
      - PGDATABASE=${PGDATABASE}
    volumes:
      - ./uploads:/app/uploads
    restart: unless-stopped
    networks:
      - portfolio-network
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${PGUSER}
      POSTGRES_PASSWORD: ${PGPASSWORD}
      POSTGRES_DB: ${PGDATABASE}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    networks:
      - portfolio-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${PGUSER}"]
      interval: 10s
      timeout: 5s
      retries: 5

networks:
  portfolio-network:
    driver: bridge

volumes:
  postgres_data:
```

---

## Step 3: Create Environment File

Create a file named `.env.docker` (DO NOT commit to git):

```env
NODE_ENV=production
DATABASE_URL=postgresql://pavan:YourStrongPassword123@db:5432/portfolio_db
PGHOST=db
PGPORT=5432
PGUSER=pavan
PGPASSWORD=YourStrongPassword123
PGDATABASE=portfolio_db
SESSION_SECRET=your-super-secret-key-change-this-to-something-long-and-random
```

**⚠️ IMPORTANT**: Replace all passwords with strong, unique passwords (min 16 characters)

---

## Step 4: Update .gitignore

Add to your `.gitignore` file to prevent committing sensitive data:

```
.env.docker
.env.local
.env.production
*.env
uploads/
```

---

## Step 5: Test Locally (On Your Computer)

### A. Install Docker
- **Windows/Mac**: Download [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Linux**: Follow [Docker installation guide](https://docs.docker.com/engine/install/)

### B. Build Docker Image

Open terminal in your project folder and run:

```bash
docker build -t pavan-portfolio:latest .
```

This creates a Docker image (~500MB). Takes 2-5 minutes.

### C. Start with Docker Compose

```bash
docker-compose --env-file .env.docker up -d
```

**What this does:**
- `-d` = Run in background (detached mode)
- Starts PostgreSQL database
- Starts your app
- Creates upload folder
- Sets up networking

### D. Check if Running

```bash
docker-compose ps
```

You should see:
```
NAME                 STATUS
portfolio_app_1      Up 2 seconds
portfolio_db_1       Up 3 seconds
```

### E. View Logs

```bash
docker-compose logs -f app
```

Look for: `serving on port 5000` ✓

### F. Test Your App

Open: `http://localhost:5000`

You should see your portfolio homepage!

### G. Stop Containers

```bash
docker-compose down
```

Stops but keeps database data.

---

## Step 6: Deploy to Server (AWS EC2)

### A. Launch EC2 Instance

1. Go to [AWS Console](https://console.aws.amazon.com/)
2. Click **EC2** → **Launch Instance**
3. Select: **Ubuntu Server 22.04 LTS**
4. Instance type: **t2.micro** (free tier)
5. Configure security group:
   - Allow SSH (22) from your IP
   - Allow HTTP (80) from anywhere
   - Allow HTTPS (443) from anywhere
6. Launch and download `.pem` key file

### B. Connect to Server

```bash
# Make key readable
chmod 400 your-key.pem

# Connect via SSH
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

### C. Install Docker on Server

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### D. Clone Your Repository

```bash
git clone https://github.com/yourusername/portfolio.git
cd portfolio
```

### E. Set Up Environment File

```bash
# Create .env.docker with your settings
nano .env.docker
```

Paste your environment variables, then press:
- `Ctrl + X`
- `Y` (yes)
- `Enter`

### F. Start Application

```bash
docker-compose --env-file .env.docker up -d
```

Check status:
```bash
docker-compose ps
docker-compose logs app
```

---

## Step 7: Set Up Domain & SSL (Let's Encrypt)

### A. Point Domain to Your Server

1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Find DNS settings
3. Add **A record**:
   - Type: A
   - Name: @ (or leave blank)
   - Value: Your EC2 public IP

Wait 5-15 minutes for DNS to propagate.

### B. Install Nginx

```bash
sudo apt update
sudo apt install nginx -y
```

### C. Create Nginx Config

```bash
sudo nano /etc/nginx/sites-available/default
```

Replace entire content with:

```nginx
upstream backend {
    server 127.0.0.1:5000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        alias /home/ubuntu/portfolio/uploads;
        expires 30d;
    }
}
```

Save: `Ctrl + X` → `Y` → `Enter`

### D. Test Nginx Config

```bash
sudo nginx -t
```

Should say: `test is successful`

### E. Restart Nginx

```bash
sudo systemctl restart nginx
```

### F. Get Free SSL Certificate

```bash
sudo apt install certbot python3-certbot-nginx -y

sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

Follow prompts and accept terms.

Certificate saved to: `/etc/letsencrypt/live/yourdomain.com/`

### G. Update Nginx with SSL

```bash
sudo nano /etc/nginx/sites-available/default
```

Replace with:

```nginx
upstream backend {
    server 127.0.0.1:5000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        alias /home/ubuntu/portfolio/uploads;
        expires 30d;
    }
}
```

### H. Restart Nginx

```bash
sudo systemctl restart nginx
```

Now visit: `https://yourdomain.com` ✓

---

## Step 8: Database Backup & Restore

### A. Backup Database

```bash
docker exec portfolio_db_1 pg_dump -U pavan portfolio_db > backup.sql
```

Creates `backup.sql` file with all your data.

### B. Backup Uploads Folder

```bash
tar -czf uploads_backup.tar.gz uploads/
```

### C. Restore Database

```bash
docker exec -i portfolio_db_1 psql -U pavan portfolio_db < backup.sql
```

---

## Step 9: Useful Docker Commands

### View Running Containers
```bash
docker-compose ps
```

### View Live Logs
```bash
docker-compose logs -f app
```

### Restart App
```bash
docker-compose restart app
```

### Stop Everything
```bash
docker-compose stop
```

### Start Everything
```bash
docker-compose start
```

### Remove Everything (⚠️ deletes data)
```bash
docker-compose down -v
```

### SSH into Container
```bash
docker-compose exec app sh
```

### View Database
```bash
docker-compose exec db psql -U pavan -d portfolio_db
```

Type `\dt` to see tables, then `\q` to exit.

---

## Step 10: Monitor Your App

### Check Disk Space
```bash
df -h
```

### Check Memory Usage
```bash
docker stats
```

### View Error Logs
```bash
docker-compose logs app | tail -50
```

### Database Size
```bash
docker-compose exec db psql -U pavan -d portfolio_db -c "SELECT pg_size_pretty(pg_database_size(current_database()));"
```

---

## Troubleshooting

### App keeps crashing?
```bash
docker-compose logs app
```
Look for error messages.

### Port 5000 already in use?
Change in `docker-compose.yml`:
```yaml
ports:
  - "8000:5000"  # External:Internal
```

### Database won't start?
```bash
docker-compose down -v
docker-compose up -d
```

### Out of disk space?
```bash
docker system prune -a
```

### Can't connect to database?
```bash
docker-compose exec db psql -U pavan -d portfolio_db
```

---

## Production Checklist

- [ ] Changed all default passwords (Pavan56 / Pavanreddy56@)
- [ ] Changed SESSION_SECRET to random string
- [ ] Database password is 16+ characters
- [ ] Domain points to server
- [ ] SSL certificate installed
- [ ] Nginx running and configured
- [ ] Firewall allows only 22, 80, 443
- [ ] Backups created
- [ ] App logs monitored
- [ ] Database size monitored

---

## Complete Startup Script

Save as `deploy.sh` and run: `bash deploy.sh`

```bash
#!/bin/bash

echo "🚀 Starting Portfolio Application..."

# Build image
echo "📦 Building Docker image..."
docker build -t pavan-portfolio:latest .

# Start containers
echo "🐳 Starting Docker containers..."
docker-compose --env-file .env.docker up -d

# Wait for database
echo "⏳ Waiting for database..."
sleep 5

# Check status
echo "✅ Checking status..."
docker-compose ps

echo "🎉 Application started!"
echo "📍 Visit: http://localhost:5000"
echo "🛑 Stop with: docker-compose down"
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Start app | `docker-compose up -d` |
| Stop app | `docker-compose down` |
| View logs | `docker-compose logs -f app` |
| Restart | `docker-compose restart app` |
| View status | `docker-compose ps` |
| Remove all | `docker-compose down -v` |
| Build image | `docker build -t name:tag .` |

---

## Support & Resources

- Docker Docs: https://docs.docker.com/
- Docker Compose: https://docs.docker.com/compose/
- PostgreSQL: https://www.postgresql.org/docs/
- Nginx: https://nginx.org/en/docs/
- Let's Encrypt: https://letsencrypt.org/

---

**Happy Hosting! 🚀**
