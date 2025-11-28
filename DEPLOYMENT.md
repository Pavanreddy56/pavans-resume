# Portfolio Website - Step-by-Step Deployment Guide

Complete guide to deploy your DevOps portfolio on AWS serverless architecture (Lambda, DynamoDB, API Gateway, S3).

## Prerequisites

- AWS Account (https://aws.amazon.com)
- AWS CLI installed (`aws --version` to verify)
- Node.js 18+ installed (`node --version` to verify)
- Your project files ready

## Deployment Architecture

```
┌─────────────────────┐
│   Frontend (S3)     │  ← You visit this URL
└──────────┬──────────┘
           │ CloudFront (CDN)
           ↓
┌─────────────────────┐
│   API Gateway       │  ← Your app makes API calls
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│   Lambda Functions  │  ← Handles requests
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│    DynamoDB         │  ← Stores all data
└─────────────────────┘
```

**Cost**: ~$5-15/month with pay-per-request pricing

---

## Phase 1: AWS Setup (5 minutes)

### Step 1.1: Configure AWS CLI
```bash
aws configure
```

When prompted, enter:
- **AWS Access Key ID**: [From AWS Console → IAM → Users → Create access key]
- **AWS Secret Access Key**: [From AWS Console → IAM → Users → Create access key]
- **Default region**: `us-east-1`
- **Default output format**: `json`

**Get your credentials:**
1. Go to https://console.aws.amazon.com
2. Search for "IAM" → Users → [Your username]
3. Click "Create access key" → "Application running outside AWS"
4. Copy Access Key ID and Secret Access Key
5. Save securely (you'll only see them once)

---

## Phase 2: Database Setup (5 minutes)

### Step 2.1: Create DynamoDB Tables

Run these commands one by one:

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

### Step 2.2: Verify Tables Created
```bash
aws dynamodb list-tables --region us-east-1
```

You should see all 8 tables listed.

### Step 2.3: Populate Database

**Option A: Using AWS Console (Easier)**
1. Go to https://console.aws.amazon.com
2. Search for "DynamoDB" → Tables → Select `portfolio-admins`
3. Click "Explore items" → "Create item"
4. Click "JSON" tab and paste:

```json
{
  "username": {"S": "Pavan56"},
  "password": {"S": "$2b$10$3tEzLj5H7tF8jK9mL2pP5eQ6rS7tU8vW9xY0zA1bC2dE3fG4hI5jJ"},
  "id": {"S": "1"}
}
```

5. Click "Create item"
6. Repeat for other tables using data from `AWS_DEPLOYMENT_GUIDE.md` (Section "Step 3")

**Option B: Using AWS CLI**
See `AWS_DEPLOYMENT_GUIDE.md` for batch insert commands.

---

## Phase 3: Lambda Setup (10 minutes)

### Step 3.1: Create IAM Role
```bash
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
```

### Step 3.2: Add Permissions to Role
```bash
# DynamoDB access
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

# CloudWatch logs
aws iam attach-role-policy \
  --role-name portfolio-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

### Step 3.3: Install AWS SDK Dependencies
```bash
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
```

### Step 3.4: Get Your AWS Account ID
```bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo $ACCOUNT_ID
```

Save this ID - you'll need it in the next step.

### Step 3.5: Package and Deploy Lambda
```bash
# Create deployment package
mkdir -p lambda-deploy
cd lambda-deploy

# Copy files
cp -r ../server ./
cp -r ../shared ./
cp ../package.json ../package-lock.json ./

# Install production dependencies only
npm install --production

# Create zip file
zip -r lambda-function.zip .

# Get role ARN
ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/portfolio-lambda-role"

# Deploy Lambda function
aws lambda create-function \
  --function-name portfolio-api \
  --runtime nodejs18.x \
  --role $ROLE_ARN \
  --handler server/lambda-handler.handler \
  --zip-file fileb://lambda-function.zip \
  --timeout 30 \
  --memory-size 256 \
  --environment Variables="{SESSION_SECRET=$(uuidgen)}" \
  --region us-east-1

cd ..
```

---

## Phase 4: API Gateway Setup (10 minutes)

### Step 4.1: Create API Gateway
```bash
# Create REST API
API_ID=$(aws apigateway create-rest-api \
  --name portfolio-api \
  --description "Portfolio API Gateway" \
  --query 'id' \
  --output text)

echo "API ID: $API_ID"
```

### Step 4.2: Create API Resources
```bash
# Get root resource ID
ROOT_ID=$(aws apigateway get-resources \
  --rest-api-id $API_ID \
  --query 'items[0].id' \
  --output text)

# Create /api resource
API_RESOURCE_ID=$(aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $ROOT_ID \
  --path-part api \
  --query 'id' \
  --output text)

# Create /{proxy+} resource for catch-all routing
PROXY_RESOURCE_ID=$(aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $API_RESOURCE_ID \
  --path-part '{proxy+}' \
  --query 'id' \
  --output text)
```

### Step 4.3: Create HTTP Methods
```bash
# GET method
aws apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $PROXY_RESOURCE_ID \
  --http-method GET \
  --authorization-type NONE

# POST method
aws apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $PROXY_RESOURCE_ID \
  --http-method POST \
  --authorization-type NONE

# PUT method
aws apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $PROXY_RESOURCE_ID \
  --http-method PUT \
  --authorization-type NONE

# DELETE method
aws apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $PROXY_RESOURCE_ID \
  --http-method DELETE \
  --authorization-type NONE
```

### Step 4.4: Connect Lambda to API Gateway
```bash
# For each HTTP method, connect to Lambda
for METHOD in GET POST PUT DELETE; do
  aws apigateway put-integration \
    --rest-api-id $API_ID \
    --resource-id $PROXY_RESOURCE_ID \
    --http-method $METHOD \
    --type AWS_PROXY \
    --integration-http-method POST \
    --uri arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:${ACCOUNT_ID}:function:portfolio-api/invocations
done

# Allow Lambda to be invoked by API Gateway
aws lambda add-permission \
  --function-name portfolio-api \
  --statement-id AllowAPIGatewayInvoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com
```

### Step 4.5: Deploy API
```bash
aws apigateway create-deployment \
  --rest-api-id $API_ID \
  --stage-name prod
```

### Step 4.6: Get API Endpoint
```bash
echo "Your API is live at:"
echo "https://${API_ID}.execute-api.us-east-1.amazonaws.com/prod"
```

---

## Phase 5: Frontend Setup (10 minutes)

### Step 5.1: Create Environment File
Create `.env.production` in your project root:
```
VITE_API_URL=https://<YOUR_API_ID>.execute-api.us-east-1.amazonaws.com/prod
```

Replace `<YOUR_API_ID>` with the API ID from Step 4.6.

### Step 5.2: Build Frontend
```bash
npm run build
```

This creates a `dist/` folder with optimized frontend code.

### Step 5.3: Create S3 Bucket
```bash
# Create unique bucket name
S3_BUCKET="pavan-portfolio-$(date +%s)"

# Create bucket
aws s3 mb s3://$S3_BUCKET --region us-east-1

echo "S3 Bucket: $S3_BUCKET"
```

### Step 5.4: Upload Frontend to S3
```bash
aws s3 sync dist/ s3://$S3_BUCKET/ --delete
```

### Step 5.5: Enable Static Website Hosting
```bash
aws s3 website s3://$S3_BUCKET/ \
  --index-document index.html \
  --error-document index.html

# Make bucket public
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

### Step 5.6: Get Frontend URL
```bash
echo "Your website is live at:"
echo "http://${S3_BUCKET}.s3-website-us-east-1.amazonaws.com"
```

---

## Phase 6: Testing (5 minutes)

### Test Public Endpoints
```bash
# Get hero section
curl https://${API_ID}.execute-api.us-east-1.amazonaws.com/prod/api/hero

# Get skills
curl https://${API_ID}.execute-api.us-east-1.amazonaws.com/prod/api/skills

# Get projects
curl https://${API_ID}.execute-api.us-east-1.amazonaws.com/prod/api/projects
```

### Test Admin Login
```bash
TOKEN=$(curl -X POST \
  https://${API_ID}.execute-api.us-east-1.amazonaws.com/prod/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"Pavan56","password":"Pavanreddy56@"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "Token: $TOKEN"
```

### Test Protected Endpoint
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://${API_ID}.execute-api.us-east-1.amazonaws.com/prod/api/messages
```

---

## Phase 7: CloudFront Setup (Optional, 10 minutes)

For better performance and HTTPS, set up CloudFront:

```bash
# Create CloudFront distribution
aws cloudfront create-distribution \
  --distribution-config '{
    "CallerReference": "'"$(date +%s)"'",
    "Origins": {
      "Quantity": 1,
      "Items": [
        {
          "Id": "S3Origin",
          "DomainName": "'"${S3_BUCKET}"'.s3.amazonaws.com",
          "S3OriginConfig": {"OriginAccessIdentity": ""}
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

Get CloudFront URL from AWS Console → CloudFront → Distributions

---

## Summary

✅ **Phase 1**: AWS CLI configured  
✅ **Phase 2**: DynamoDB tables created & populated  
✅ **Phase 3**: Lambda function deployed  
✅ **Phase 4**: API Gateway configured  
✅ **Phase 5**: Frontend uploaded to S3  
✅ **Phase 6**: All endpoints tested  
✅ **Phase 7**: (Optional) CloudFront enabled  

---

## Your Live URLs

| Service | URL |
|---------|-----|
| Frontend | `http://${S3_BUCKET}.s3-website-us-east-1.amazonaws.com` |
| API | `https://${API_ID}.execute-api.us-east-1.amazonaws.com/prod` |
| Admin Login | `http://${S3_BUCKET}.s3-website-us-east-1.amazonaws.com/admin` |

---

## Troubleshooting

| Error | Solution |
|-------|----------|
| 502 Bad Gateway | Check Lambda execution role has DynamoDB permissions |
| 403 Unauthorized | Verify admin credentials (Pavan56 / Pavanreddy56@) |
| API returns 404 | Verify Lambda was deployed with correct handler |
| DynamoDB errors | Check tables are created in `us-east-1` region |
| CORS errors | API Gateway CORS is configured with `Access-Control-Allow-Origin: *` |

---

## Cost Breakdown

- **Lambda**: Free tier 1M requests/month
- **DynamoDB**: Pay-per-request (~$1.25 per million read units)
- **API Gateway**: $3.50 per million API calls
- **S3**: $0.023 per GB stored
- **CloudFront**: $0.085 per GB delivered (optional)

**Estimated**: $5-15/month for typical usage

---

## Maintenance

### Update Code
```bash
# Make code changes locally
# Rebuild and redeploy

npm run build
aws s3 sync dist/ s3://$S3_BUCKET/ --delete
```

### Update Lambda
```bash
# Update Lambda function code
cd lambda-deploy
zip -r lambda-function.zip .
aws lambda update-function-code \
  --function-name portfolio-api \
  --zip-file fileb://lambda-function.zip
cd ..
```

### View Logs
```bash
aws logs tail /aws/lambda/portfolio-api --follow
```

---

## Cleanup (Delete All Resources)

```bash
# Delete Lambda
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

# Delete S3 bucket
aws s3 rm s3://$S3_BUCKET --recursive
aws s3 rb s3://$S3_BUCKET

# Delete IAM role
aws iam delete-role-policy --role-name portfolio-lambda-role --policy-name DynamoDBAccess
aws iam delete-role-policy --role-name portfolio-lambda-role --policy-name S3Access
aws iam delete-role --role-name portfolio-lambda-role
```

---

## Need Help?

- AWS Lambda docs: https://docs.aws.amazon.com/lambda/
- DynamoDB docs: https://docs.aws.amazon.com/dynamodb/
- API Gateway docs: https://docs.aws.amazon.com/apigateway/
- See `AWS_DEPLOYMENT_GUIDE.md` for detailed explanations
