# Vercel Environment Variables Check & Setup

## Current Issue:

Your backend is deployed but blocking CORS requests from localhost:5173

## Required Environment Variables in Vercel Dashboard:

### 1. MongoDB Connection

```
MONGO=your_mongodb_connection_string
```

### 2. CORS Settings

```
ALLOWED_ORIGIN=http://localhost:5173
```

### 3. Firebase Settings

```
FIREBASE_SERVICE_ACCOUNT_KEY=your_firebase_service_account_json
FIREBASE_PROJECT_ID=realstate13-fbfaa
```

### 4. Environment

```
NODE_ENV=production
```

## Steps to Fix:

### Option 1: Update Vercel Environment Variables

1. Go to your Vercel Dashboard
2. Select your project: https://real-state-gray.vercel.app
3. Go to Settings → Environment Variables
4. Add/Update these variables:
   - `ALLOWED_ORIGIN` = `http://localhost:5173`
   - Ensure all other variables are set correctly

### Option 2: Quick Test - Temporarily Allow All Origins

Update your backend CORS configuration to allow all origins for testing:

```javascript
const corsOptions = {
  origin: true, // Allow all origins for testing
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};
```

### Option 3: Deploy Backend Again

After updating environment variables, redeploy:

```bash
cd api
vercel --prod
```

## Testing Commands:

```bash
# Test if backend is responding
curl https://real-state-gray.vercel.app/api/auth/signout

# Start frontend
cd client
npm run dev
```
