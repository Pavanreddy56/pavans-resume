# Portfolio Website - AWS Serverless Architecture

## Overview
DevOps engineer portfolio with secure admin panel, deployed on AWS serverless infrastructure (Lambda, DynamoDB, API Gateway, S3).

## Current Architecture (AWS Serverless)

```
Frontend (S3)
    ↓ HTTPS via API Gateway
Lambda Functions (Node.js)
    ↓ CRUD operations
DynamoDB Tables (NoSQL)
```

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: AWS Lambda (Node.js 18+)
- **Database**: DynamoDB (8 tables)
- **API**: API Gateway + Lambda
- **Storage**: S3 (Frontend + File uploads)
- **Authentication**: JWT

## Project Structure
```
server/
├── dynamodb-storage.ts    # DynamoDB operations
├── lambda-handler.ts      # Lambda event handler
└── index-prod.ts         # Production entry point

shared/
└── schema.ts             # Data types & validation

client/
├── src/                  # React components
└── dist/                 # Built frontend (S3 deployment)

docs/
├── DEPLOYMENT.md         # Step-by-step AWS deployment
└── AWS_DEPLOYMENT_GUIDE.md # Detailed reference guide
```

## Key Files for AWS Deployment

| File | Purpose |
|------|---------|
| `server/dynamodb-storage.ts` | DynamoDB CRUD operations for all data |
| `server/lambda-handler.ts` | AWS Lambda event handler for API routes |
| `DEPLOYMENT.md` | Step-by-step deployment guide (START HERE) |
| `AWS_DEPLOYMENT_GUIDE.md` | Detailed reference with troubleshooting |
| `shared/schema.ts` | TypeScript types for all data models |

## DynamoDB Tables

1. `portfolio-admins` - Admin authentication
2. `portfolio-hero` - Hero section (profile info)
3. `portfolio-skills` - Technical skills
4. `portfolio-projects` - Portfolio projects
5. `portfolio-blog` - Blog posts
6. `portfolio-messages` - Contact form submissions
7. `portfolio-social` - Social media links
8. `portfolio-resume` - Resume file metadata

## Admin Credentials
- **Username**: `Pavan56`
- **Password**: `Pavanreddy56@`

## API Endpoints

### Public (No Auth)
- `GET /api/hero` - Get profile info
- `GET /api/skills` - Get all skills
- `GET /api/projects` - Get all projects
- `GET /api/blog` - Get blog posts
- `GET /api/social-links` - Get social links
- `POST /api/contact` - Submit contact form
- `GET /api/resume` - Get resume info

### Admin (JWT Protected)
- `POST /api/admin/login` - Get JWT token
- `PUT /api/hero` - Update hero section
- `POST/PUT/DELETE /api/skills/:id` - Manage skills
- `POST/PUT/DELETE /api/projects/:id` - Manage projects
- `POST/PUT/DELETE /api/blog/:id` - Manage blog posts
- `POST/PUT/DELETE /api/social-links/:id` - Manage social links
- `GET /api/messages` - View contact messages
- `PUT /api/messages/:id/read` - Mark message as read
- `DELETE /api/messages/:id` - Delete message
- `PUT /api/resume` - Update resume
- `DELETE /api/resume` - Delete resume

## Deployment

### Quick Start
1. Follow **DEPLOYMENT.md** step-by-step (5 phases, ~45 minutes)
2. Configure AWS credentials
3. Create DynamoDB tables
4. Deploy Lambda function
5. Set up API Gateway
6. Upload frontend to S3

### Cost
- **Lambda**: Free tier (1M requests/month)
- **DynamoDB**: Pay-per-request (~$1.25/million reads)
- **API Gateway**: $3.50/million calls
- **S3**: $0.023/GB stored
- **Estimated**: $5-15/month

## Features

### Public Portfolio
- Hero section with profile details
- Skills grouped by category
- Projects with tech stack badges
- Blog posts
- Contact form
- Social links
- Resume download
- Dark/Light theme toggle

### Admin Panel
- Secure JWT authentication
- Dashboard stats
- Full CRUD for all content:
  - Profile information
  - Skills management
  - Project uploads (images)
  - Blog post publishing
  - Social media links
  - Contact message viewing
  - Resume management

## Design
- **Colors**: Blue primary (#1E5EFF), professional DevOps aesthetic
- **Typography**: Inter font for body, JetBrains Mono for code
- **Theme**: Full dark mode support
- **Responsive**: Mobile-first, works on all devices

## User Preferences
✓ AWS serverless (no servers to manage)
✓ Pay-per-request pricing (cost-effective)
✓ Auto-scaling (handles traffic spikes)
✓ Low operational overhead

## Files Removed (PostgreSQL/Express specific)
- ❌ `server/db.ts` - PostgreSQL connection
- ❌ `server/storage.ts` - Drizzle ORM storage
- ❌ `server/routes.ts` - Express routes
- ❌ `server/app.ts` - Express app
- ❌ `server/init-db.ts` - Database init
- ❌ `Dockerfile` - Docker container
- ❌ `pavandocker.md` - Docker guide
- ❌ `pavan.md` - Old deployment docs

## Next Steps
1. Read **DEPLOYMENT.md** for step-by-step instructions
2. Get AWS credentials
3. Run deployment phases 1-5
4. Test your API
5. Visit your live portfolio!

## Support
- **AWS Lambda Docs**: https://docs.aws.amazon.com/lambda/
- **DynamoDB Docs**: https://docs.aws.amazon.com/dynamodb/
- **API Gateway**: https://docs.aws.amazon.com/apigateway/
- **See DEPLOYMENT.md** for step-by-step instructions
