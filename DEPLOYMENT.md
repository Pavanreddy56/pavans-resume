# AWS Serverless Portfolio - Complete Deployment Guide

**Deploy your DevOps portfolio to AWS serverless infrastructure (S3, Lambda, API Gateway, DynamoDB)**

> **Total Time**: ~2 hours | **Cost**: ~$5-15/month | **No CLI needed**

---

## Architecture

```
Frontend (S3) → API Gateway → Lambda → DynamoDB
```

---

## Phase 0: Local Testing (5 minutes)

Before deploying to AWS, test everything locally on **localhost:5000**:

### Step 0.1: Start Local Development
1. Your project is already running on `http://localhost:5000`
2. Click "Admin Login" button
3. Enter credentials:
   - **Username**: `Pavan56`
   - **Password**: `Pavanreddy56@`
4. You should access the admin dashboard

✅ If login works locally, you're ready to deploy to AWS!

---

# PHASE 1: Create DynamoDB Tables on AWS

**Time: 10 minutes**

You need to create **7 empty tables** on AWS DynamoDB. These will store all your portfolio data.

## Step 1.1: Open AWS DynamoDB Console

1. Go to https://console.aws.amazon.com (login to your AWS account)
2. Search for **DynamoDB** in the search bar
3. Click **DynamoDB**
4. Click **Tables** in the left sidebar

## Step 1.2: Create Table 1 - `portfolio-hero`

1. Click **Create table**
2. Fill in:
   - **Table name**: `portfolio-hero`
   - **Partition key**: `id` (String)
   - **Billing mode**: On-demand
3. Click **Create table**

**Repeat for the remaining 6 tables** - same settings, just change the table name:

| # | Table Name | Partition Key |
|---|---|---|
| 2 | `portfolio-skills` | `id` (String) |
| 3 | `portfolio-projects` | `id` (String) |
| 4 | `portfolio-blog` | `id` (String) |
| 5 | `portfolio-messages` | `id` (String) |
| 6 | `portfolio-social` | `id` (String) |
| 7 | `portfolio-resume` | `id` (String) |

✅ All 7 tables created? Move to **PHASE 2**

---

# PHASE 2: Deploy Lambda Function

**Time: 20 minutes**

## Step 2.1: Create Lambda Function

1. Search for **Lambda** in AWS Console
2. Click **Lambda**
3. Click **Create function**
4. Fill in:
   - **Function name**: `portfolio-api`
   - **Runtime**: Node.js 20.x
   - **Architecture**: x86_64
5. Click **Create function**

## Step 2.2: Copy Lambda Code

1. Open the file `LAMBDA_CODE.js` from your project
2. Copy **ALL the code** (select all with Ctrl+A)
3. Go back to AWS Lambda console
4. Click on **`index.mjs`** tab in the code editor
5. Select all code (Ctrl+A) and **delete it**
6. **Paste** the code from `LAMBDA_CODE.js`
7. Click **Deploy**

## Step 2.3: Set Handler

1. Scroll down to **Runtime settings**
2. Click **Edit**
3. Change **Handler** to: `index.handler`
4. Click **Save**

## Step 2.4: Add Environment Variables

1. Scroll to **Environment variables**
2. Click **Edit**
3. Click **Add environment variable**
4. Add:
   - **Key**: `SESSION_SECRET`
   - **Value**: `portfolio-secret-key`
5. Click **Save**

## Step 2.5: Increase Timeout

1. Scroll to **General configuration**
2. Click **Edit**
3. Change **Timeout** to: `30` seconds
4. Click **Save**

✅ Lambda deployed? Move to **PHASE 3**

---

# PHASE 3: Create API Gateway

**Time: 20 minutes**

## Step 3.1: Create REST API

1. Search for **API Gateway** in AWS Console
2. Click **API Gateway**
3. Click **Create API**
4. Select **REST API** (first option)
5. Click **Build**

## Step 3.2: Configure API

1. **API name**: `portfolio-api`
2. **Endpoint type**: Regional
3. Click **Create API**

## Step 3.3: Create Resources and Methods

1. Click **Resources** on left
2. Click on `/` (root resource)
3. Click **Create resource**
4. **Resource name**: `api` → **Create resource**
5. Click on the new `/api` resource
6. Click **Create resource** again
7. **Resource name**: `{proxy+}`
8. ✅ Check **Enable API Gateway CORS**
9. Click **Create resource**

## Step 3.4: Create ANY Method

1. Click on `/{proxy+}` resource
2. Click **Create method**
3. Select **ANY**
4. Click **Create method**
5. Fill in:
   - **Integration type**: Lambda Function
   - **Lambda Function**: Search and select `portfolio-api`
   - ✅ Check **Use Lambda Proxy Integration**
6. Click **Create method**

## Step 3.5: Create Root Method

1. Click on `/` resource
2. Click **Create method**
3. Select **ANY**
4. Fill in same as above
5. Click **Create method**

## Step 3.6: Deploy API

1. Click **Deploy API** button (orange)
2. **Stage**: Create new stage
3. **Stage name**: `prod`
4. Click **Deploy**

## Step 3.7: Copy Your API URL

1. Click **Stages** on left
2. Click **prod**
3. Copy the **Invoke URL** (looks like: `https://abc123.execute-api.ap-south-1.amazonaws.com/prod`)
4. **Save this URL** - you need it in the next phase!

✅ API Gateway deployed? Move to **PHASE 4**

---

# PHASE 4: Prepare Frontend for AWS

**Time: 10 minutes**

Now your frontend needs to know about your Lambda API.

## Step 4.1: Update API URL

1. Open file `client/src/lib/queryClient.ts` in your project
2. Find this line:
   ```typescript
   const API_URL = "";
   ```
3. Replace it with your actual API URL:
   ```typescript
   const API_URL = "https://YOUR-API-URL/prod";
   ```
   Replace `YOUR-API-URL` with the first part from Phase 3.7
   
   **Example:**
   ```typescript
   const API_URL = "https://abc123def456.execute-api.ap-south-1.amazonaws.com/prod";
   ```

4. **Save the file**

## Step 4.2: Build Frontend

1. Open your terminal/command prompt
2. Navigate to your project
3. Run: `npm run build`
4. Wait for build to complete (should see ✓ built in X seconds)

✅ Build complete? Move to **PHASE 5**

---

# PHASE 5: Create S3 Bucket for Frontend

**Time: 20 minutes**

## Step 5.1: Create S3 Bucket

1. Search for **S3** in AWS Console
2. Click **S3**
3. Click **Create bucket** (orange button)
4. **Bucket name**: `my-portfolio-site-pavan-2024` (must be unique)
5. **Region**: `ap-south-1`
6. **Uncheck** "Block all public access"
7. ✅ Check the confirmation box
8. Click **Create bucket**

## Step 5.2: Upload Frontend Files

1. Click your bucket name
2. Click **Upload**
3. Click **Add files**
4. Navigate to `dist/public/` folder in your project
5. Select **all files** and **folders**:
   - `index.html`
   - `assets/` folder
   - Any image files
6. Click **Upload**
7. Wait for upload to complete (green checkmarks)

## Step 5.3: Enable Static Website Hosting

1. Click your bucket name
2. Click **Properties** tab
3. Scroll down to **Static website hosting**
4. Click **Edit**
5. Select **Enable**
6. **Index document**: `index.html`
7. **Error document**: `index.html`
8. Click **Save changes**

## Step 5.4: Make Bucket Public

1. Click **Permissions** tab
2. Scroll to **Bucket policy**
3. Click **Edit**
4. Paste this policy (replace `my-portfolio-site-pavan-2024` with your bucket name):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::my-portfolio-site-pavan-2024/*"
        }
    ]
}
```

5. Click **Save**

## Step 5.5: Get Your Website URL

1. Go to **Properties** tab
2. Scroll to **Static website hosting**
3. Copy the **Bucket website endpoint** (looks like: `http://my-portfolio-site-pavan-2024.s3-website-ap-south-1.amazonaws.com`)
4. **Save this URL** - this is your live website!

✅ S3 bucket ready? Move to **PHASE 6**

---

# PHASE 6: Test Your Live Website

**Time: 10 minutes**

## Step 6.1: Visit Your Website

1. Open the S3 website URL from Phase 5.5 in your browser
2. You should see your portfolio homepage
3. Click **Admin Login**
4. Enter credentials:
   - **Username**: `Pavan56`
   - **Password**: `Pavanreddy56@`
5. Click **Sign In**

## Step 6.2: Add Test Data

1. You should see the **Admin Dashboard**
2. Try adding a test skill:
   - Click **Skills**
   - Click **Add Skill**
   - Fill in test data
   - Click **Save**
3. You should see the new skill appear in the list

✅ If login and data saving work, your deployment is complete!

---

# PHASE 7: Update Your Content

Now that you're live, you can add your real portfolio content through the admin panel:

1. Go to your live website
2. Login as admin
3. Update each section:
   - **Home Section**: Update your name, title, profile image
   - **Skills**: Add your technical skills
   - **Projects**: Add your portfolio projects with details
   - **Blog**: Write blog posts
   - **Social Links**: Add LinkedIn, GitHub, Twitter, etc.
   - **Resume**: Upload your resume file
   - **Messages**: View contact form submissions

All data is automatically saved to DynamoDB!

---

# PHASE 8: Making Changes

When you want to update your website code:

1. Edit your React components in `client/src/`
2. Run `npm run build`
3. Update the API URL in `queryClient.ts` if needed
4. Upload the new files from `dist/public/` to S3:
   - Delete all old files from bucket
   - Upload all new files from `dist/public/`
5. Refresh your website in browser

---

# Admin Credentials

**Username**: `Pavan56`
**Password**: `Pavanreddy56@`

These are hardcoded in the Lambda function. To change them, edit `LAMBDA_CODE.js` and update:
```javascript
const ADMIN_USERNAME = "Pavan56";
const ADMIN_PASSWORD = "Pavanreddy56@";
```

Then redeploy the Lambda function.

---

# Important URLs

Save these for future reference:

| What | URL |
|------|-----|
| **AWS Console** | https://console.aws.amazon.com |
| **Your Live Website** | `http://your-bucket-name.s3-website-ap-south-1.amazonaws.com` |
| **DynamoDB Tables** | AWS Console → DynamoDB → Tables |
| **Lambda Function** | AWS Console → Lambda → portfolio-api |
| **API Gateway** | AWS Console → API Gateway → portfolio-api → Stages → prod |

---

# Troubleshooting

## Problem: Login fails on live website

**Solution**:
1. Check that API URL in `queryClient.ts` is correct
2. Make sure you ran `npm run build` after updating the URL
3. Make sure all files were uploaded to S3
4. Check that Lambda function has the correct code

## Problem: Website shows blank page

**Solution**:
1. Check that `index.html` is uploaded to S3
2. Check that Static Website Hosting is enabled
3. Try a different browser or clear cache (Ctrl+Shift+Delete)
4. Check browser console (F12) for errors

## Problem: Can't add content to database

**Solution**:
1. Check DynamoDB tables exist with correct names
2. Check Lambda has correct handler: `index.handler`
3. Check Lambda environment variable: `SESSION_SECRET = portfolio-secret-key`
4. Check API Gateway is deployed

## Problem: CORS errors

**Solution**:
1. Go to API Gateway → portfolio-api → Resources → {proxy+}
2. Click Method Response
3. Ensure CORS headers are enabled
4. Redeploy the API

---

# Cost Estimate (Monthly)

| Service | Cost |
|---------|------|
| Lambda (1M requests free) | FREE |
| DynamoDB (on-demand) | ~$1 |
| API Gateway (1M calls) | ~$3.50 |
| S3 (storage + requests) | <$1 |
| **TOTAL** | **~$5-15/month** |

---

# Success Checklist

You'll know deployment succeeded when:

- [ ] You can visit your website (S3 URL)
- [ ] You can login with admin credentials
- [ ] Admin dashboard loads
- [ ] You can add a test skill
- [ ] Skill appears in your portfolio
- [ ] Contact form works (if implemented)
- [ ] No CORS or API errors

---

# Quick Reference - Localhost vs AWS

| Scenario | API URL | Build Command |
|----------|---------|---|
| **Local Testing** | `` (empty) | `npm run build` |
| **AWS Deployment** | `https://YOUR-API-ID.execute-api.ap-south-1.amazonaws.com/prod` | `npm run build` |

Change the API_URL in `queryClient.ts`, run `npm run build`, and upload to S3!

---

**Your serverless portfolio is now live on AWS! 🚀**

For questions, refer to the AWS documentation:
- Lambda: https://docs.aws.amazon.com/lambda/
- DynamoDB: https://docs.aws.amazon.com/dynamodb/
- API Gateway: https://docs.aws.amazon.com/apigateway/
- S3: https://docs.aws.amazon.com/s3/
