# AWS Serverless Deployment Guide for Portfolio Website

Complete step-by-step guide to deploy your portfolio on AWS using Lambda, DynamoDB, API Gateway, and S3.

## Architecture Overview

```
┌─────────────┐
│   S3 + CloudFront  │  (Frontend)
└────────┬────────────┘
         │
         │ HTTPS
         ↓
┌─────────────────────┐
│   API Gateway       │  (REST API)
└────────┬────────────┘
         │
         │ Routes to
         ↓
┌─────────────────────┐
│   Lambda Functions  │  (GET/POST handlers)
└────────┬────────────┘
         │
         │ Reads/Writes to
         ↓
┌─────────────────────┐
│    DynamoDB         │  (Database)
└─────────────────────┘
```

## Prerequisites

1. **AWS Account** - Create at https://aws.amazon.com
2. **AWS CLI** - Install from https://aws.amazon.com/cli/
3. **Node.js 18+** - Already installed in your environment
4. **AWS Credentials** - Configure with `aws configure`

## Step 1: Prepare AWS Credentials

```bash
# Configure AWS CLI
aws configure

# Enter:
# AWS Access Key ID: [from AWS Console]
# AWS Secret Access Key: [from AWS Console]
# Default region: us-east-1
# Default output format: json
```

### Get AWS Credentials:
1. Go to AWS Console → IAM → Users → Your User
2. Click "Create access key"
3. Choose "Application running outside AWS"
4. Copy Access Key ID and Secret Access Key
5. Save securely (you'll need them for `aws configure`)

## Step 2: Create DynamoDB Tables

```bash
# Create admins table
aws dynamodb create-table \
  --table-name portfolio-admins \
  --attribute-definitions AttributeName=username,AttributeType=S \
  --key-schema AttributeName=username,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Create hero section table
aws dynamodb create-table \
  --table-name portfolio-hero \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Create skills table
aws dynamodb create-table \
  --table-name portfolio-skills \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Create projects table
aws dynamodb create-table \
  --table-name portfolio-projects \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Create blog posts table
aws dynamodb create-table \
  --table-name portfolio-blog \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Create contact messages table
aws dynamodb create-table \
  --table-name portfolio-messages \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Create social links table
aws dynamodb create-table \
  --table-name portfolio-social \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Create resume table
aws dynamodb create-table \
  --table-name portfolio-resume \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

**Verify tables created:**
```bash
aws dynamodb list-tables --region us-east-1
```

## Step 3: Populate DynamoDB with Data

Use the DynamoDB Console:
1. Go to AWS Console → DynamoDB → Tables → portfolio-admins
2. Click "Explore items" 
3. Click "Create item"
4. Paste the JSON below for each table

### Admin User (portfolio-admins table):
```json
{
  "username": {"S": "Pavan56"},
  "password": {"S": "$2b$10$3tEzLj5H7tF8jK9mL2pP5eQ6rS7tU8vW9xY0zA1bC2dE3fG4hI5jJ"},
  "id": {"N": "1"}
}
```

### Hero Section (portfolio-hero table):
```json
{
  "id": {"S": "hero-1"},
  "name": {"S": "Pavan Reddy Cheedeti"},
  "title": {"S": "DevOps Engineer"},
  "intro": {"S": "Cloud enthusiast with 2+ years of experience in IT industry as a DevOps/Cloud Engineer. Proven experience in AWS, CI/CD, Docker, Kubernetes, Terraform, and Ansible. Passionate about automating infrastructure and streamlining deployment processes for optimal efficiency."},
  "profileImage": {"NULL": true}
}
```

### Sample Skills (portfolio-skills table):
```json
{
  "id": {"S": "skill-1"},
  "name": {"S": "AWS"},
  "category": {"S": "Cloud Platforms"}
}
{
  "id": {"S": "skill-2"},
  "name": {"S": "Docker"},
  "category": {"S": "Containerization"}
}
{
  "id": {"S": "skill-3"},
  "name": {"S": "Kubernetes"},
  "category": {"S": "Containerization"}
}
{
  "id": {"S": "skill-4"},
  "name": {"S": "Jenkins"},
  "category": {"S": "CI/CD"}
}
{
  "id": {"S": "skill-5"},
  "name": {"S": "Terraform"},
  "category": {"S": "Infrastructure"}
}
```

### Sample Project (portfolio-projects table):
```json
{
  "id": {"S": "project-1"},
  "title": {"S": "AWS Infrastructure Automation"},
  "description": {"S": "Designed and deployed AWS infrastructure (EC2, VPC, RDS, S3, IAM, ELB, Auto Scaling) using CloudFormation templates (YAML/JSON). Implemented infrastructure as code for consistent, repeatable deployments across multiple environments."},
  "techStack": {"L": [{"S": "AWS"}, {"S": "CloudFormation"}, {"S": "Terraform"}]},
  "githubUrl": {"S": "https://github.com/Pavanreddy56"},
  "liveUrl": {"NULL": true},
  "image": {"NULL": true},
  "featured": {"BOOL": true}
}
```

### Sample Blog Post (portfolio-blog table):
```json
{
  "id": {"S": "blog-1"},
  "title": {"S": "Getting Started with Kubernetes on AWS EKS"},
  "content": {"S": "Kubernetes has become the de facto standard for container orchestration..."},
  "excerpt": {"S": "A comprehensive guide to deploying and managing Kubernetes clusters on AWS EKS with best practices."},
  "published": {"BOOL": true},
  "publishedAt": {"S": "2024-11-28T00:00:00Z"}
}
```

### Social Links (portfolio-social table):
```json
{
  "id": {"S": "social-1"},
  "platform": {"S": "GitHub"},
  "url": {"S": "https://github.com/Pavanreddy56"}
}
{
  "id": {"S": "social-2"},
  "platform": {"S": "LinkedIn"},
  "url": {"S": "https://www.linkedin.com/in/pavan-reddy-cheedeti-918237281"}
}
{
  "id": {"S": "social-3"},
  "platform": {"S": "Email"},
  "url": {"S": "cpreddy.devops@gmail.com"}
}
```

## Step 4: Create S3 Bucket for Frontend

```bash
# Create S3 bucket (bucket name must be globally unique)
aws s3 mb s3://pavan-portfolio-frontend-$(date +%s) --region us-east-1

# Replace the bucket name in all commands below
export S3_BUCKET="pavan-portfolio-frontend-1234567890"

# Build your frontend
npm run build

# Upload frontend to S3
aws s3 sync dist/ s3://$S3_BUCKET/ --delete

# Enable static website hosting
aws s3 website s3://$S3_BUCKET/ \
  --index-document index.html \
  --error-document index.html

# Make bucket public (optional, if not using CloudFront)
aws s3api put-bucket-policy --bucket $S3_BUCKET --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicRead",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::'"$S3_BUCKET"'/*"
    }
  ]
}'
```

**Frontend URL (HTTP):**
```
http://<bucket-name>.s3-website-us-east-1.amazonaws.com
```

## Step 5: Deploy Lambda Functions

### Create Lambda Execution Role

```bash
# Create IAM role for Lambda
aws iam create-role \
  --role-name portfolio-lambda-role \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {"Service": "lambda.amazonaws.com"},
        "Action": "sts:AssumeRole"
      }
    ]
  }'

# Attach DynamoDB policy
aws iam put-role-policy \
  --role-name portfolio-lambda-role \
  --policy-name DynamoDBAccess \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ],
        "Resource": "arn:aws:dynamodb:us-east-1:*:table/portfolio-*"
      }
    ]
  }'

# Attach S3 policy for file uploads
aws iam put-role-policy \
  --role-name portfolio-lambda-role \
  --policy-name S3Access \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ],
        "Resource": "arn:aws:s3:::'"$S3_BUCKET"'/uploads/*"
      }
    ]
  }'

# Attach CloudWatch Logs policy
aws iam attach-role-policy \
  --role-name portfolio-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

### Package Lambda Code

```bash
# Create a directory for Lambda
mkdir -p lambda-package
cd lambda-package

# Copy necessary files
cp -r ../server ./
cp -r ../shared ./
cp -r ../node_modules ./

# Install only production dependencies
npm install --production

# Create deployment package
zip -r lambda-function.zip .

# Upload to AWS Lambda
aws lambda create-function \
  --function-name portfolio-api \
  --runtime nodejs18.x \
  --role arn:aws:iam::ACCOUNT_ID:role/portfolio-lambda-role \
  --handler server/lambda-handler.handler \
  --zip-file fileb://lambda-function.zip \
  --timeout 30 \
  --memory-size 256 \
  --environment Variables="{ENVIRONMENT=production,SESSION_SECRET=$(uuidgen)}"

# Replace ACCOUNT_ID with your AWS Account ID (find it in AWS Console)
```

**Get your AWS Account ID:**
```bash
aws sts get-caller-identity --query Account --output text
```

## Step 6: Create API Gateway

```bash
# Create API Gateway
export API_ID=$(aws apigateway create-rest-api \
  --name portfolio-api \
  --description "Portfolio API Gateway" \
  --query 'id' \
  --output text)

echo "API ID: $API_ID"

# Get root resource
export ROOT_ID=$(aws apigateway get-resources \
  --rest-api-id $API_ID \
  --query 'items[0].id' \
  --output text)

# Create /api resource
export API_RESOURCE_ID=$(aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $ROOT_ID \
  --path-part api \
  --query 'id' \
  --output text)

# Create /{proxy+} resource for catch-all routing
export PROXY_RESOURCE_ID=$(aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $API_RESOURCE_ID \
  --path-part '{proxy+}' \
  --query 'id' \
  --output text)

# Create GET method on /{proxy+}
aws apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $PROXY_RESOURCE_ID \
  --http-method GET \
  --authorization-type NONE

# Create POST method on /{proxy+}
aws apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $PROXY_RESOURCE_ID \
  --http-method POST \
  --authorization-type NONE

# Create PUT method on /{proxy+}
aws apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $PROXY_RESOURCE_ID \
  --http-method PUT \
  --authorization-type NONE

# Create DELETE method on /{proxy+}
aws apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $PROXY_RESOURCE_ID \
  --http-method DELETE \
  --authorization-type NONE

# Connect Lambda to GET
aws apigateway put-integration \
  --rest-api-id $API_ID \
  --resource-id $PROXY_RESOURCE_ID \
  --http-method GET \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:ACCOUNT_ID:function:portfolio-api/invocations

# Repeat for POST, PUT, DELETE (replace GET with POST, PUT, DELETE)

# Deploy API
aws apigateway create-deployment \
  --rest-api-id $API_ID \
  --stage-name prod

# Get API endpoint
echo "API Endpoint: https://$API_ID.execute-api.us-east-1.amazonaws.com/prod"
```

## Step 7: Enable Lambda to be Invoked by API Gateway

```bash
# Allow API Gateway to invoke Lambda
aws lambda add-permission \
  --function-name portfolio-api \
  --statement-id AllowAPIGatewayInvoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com
```

## Step 8: Enable CORS

```bash
# Enable CORS for all methods
aws apigateway put-integration-response \
  --rest-api-id $API_ID \
  --resource-id $PROXY_RESOURCE_ID \
  --http-method GET \
  --status-code 200 \
  --response-parameters '{"method.response.header.Access-Control-Allow-Origin":"'"'"'*'"'"'"}'

# Repeat for other HTTP methods
```

## Step 9: Configure Frontend API Endpoint

1. Create `.env.production` in your project root:
```
VITE_API_URL=https://<API_ID>.execute-api.us-east-1.amazonaws.com/prod
```

2. Update `client/src/lib/queryClient.ts`:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

3. Rebuild and deploy:
```bash
npm run build
aws s3 sync dist/ s3://$S3_BUCKET/ --delete
```

## Step 10: Set Up CloudFront (Optional but Recommended)

```bash
# Create CloudFront distribution
aws cloudfront create-distribution --distribution-config '{
  "CallerReference": "'"$(date +%s)"'",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3Origin",
        "DomainName": "'"$S3_BUCKET"'.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3Origin",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"]
    },
    "CachePolicyId": "658327ea-f89d-4fab-a63d-7e88639e58f6",
    "Compress": true
  },
  "Enabled": true,
  "DefaultRootObject": "index.html"
}'
```

## Testing

### Test Public Routes
```bash
# Get hero section
curl https://<API_ID>.execute-api.us-east-1.amazonaws.com/prod/api/hero

# Get skills
curl https://<API_ID>.execute-api.us-east-1.amazonaws.com/prod/api/skills

# Get projects
curl https://<API_ID>.execute-api.us-east-1.amazonaws.com/prod/api/projects
```

### Test Admin Routes
```bash
# Login
TOKEN=$(curl -X POST \
  https://<API_ID>.execute-api.us-east-1.amazonaws.com/prod/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"Pavan56","password":"Pavanreddy56@"}' \
  | jq -r '.token')

# Create skill with token
curl -X POST \
  https://<API_ID>.execute-api.us-east-1.amazonaws.com/prod/api/skills \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Python","category":"Programming"}'
```

## Cost Optimization

- **DynamoDB**: PAY_PER_REQUEST (only pay for usage)
- **Lambda**: Free tier: 1M requests/month, 3.2M seconds/month
- **API Gateway**: $3.50 per million API calls
- **S3**: $0.023 per GB stored
- **CloudFront**: $0.085 per GB delivered

**Estimated monthly cost for small usage: $5-15**

## Monitoring & Logs

```bash
# View Lambda logs
aws logs tail /aws/lambda/portfolio-api --follow

# View API Gateway logs
aws cloudwatch get-log-events \
  --log-group-name /aws/apigateway/portfolio-api \
  --log-stream-name deployment

# Create CloudWatch Dashboard
aws cloudwatch put-dashboard \
  --dashboard-name portfolio-dashboard \
  --dashboard-body file://dashboard-config.json
```

## Cleanup (Delete all resources)

```bash
# Delete Lambda function
aws lambda delete-function --function-name portfolio-api

# Delete API Gateway
aws apigateway delete-rest-api --rest-api-id $API_ID

# Delete DynamoDB tables
aws dynamodb delete-table --table-name portfolio-admins
aws dynamodb delete-table --table-name portfolio-hero
aws dynamodb delete-table --table-name portfolio-skills
aws dynamodb delete-table --table-name portfolio-projects
aws dynamodb delete-table --table-name portfolio-blog
aws dynamodb delete-table --table-name portfolio-messages
aws dynamodb delete-table --table-name portfolio-social
aws dynamodb delete-table --table-name portfolio-resume

# Empty and delete S3 bucket
aws s3 rm s3://$S3_BUCKET --recursive
aws s3 rb s3://$S3_BUCKET

# Delete IAM role
aws iam delete-role-policy --role-name portfolio-lambda-role --policy-name DynamoDBAccess
aws iam delete-role-policy --role-name portfolio-lambda-role --policy-name S3Access
aws iam delete-role --role-name portfolio-lambda-role
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 502 Bad Gateway | Check Lambda execution role has DynamoDB permissions |
| CORS errors | Enable CORS on API Gateway integration responses |
| 403 Unauthorized | Verify JWT token is valid and sent with Bearer prefix |
| DynamoDB throttling | Switch to provisioned capacity or increase on-demand throughput |
| Lambda timeout | Increase timeout value in Lambda configuration |

## Support Resources

- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
- [AWS CLI Reference](https://docs.aws.amazon.com/cli/)

---

**Your AWS Infrastructure is now deployed!** 🎉

**Next Steps:**
1. Update DNS to point to CloudFront distribution (optional)
2. Enable HTTPS with ACM certificate (optional)
3. Set up monitoring and alerts
4. Configure auto-scaling policies
