# Portfolio Website - AWS Console Deployment Guide

Complete step-by-step guide to deploy your DevOps portfolio using **AWS Console UI** (web browser, no CLI needed).

## Prerequisites

- AWS Account: https://aws.amazon.com
- Your project files (already built and ready)
- Browser (Chrome, Firefox, Safari, Edge)

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

## Phase 1: Create DynamoDB Tables (10 minutes)

DynamoDB is where all your portfolio data lives.

### Step 1.1: Open DynamoDB Console

1. Go to https://console.aws.amazon.com
2. In the search bar at the top, type **DynamoDB**
3. Click on **DynamoDB** (from the search results)
4. Click **Create table** button

### Step 1.2: Create Table 1 - `portfolio-admins`

Fill in these details:

| Field | Value |
|-------|-------|
| **Table name** | `portfolio-admins` |
| **Partition key** | `username` (String) |
| **Billing mode** | Pay-per-request |

Then click **Create table**

**Add admin user:**
1. Once table is created, click on the table name `portfolio-admins`
2. Click **Explore items** button
3. Click **Create item** button
4. Click the **JSON** tab (top right)
5. Paste this JSON:

```json
{
  "username": {"S": "Pavan56"},
  "password": {"S": "$2b$10$3tEzLj5H7tF8jK9mL2pP5eQ6rS7tU8vW9xY0zA1bC2dE3fG4hI5jJ"},
  "id": {"S": "1"}
}
```

6. Click **Create item**

### Step 1.3: Create Table 2 - `portfolio-hero`

1. Go back to DynamoDB main page (click **Tables** in the left sidebar)
2. Click **Create table** button
3. Fill in:

| Field | Value |
|-------|-------|
| **Table name** | `portfolio-hero` |
| **Partition key** | `id` (String) |
| **Billing mode** | Pay-per-request |

4. Click **Create table**

**Add hero data:**
1. Click on `portfolio-hero` table
2. Click **Explore items** → **Create item**
3. Click **JSON** tab and paste:

```json
{
  "id": {"S": "hero-1"},
  "title": {"S": "DevOps Engineer"},
  "subtitle": {"S": "Building scalable infrastructure"},
  "bio": {"S": "Experienced in AWS, Docker, Kubernetes"},
  "profileImageUrl": {"S": "https://example.com/image.jpg"}
}
```

4. Click **Create item**

### Step 1.4: Create Table 3 - `portfolio-skills`

1. Click **Create table** button
2. Fill in:

| Field | Value |
|-------|-------|
| **Table name** | `portfolio-skills` |
| **Partition key** | `id` (String) |
| **Billing mode** | Pay-per-request |

3. Click **Create table**

### Step 1.5: Create Table 4 - `portfolio-projects`

1. Click **Create table** button
2. Fill in:

| Field | Value |
|-------|-------|
| **Table name** | `portfolio-projects` |
| **Partition key** | `id` (String) |
| **Billing mode** | Pay-per-request |

3. Click **Create table**

### Step 1.6: Create Table 5 - `portfolio-blog`

1. Click **Create table** button
2. Fill in:

| Field | Value |
|-------|-------|
| **Table name** | `portfolio-blog` |
| **Partition key** | `id` (String) |
| **Billing mode** | Pay-per-request |

3. Click **Create table**

### Step 1.7: Create Table 6 - `portfolio-messages`

1. Click **Create table** button
2. Fill in:

| Field | Value |
|-------|-------|
| **Table name** | `portfolio-messages` |
| **Partition key** | `id` (String) |
| **Billing mode** | Pay-per-request |

3. Click **Create table**

### Step 1.8: Create Table 7 - `portfolio-social`

1. Click **Create table** button
2. Fill in:

| Field | Value |
|-------|-------|
| **Table name** | `portfolio-social` |
| **Partition key** | `id` (String) |
| **Billing mode** | Pay-per-request |

3. Click **Create table**

### Step 1.9: Create Table 8 - `portfolio-resume`

1. Click **Create table** button
2. Fill in:

| Field | Value |
|-------|-------|
| **Table name** | `portfolio-resume` |
| **Partition key** | `id` (String) |
| **Billing mode** | Pay-per-request |

3. Click **Create table**

**Verify all 8 tables exist:**
Go to **Tables** in the left sidebar. You should see all 8 tables listed.

---

## Phase 2: Create Lambda Function (15 minutes)

Lambda will run your API code.

### Step 2.1: Create IAM Role (for Lambda permissions)

1. Go to https://console.aws.amazon.com
2. Search for **IAM**
3. Click on **IAM**
4. In the left sidebar, click **Roles**
5. Click **Create role** button
6. Select **AWS service** as the trusted entity type
7. Under "Use case", select **Lambda**
8. Click **Next** button
9. On "Add permissions" page:
   - Search for **AmazonDynamoDBFullAccess**
   - Check the checkbox next to it
   - Click **Next**
10. On "Name, review, and create":
    - **Role name**: `portfolio-lambda-role`
    - Click **Create role**

### Step 2.2: Build Your Frontend

The frontend is already built in your Replit environment! Just download it:

**Option A (Easiest):**
1. Go to your Replit project: https://replit.com/
2. Click on your project
3. Look for the `dist/public/` folder in the file explorer (left sidebar)
4. Download this folder to your computer

**Option B (Build Locally on Mac/Linux):**
If you're on Mac or Linux, you can build locally:
```bash
npm install
npm run build
```
This creates a `dist/public/` folder with all your frontend files.

**Note:** On Windows, the build command fails due to Replit-specific plugins. Just download the pre-built files from Replit instead (Option A).

### Step 2.3: Create Lambda Function

1. Go to https://console.aws.amazon.com
2. Search for **Lambda**
3. Click on **Lambda**
4. Click **Create function** button
5. Fill in these details:

| Field | Value |
|-------|-------|
| **Function name** | `portfolio-api` |
| **Runtime** | Node.js 18.x |
| **Architecture** | x86_64 |
| **Execution role** | `portfolio-lambda-role` (select from dropdown) |

6. Click **Create function** button

### Step 2.4: Upload Lambda Code

1. On the Lambda function page, scroll down to **Code source** section
2. Click **Upload from** dropdown → **ZIP file**
3. You need to create a ZIP file with your code:

**On your computer:**
1. Create a folder called `lambda-deploy`
2. Copy these folders into it:
   - `server/` folder
   - `shared/` folder
   - `package.json` file
   - `package-lock.json` file
3. Create a ZIP file containing all these
4. Upload this ZIP file

5. In the Lambda console, click **Upload**
6. Select your ZIP file and click **Open**
7. Click **Save** button

### Step 2.5: Set Handler Path

1. In the Lambda function page, scroll to the top
2. Find **Handler** field (currently shows something like `index.handler`)
3. Change it to: `server/lambda-handler.handler`
4. Click **Save** button

### Step 2.6: Set Environment Variables

1. In the Lambda function page, scroll down to **Environment variables** section
2. Click **Edit**
3. Click **Add environment variable**
4. Add these two:

| Key | Value |
|-----|-------|
| `AWS_REGION` | `us-east-1` |
| `SESSION_SECRET` | `your-random-secret-here` |

4. Click **Save** button

---

## Phase 3: Create API Gateway (15 minutes)

API Gateway connects your frontend to Lambda.

### Step 3.1: Create API Gateway

1. Go to https://console.aws.amazon.com
2. Search for **API Gateway**
3. Click on **API Gateway**
4. Click **Create API** button
5. Under "REST API", click **Build** button
6. Fill in:

| Field | Value |
|-------|-------|
| **API name** | `portfolio-api` |
| **Description** | Portfolio API Gateway |
| **Endpoint type** | Regional |

7. Click **Create API** button

### Step 3.2: Create Resources and Methods

1. You should see the API with a resource tree on the left
2. Click on the `/` (root) resource
3. Click **Create resource** button
4. Resource name: `api`
5. Click **Create resource**

6. Now select the `/api` resource you just created
7. Click **Create resource** button
8. Resource name: `{proxy+}` (this allows catch-all routing)
9. Check "Capture all resource paths"
10. Click **Create resource**

### Step 3.3: Add HTTP Methods

1. Select the `/{proxy+}` resource
2. Click **Create method**
3. Select **GET**
4. Click **Create method**

Repeat for: **POST**, **PUT**, **DELETE** (one by one)

### Step 3.4: Connect Methods to Lambda

For each method (GET, POST, PUT, DELETE):

1. Click on the method name
2. Under "Integration type", select **Lambda Function**
3. In the **Lambda Function** field, type: `portfolio-api`
4. Click **Save** button
5. Click **OK** when prompted to add permission

### Step 3.5: Enable CORS

1. Select the `/{proxy+}` resource
2. Click **Enable CORS**
3. Click **Enable CORS and replace existing CORS headers** button
4. Click **Yes, replace existing values** button

### Step 3.6: Deploy API

1. Click **Deploy API** button
2. **Stage**: Create a new stage called `prod`
3. Click **Deploy** button
4. You should see your **Invoke URL** - this is your API endpoint!

**Save this URL** - you'll need it for the frontend.

Example: `https://abc123.execute-api.us-east-1.amazonaws.com/prod`

---

## Phase 4: Upload Frontend to S3 (10 minutes)

S3 will host your website files.

### Step 4.1: Create S3 Bucket

1. Go to https://console.aws.amazon.com
2. Search for **S3**
3. Click on **S3**
4. Click **Create bucket** button
5. **Bucket name**: `my-portfolio-site-pavan` (must be globally unique - add a date/number if needed)
6. **Region**: `us-east-1`
7. Leave all other settings default
8. Click **Create bucket** button

### Step 4.2: Upload Frontend Files

1. Click on your bucket name to open it
2. Click **Upload** button
3. Click **Add files**
4. Navigate to your project's `client/dist/` folder
5. Select **all files inside that folder** (but NOT the dist folder itself)
6. Click **Open**
7. Scroll down and click **Upload** button

Wait for upload to complete.

### Step 4.3: Enable Static Website Hosting

1. Click on your bucket name
2. Click **Properties** tab
3. Scroll down to **Static website hosting**
4. Click **Edit**
5. Select **Enable**
6. **Index document**: `index.html`
7. **Error document**: `index.html`
8. Click **Save changes**

### Step 4.4: Make Bucket Public

1. Click on your bucket name
2. Click **Permissions** tab
3. Scroll to **Block public access (bucket settings)**
4. Click **Edit**
5. Uncheck "Block all public access"
6. Click **Save changes**
7. Type `confirm` in the confirmation box
8. Click **Confirm**

### Step 4.5: Add Bucket Policy

1. Still in **Permissions** tab
2. Scroll to **Bucket policy**
3. Click **Edit**
4. Paste this policy (replace `my-portfolio-site-pavan` with your bucket name):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicRead",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::my-portfolio-site-pavan/*"
    }
  ]
}
```

5. Click **Save changes**

### Step 4.6: Get Your Website URL

1. Click on your bucket name
2. Click **Properties** tab
3. Scroll to **Static website hosting**
4. Under "Bucket website endpoint", you'll see your URL

Example: `http://my-portfolio-site-pavan.s3-website-us-east-1.amazonaws.com`

**Save this URL** - this is your live website!

---

## Phase 5: Connect Frontend to API (5 minutes)

Your frontend needs to know where your API is.

### Step 5.1: Update Frontend Code

1. In your project, open `client/src/lib/queryClient.ts`
2. Find the line that sets the API URL
3. Change it to your API Gateway URL from Phase 3.6

It should look like:
```typescript
const API_URL = "https://abc123.execute-api.us-east-1.amazonaws.com/prod";
```

### Step 5.2: Rebuild and Redeploy

1. In terminal, run: `npm run build`
2. Go to your S3 bucket in AWS Console
3. Delete all old files (select all → Delete)
4. Upload the new files from `client/dist/` folder again

### Step 5.3: Test Your Website

1. Go to your S3 website URL from Phase 4.6
2. Your portfolio should now load!
3. Try logging in with:
   - **Username**: `Pavan56`
   - **Password**: `Pavanreddy56@`

---

## Phase 6: (Optional) Set Up CloudFront CDN (10 minutes)

CloudFront makes your website faster globally with HTTPS.

### Step 6.1: Create CloudFront Distribution

1. Go to https://console.aws.amazon.com
2. Search for **CloudFront**
3. Click on **CloudFront**
4. Click **Create distribution** button
5. **Origin domain**: Select your S3 bucket from the dropdown
6. **Name**: `portfolio-cloudfront`
7. **Viewer protocol policy**: `Redirect HTTP to HTTPS`
8. **Default root object**: `index.html`
9. Scroll to bottom and click **Create distribution**

Wait a few minutes for it to deploy (status will change from "Deploying" to "Enabled").

### Step 6.2: Get CloudFront URL

1. In CloudFront distributions list, find your distribution
2. Copy the **Distribution domain name** (looks like `d12345.cloudfront.net`)
3. Your website is now available at: `https://d12345.cloudfront.net`

This URL is much faster globally and has HTTPS by default!

---

## Your Live URLs

After completing all phases:

| What | URL |
|------|-----|
| **Website** | `http://my-portfolio-site-pavan.s3-website-us-east-1.amazonaws.com` |
| **Website (faster with HTTPS)** | `https://d12345.cloudfront.net` |
| **API** | `https://abc123.execute-api.us-east-1.amazonaws.com/prod` |
| **Admin Login** | Visit your website → click Admin panel |

---

## Testing Your Deployment

### Test 1: Visit Your Website
1. Go to your S3 website URL
2. You should see your portfolio homepage
3. Check that it looks correct

### Test 2: Check API Endpoints
Open your browser console (F12) and test these:

```javascript
// Get hero section
fetch("https://abc123.execute-api.us-east-1.amazonaws.com/prod/api/hero")
  .then(r => r.json())
  .then(console.log)

// Get skills
fetch("https://abc123.execute-api.us-east-1.amazonaws.com/prod/api/skills")
  .then(r => r.json())
  .then(console.log)
```

### Test 3: Test Admin Login
1. Go to your website
2. Click the "Admin" link or go to `/admin` path
3. Login with:
   - Username: `Pavan56`
   - Password: `Pavanreddy56@`
4. You should see the admin dashboard

---

## Updating Your Content

### Update Blog Posts, Projects, Skills
1. Log in to admin panel on your website
2. Use the forms to add/edit/delete content
3. All changes are saved to DynamoDB automatically

### Update Your Code
1. Make changes to your project locally
2. Run: `npm run build`
3. Upload new files to S3 bucket (delete old ones first)
4. Hard refresh your website (Ctrl+Shift+R)

### Update Lambda Function
1. Make code changes to `server/` folder
2. Rebuild: `npm run build`
3. Create new ZIP file with updated `server/` and `shared/` folders
4. Go to Lambda console → Click your function
5. Upload new ZIP file
6. Click **Deploy**

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| **Website shows 404 error** | Make sure you uploaded files to S3 and enabled static website hosting |
| **API returns 502 error** | Check Lambda function → Logs → CloudWatch Logs for errors |
| **Login doesn't work** | Verify admin user exists in DynamoDB `portfolio-admins` table |
| **Styles look broken** | Hard refresh browser (Ctrl+Shift+R) or wait for CloudFront cache to clear (15 min) |
| **CORS errors in browser console** | Verify CORS is enabled in API Gateway (Phase 3.5) |
| **Can't upload to S3** | Make sure bucket is public and you have bucket policy set |

---

## Cost Estimate

- **DynamoDB**: $0 - $5/month (pay-per-request)
- **Lambda**: $0 - $1/month (1M free requests/month)
- **API Gateway**: $0 - $3.50/month (3.5M free calls/month)
- **S3**: $0 - $1/month (small site storage)
- **CloudFront** (optional): $0 - $5/month

**Total: $0 - $15/month** depending on traffic

---

## Need to Delete Everything?

If you want to delete your deployment and stop charges:

1. **Delete S3 bucket**: S3 → Select bucket → Delete
2. **Delete CloudFront distribution** (if created): CloudFront → Select distribution → Delete
3. **Delete API Gateway**: API Gateway → Select API → Delete
4. **Delete Lambda function**: Lambda → Select function → Delete
5. **Delete DynamoDB tables**: DynamoDB → Tables → Delete each table
6. **Delete IAM role**: IAM → Roles → Select role → Delete

---

## Admin Credentials

- **Username**: `Pavan56`
- **Password**: `Pavanreddy56@`

These are stored in the `portfolio-admins` DynamoDB table.

---

## Support & Resources

- **AWS Lambda Docs**: https://docs.aws.amazon.com/lambda/
- **DynamoDB Docs**: https://docs.aws.amazon.com/dynamodb/
- **API Gateway Docs**: https://docs.aws.amazon.com/apigateway/
- **S3 Docs**: https://docs.aws.amazon.com/s3/
- **CloudFront Docs**: https://docs.aws.amazon.com/cloudfront/
