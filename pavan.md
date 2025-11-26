# Hosting Portfolio Website with Docker

This guide explains how to containerize and deploy your portfolio website using Docker.

## Prerequisites

- Docker installed ([Download Docker](https://www.docker.com/products/docker-desktop))
- Docker Compose installed (included with Docker Desktop)
- Your portfolio source code
- A web server or cloud platform (AWS, DigitalOcean, Heroku, etc.)

## Project Structure

Your application consists of:
- **Frontend**: React/TypeScript with Vite
- **Backend**: Express.js/Node.js
- **Database**: PostgreSQL (Neon-backed)
- **Uploads**: Static file storage for images and PDFs

## Step 1: Create Dockerfile

Create a `Dockerfile` in the root directory:

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application (Vite will build frontend during npm run build)
RUN npm run build 2>/dev/null || true

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client ./client
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared

# Create uploads directory for file storage
RUN mkdir -p /app/uploads

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5000/api/hero || exit 1

# Start the application
CMD ["npm", "run", "dev"]
```

## Step 2: Create Docker Compose File

Create a `docker-compose.yml` in the root directory:

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
      - ./logs:/app/logs
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

## Step 3: Create Environment File

Create a `.env.docker` file (do NOT commit this to git):

```env
NODE_ENV=production
DATABASE_URL=postgresql://pavan:secure_password@db:5432/portfolio_db
PGHOST=db
PGPORT=5432
PGUSER=pavan
PGPASSWORD=secure_password
PGDATABASE=portfolio_db
SESSION_SECRET=your-secret-key-change-this
```

**Security Note**: Replace all values with strong, unique passwords. Use a password manager to generate secure passwords.

## Step 4: Build and Run Locally

### Build the Docker image:
```bash
docker build -t pavan-portfolio:latest .
```

### Run with Docker Compose:
```bash
# Using environment file
docker-compose --env-file .env.docker up -d

# Or without a file (set vars manually):
export DATABASE_URL="postgresql://pavan:password@localhost:5432/portfolio_db"
export SESSION_SECRET="your-secret"
docker-compose up -d
```

### Check logs:
```bash
docker-compose logs -f app
```

### Stop the containers:
```bash
docker-compose down
```

### Remove volumes (database data):
```bash
docker-compose down -v
```

## Step 5: Deploy to Cloud

### Option A: AWS EC2

1. Launch an EC2 instance (Ubuntu 22.04 LTS recommended)
2. Install Docker and Docker Compose:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```
3. Clone your repository and configure `.env.docker`
4. Run: `docker-compose up -d`
5. Set up a domain with Route 53 or similar
6. Use Nginx as a reverse proxy (see below)

### Option B: DigitalOcean App Platform

1. Push your code to GitHub
2. Go to DigitalOcean App Platform
3. Create new app and connect your repository
4. Configure build and run commands:
   - **Build**: `npm ci && npm run build`
   - **Run**: `npm run dev`
5. Add environment variables from your `.env.docker`
6. Deploy

### Option C: Docker Hub (for image hosting)

```bash
# Build image
docker build -t yourusername/pavan-portfolio:latest .

# Tag for Docker Hub
docker tag pavan-portfolio:latest yourusername/pavan-portfolio:latest

# Login to Docker Hub
docker login

# Push image
docker push yourusername/pavan-portfolio:latest
```

Then pull and run from any server:
```bash
docker run -p 5000:5000 --env-file .env.docker yourusername/pavan-portfolio:latest
```

## Step 6: Set Up Nginx Reverse Proxy

Create `nginx.conf`:

```nginx
upstream backend {
    server app:5000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    client_max_body_size 50M;

    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads {
        alias /app/uploads;
        expires 30d;
    }
}
```

Update `docker-compose.yml` to include Nginx:

```yaml
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - ./uploads:/app/uploads
      - /etc/letsencrypt:/etc/letsencrypt
    depends_on:
      - app
    networks:
      - portfolio-network
```

## Step 7: SSL Certificate (Let's Encrypt)

On your server:

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Certificate path: /etc/letsencrypt/live/yourdomain.com/
```

## Step 8: Manage Database

### Run migrations:
```bash
docker exec portfolio_app_1 npm run db:push
```

### Access database:
```bash
docker exec -it portfolio_db_1 psql -U pavan -d portfolio_db
```

## Production Checklist

- [ ] Change `SESSION_SECRET` to a strong random string
- [ ] Use strong database password
- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Configure SSL/TLS certificate
- [ ] Set up automated backups for PostgreSQL volume
- [ ] Enable Docker restart policies
- [ ] Monitor logs: `docker-compose logs -f`
- [ ] Set up log rotation for Docker
- [ ] Configure firewall rules
- [ ] Use environment variables for all secrets (never hardcode)
- [ ] Regular backup strategy for uploads folder
- [ ] Monitor disk space on server

## Troubleshooting

### App crashes on startup
```bash
docker-compose logs app
```

### Database connection failed
```bash
docker-compose exec db psql -U pavan -d portfolio_db
```

### Port already in use
```bash
# Change port in docker-compose.yml from 5000:5000 to 8000:5000
docker-compose up -d
```

### Out of disk space
```bash
docker system prune -a
```

## Useful Docker Commands

```bash
# View running containers
docker ps

# View all containers
docker ps -a

# Stop all containers
docker-compose down

# Restart a service
docker-compose restart app

# View resource usage
docker stats

# Clean up unused images
docker image prune

# View logs
docker-compose logs -f --tail=100
```

## Backup Strategy

### Backup database:
```bash
docker exec portfolio_db_1 pg_dump -U pavan portfolio_db > backup.sql
```

### Backup uploads folder:
```bash
tar -czf uploads_backup.tar.gz uploads/
```

### Restore database:
```bash
docker exec -i portfolio_db_1 psql -U pavan portfolio_db < backup.sql
```

## Security Best Practices

1. **Never commit secrets**: Use `.env` files and add to `.gitignore`
2. **Use strong passwords**: Min 16 characters with mixed case, numbers, symbols
3. **Enable firewall**: Only allow ports 80, 443, and SSH (22)
4. **Regular updates**: Keep Docker images and packages updated
5. **Use secrets management**: For production, use AWS Secrets Manager, HashiCorp Vault, etc.
6. **Enable HTTPS**: Always use SSL/TLS in production
7. **Rate limiting**: Implement rate limiting on API endpoints
8. **Database backups**: Automated daily backups to cloud storage

## Performance Optimization

1. **Use multi-stage builds** (already in Dockerfile)
2. **Minimize image size**: Using Alpine Linux saves ~100MB
3. **Enable gzip compression** in Nginx
4. **Cache static assets**: Set proper Cache-Control headers
5. **Database indexing**: Add indexes to frequently queried columns
6. **Connection pooling**: Configure PostgreSQL connection pooling

## Monitoring & Logging

Consider using:
- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **DataDog**: Cloud monitoring platform
- **New Relic**: Application performance monitoring
- **Sentry**: Error tracking

## Next Steps

1. Test locally with `docker-compose up`
2. Deploy to a cloud provider
3. Set up domain and SSL certificate
4. Configure backups and monitoring
5. Set up CI/CD pipeline for automated deployments

For questions or issues, refer to official documentation:
- Docker: https://docs.docker.com/
- Docker Compose: https://docs.docker.com/compose/
- PostgreSQL: https://www.postgresql.org/docs/
- Nginx: https://nginx.org/en/docs/
