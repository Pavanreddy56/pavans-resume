# AWS Serverless Portfolio Deployment Guide

**Complete step-by-step instructions to deploy your DevOps portfolio on AWS**

> **Time Required**: ~2 hours | **Cost**: ~$5-15/month | **No coding knowledge needed**

---

## Architecture Overview

```
Your Website (S3)
    ↓
API Requests (API Gateway)
    ↓
Backend Logic (Lambda)
    ↓
Database (DynamoDB)
```

---

## Prerequisites

✅ AWS Account created (https://aws.amazon.com)
✅ Built frontend files ready (`dist/public/` folder)
✅ Lambda code prepared (`LAMBDA_CODE.js`)
✅ All DynamoDB tables created

---

# PHASE 1: Verify DynamoDB Tables

**Time: 5 minutes**

You already created the 7 DynamoDB tables. Let's verify they exist:

## Step 1.1: Check DynamoDB Tables

1. Open AWS Console: https://console.aws.amazon.com
2. Search for **DynamoDB** in the search bar
3. Click **DynamoDB** from results
4. Click **Tables** in the left sidebar
5. You should see these 7 tables:
   - ✅ `portfolio-hero`
   - ✅ `portfolio-skills`
   - ✅ `portfolio-projects`
   - ✅ `portfolio-blog`
   - ✅ `portfolio-messages`
   - ✅ `portfolio-social`
   - ✅ `portfolio-resume`

**Note**: We removed `portfolio-admins` table since login is now hardcoded. If you created it earlier, you can leave it (unused) or delete it.

✅ All tables exist? Move to **PHASE 2**

---

# PHASE 2: Create and Deploy Lambda Function

**Time: 15 minutes**

## Step 2.1: Create Lambda Function

1. Search for **Lambda** in AWS Console
2. Click **Lambda** from results
3. Click **Create function** button (orange button, top right)
4. Fill in:
   - **Function name**: `portfolio-api`
   - **Runtime**: Node.js 20.x
   - **Architecture**: x86_64
   - Leave everything else as default
5. Click **Create function** button

## Step 2.2: Add Lambda Code

1. You'll see a code editor below titled "Code source"
2. You'll see a file `index.mjs` in the tabs above the editor
3. **Click on `index.mjs`** to select it
4. **Select all the code** (Ctrl+A on Windows, Cmd+A on Mac)
5. **Delete it**
6. **Copy the entire code from `LAMBDA_CODE.js`** file in your project
7. **Paste it** into the Lambda console editor
8. Click **Deploy** button

## Step 2.3: Configure Handler

1. Scroll down to find **Runtime settings** section
2. Click **Edit** button
3. Change **Handler** field to: `index.handler`
4. Click **Save** button

## Step 2.4: Add Environment Variable (JWT Secret)

1. In the same Lambda function page, scroll down to **Environment variables** section
2. Click **Edit** button
3. Click **Add environment variable**
4. Add:
   - **Key**: `SESSION_SECRET`
   - **Value**: `portfolio-secret-key`
5. Click **Save** button

## Step 2.5: Increase Timeout

1. Scroll down to **General configuration**
2. Click **Edit** button
3. Change **Timeout** to: `30` seconds (from 3)
4. Click **Save** button

✅ Lambda function created and configured? Move to **PHASE 3**

---

# PHASE 3: Create API Gateway

**Time: 20 minutes**

## Step 3.1: Create API Gateway

1. Search for **API Gateway** in AWS Console
2. Click **API Gateway** from results
3. Click **Create API** button
4. Select **REST API** (the first option)
5. Click **Build** button

## Step 3.2: Configure API Gateway

1. **API name**: `portfolio-api`
2. **Description**: Portfolio API for AWS
3. **Endpoint type**: Regional
4. Click **Create API** button

## Step 3.3: Create Resource

1. You'll see the API editor page
2. On the left, click **Resources**
3. Click on **/** (root resource)
4. Click **Create resource** button
5. **Resource name**: `api`
6. Click **Create resource** button
7. Now click on the new `/api` resource
8. Click **Create resource** button again
9. **Resource name**: `{proxy+}`
10. ✅ Check the box **Enable API Gateway CORS**
11. Click **Create resource** button

## Step 3.4: Create Method

1. Click on **/{proxy+}** resource
2. Click **Create method** button
3. Select **ANY** from dropdown
4. Click **Create method** button
5. Fill in the form:
   - **Integration type**: Lambda Function
   - **Lambda Function**: `portfolio-api` (search and select it)
   - ✅ Check "Use Lambda Proxy Integration"
6. Click **Create method** button

## Step 3.5: Configure Root Path

1. Click on the **/** (root) resource in the left panel
2. Click **Create method** button
3. Select **ANY**
4. Click **Create method**
5. Fill in:
   - **Integration type**: Lambda Function
   - **Lambda Function**: `portfolio-api`
   - ✅ Check "Use Lambda Proxy Integration"
6. Click **Create method**

## Step 3.6: Deploy API

1. Click **Deploy API** button (top, orange)
2. **Stage**: Create new stage
3. **Stage name**: `prod`
4. Click **Deploy** button

## Step 3.7: Get Your API URL

1. Click on **Stages** in left panel
2. Click on **prod** stage
3. Copy the **Invoke URL** (looks like: `https://xxxxxxx.execute-api.ap-south-1.amazonaws.com/prod`)
4. **Save this URL** - you'll need it later

✅ API Gateway created and deployed? Move to **PHASE 4**

---

# PHASE 4: Create S3 Bucket for Frontend

**Time: 20 minutes**

## Step 4.1: Create S3 Bucket

1. Search for **S3** in AWS Console
2. Click **S3** from results
3. Click **Create bucket** button (orange)
4. **Bucket name**: `my-portfolio-site-pavan-2024` (must be globally unique)
5. **Region**: `ap-south-1`
6. ✅ Uncheck "Block all public access"
7. Click checkbox to confirm you understand public access
8. Click **Create bucket** button

## Step 4.2: Upload Frontend Files

1. Click on your bucket name to open it
2. Click **Upload** button
3. Click **Add files** and select **all files from your `dist/public/` folder**:
   - `index.html`
   - `assets/` folder
   - Any images
4. Click **Upload** button
5. Wait for upload to complete (you'll see green checkmarks)

## Step 4.3: Enable Static Website Hosting

1. Click on the bucket name
2. Click **Properties** tab
3. Scroll down to **Static website hosting**
4. Click **Edit** button
5. Select **Enable**
6. **Index document**: `index.html`
7. **Error document**: `index.html` (so all routes load the app)
8. Click **Save changes** button

## Step 4.4: Make Bucket Public

1. Click on **Permissions** tab
2. Scroll to **Bucket policy**
3. Click **Edit** button
4. Copy and paste this policy (replace `your-bucket-name` with your actual bucket name):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

5. Click **Save** button

## Step 4.5: Get Your Website URL

1. Go to **Properties** tab
2. Scroll down to **Static website hosting**
3. Copy the **Bucket website endpoint** (looks like: `http://my-portfolio-site-pavan-2024.s3-website-ap-south-1.amazonaws.com`)
4. **Save this URL** - this is your live website!

✅ S3 bucket created and website hosting enabled? Move to **PHASE 5**

---

# PHASE 5: Connect Frontend to Backend

**Time: 10 minutes**

Your frontend needs to know where to send API requests. We already updated this, but verify:

1. In your project, open `client/src/lib/queryClient.ts`
2. Look for line with: `const API_URL = "https://9ezqmmm8f5.execute-api.ap-south-1.amazonaws.com/prod"`
3. Replace `9ezqmmm8f5` with the first part of YOUR API Gateway URL from Phase 3.7
4. Save the file
5. Rebuild the frontend: Run `npm run build` in your terminal
6. Wait for build to complete

## Step 5.2: Upload Updated Frontend to S3

1. Go to your S3 bucket in AWS Console
2. **Delete all files** (select all with checkbox, delete)
3. **Upload new files** from the updated `dist/public/` folder
4. Click **Upload** and wait for completion

✅ Frontend connected and uploaded? Move to **PHASE 6**

---

# PHASE 6: Testing Your Deployment

**Time: 10 minutes**

## Step 6.1: Test Login

1. Open your S3 website URL in a browser (from Phase 4.5)
2. You should see your portfolio homepage
3. Look for **Admin Login** button or link
4. Click it and try to login with:
   - **Username**: `Pavan56`
   - **Password**: `Pavanreddy56@`

✅ Login successful? You're accessing the real API!

## Step 6.2: Expected Behavior After Login

Once logged in, you should see the **Admin Dashboard** with options to:
- Edit hero section
- Manage skills (add/edit/delete)
- Manage projects (add/edit/delete)
- Write blog posts (add/edit/delete)
- Add social links (add/edit/delete)
- View contact messages
- Upload resume

All changes are automatically saved to your DynamoDB tables!

✅ Everything working? Your deployment is complete!

---

# PHASE 7: Managing Your Content

**Time: Ongoing**

## Add Content Through Admin Panel

1. Login to your website (admin login)
2. Go to Dashboard
3. You can now:
   - ✏️ Edit hero section
   - ➕ Add skills
   - ➕ Add projects
   - ✍️ Write blog posts
   - 🔗 Add social links
   - 📄 Upload resume
   - 📨 View contact messages

All content is automatically saved to DynamoDB!

---

# PHASE 8: Updating Your Website

**When you want to make changes:**

1. Edit your files in your project (React components, CSS, etc.)
2. Run `npm run build` to rebuild
3. Upload new files from `dist/public/` to S3
4. Refresh your website in the browser

---

# Troubleshooting

## Problem: "FAILED TO FETCH" when logging in

**Solution**:
1. Check that your API URL in `queryClient.ts` is correct
2. Make sure the first part matches your actual API Gateway URL
3. Rebuild and re-upload to S3

## Problem: Login fails with "Invalid credentials"

**Solution**:
1. Make sure you're using exactly: `Pavan56` and `Pavanreddy56@`
2. Check for typos in username/password
3. The login is case-sensitive

## Problem: Can't upload files to S3

**Solution**:
1. Check bucket permissions
2. Make sure bucket name is globally unique
3. Check that you have public access enabled

## Problem: API Gateway returning 403 errors

**Solution**:
1. Check Lambda has correct handler: `index.handler`
2. Check environment variable `SESSION_SECRET` is set
3. Check Lambda timeout is set to 30 seconds or more

## Problem: Website shows blank page

**Solution**:
1. Go to S3 bucket
2. Make sure `index.html` is uploaded
3. Check Static Website Hosting is enabled
4. Try a different browser or clear cache (Ctrl+Shift+Delete)

---

# Admin Login Credentials

Your admin login credentials are:

- **Username**: `Pavan56`
- **Password**: `Pavanreddy56@`

⚠️ **Note**: These are hardcoded in the Lambda function. To change them later, edit the Lambda code and update:
- `ADMIN_USERNAME = "Pavan56"`
- `ADMIN_PASSWORD = "Pavanreddy56@"`

---

# Key URLs

Save these for reference:

- **AWS Console**: https://console.aws.amazon.com
- **Your Website**: `http://my-portfolio-site-pavan-2024.s3-website-ap-south-1.amazonaws.com`
- **Lambda Function**: AWS Console → Lambda → `portfolio-api`
- **API Gateway**: AWS Console → API Gateway → `portfolio-api` → Stages → prod
- **DynamoDB Tables**: AWS Console → DynamoDB → Tables

---

# Cost Breakdown (Monthly)

| Service | Usage | Cost |
|---------|-------|------|
| Lambda | 1M requests/month | FREE (within free tier) |
| DynamoDB | ~1M read units | ~$0.25 |
| API Gateway | 1M calls | ~$3.50 |
| S3 Storage | ~100MB | ~$0.02 |
| S3 Requests | Minimal | <$0.10 |
| **TOTAL** | | **~$3.87/month** |

---

# Success Indicators

✅ You'll know deployment succeeded when:

- [ ] You can visit your website (S3 URL) and see your portfolio
- [ ] "Admin Login" button appears on the website
- [ ] You can login with `Pavan56` / `Pavanreddy56@`
- [ ] Admin dashboard loads with options to manage content
- [ ] You can add a test skill and it appears in the list
- [ ] Contact form submissions are saved to DynamoDB

---

# Next Steps

1. **Test everything** - Follow Phase 6 Testing
2. **Customize content** - Use admin panel to add your real portfolio data
3. **Share your website** - Tell people about your live portfolio
4. **Monitor costs** - Check AWS Billing every month

---

# Support & Resources

- **AWS Lambda Docs**: https://docs.aws.amazon.com/lambda/
- **DynamoDB Docs**: https://docs.aws.amazon.com/dynamodb/
- **API Gateway Docs**: https://docs.aws.amazon.com/apigateway/
- **S3 Docs**: https://docs.aws.amazon.com/s3/

---

**Congratulations! Your serverless portfolio is now deployed on AWS! 🚀**
