# Vercel Serverless Deployment Guide

## What has been configured:

### 1. **Database Connection Optimization**

- Created a database utility (`utils/database.js`) that handles connections efficiently for serverless
- Updated main `index.js` to connect to database on each request
- Configured mongoose with optimal settings for serverless:
  - `maxPoolSize: 1` - Single connection per function
  - `bufferCommands: false` - No command buffering
  - Short timeout values for quick failures

### 2. **Serverless Function Configuration**

- Modified `index.js` to export the app for Vercel
- Added middleware to ensure DB connection before each request
- Updated `vercel.json` with proper serverless configuration
- Set maximum function duration to 30 seconds

### 3. **Environment Variables**

Make sure to set these in your Vercel dashboard:

- `MONGO` - Your MongoDB connection string
- `ALLOWED_ORIGIN` - Your frontend domain
- `NODE_ENV=production`
- Any other environment variables your app uses

## Deployment Steps:

### 1. **Install Vercel CLI (if not already installed)**

```bash
npm i -g vercel
```

### 2. **Login to Vercel**

```bash
vercel login
```

### 3. **Deploy from API folder**

```bash
cd api
vercel --prod
```

### 4. **Set Environment Variables**

In your Vercel dashboard:

- Go to your project settings
- Navigate to "Environment Variables"
- Add all required variables

### 5. **Alternative: Deploy via GitHub**

- Connect your GitHub repository to Vercel
- Set the root directory to `api`
- Configure environment variables in Vercel dashboard

## Key Changes Made:

1. **Database Connection**: Now connects to MongoDB on each request (required for serverless)
2. **Export Format**: App is now exported as default export for Vercel
3. **Error Handling**: Added proper error handling for database connection failures
4. **Mongoose Configuration**: Optimized for serverless with proper timeout and pooling settings

## Testing Locally:

```bash
cd api
npm run dev
```

The server will still work locally for development, but will be optimized for Vercel serverless deployment.

## Important Notes:

- Each serverless function invocation will create a new database connection
- Connection pooling is limited to 1 connection per function
- Function has a 30-second timeout limit
- Cold starts may take 1-2 seconds for first request

Your backend is now ready for Vercel serverless deployment! 🚀
