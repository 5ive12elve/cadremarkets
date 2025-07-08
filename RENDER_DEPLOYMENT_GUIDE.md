# 🚀 Render Deployment Guide & Troubleshooting

## 📋 Pre-Deployment Checklist

### ✅ Required Environment Variables

Set these in your Render dashboard under **Environment Variables**:

#### Core Variables
```
NODE_ENV=production
PORT=3000
MONGO=<your-mongodb-connection-string>
JWT_SECRET=<your-secure-jwt-secret>
CLIENT_URL=https://www.cadremarkets.com
ADMIN_USERNAME=<your-admin-username>
ADMIN_PASSWORD=<your-admin-password>
```

#### Firebase Admin SDK Variables
```
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=cadremarkets-fce26
FIREBASE_PRIVATE_KEY_ID=<from-firebase-console>
FIREBASE_PRIVATE_KEY=<from-firebase-console>
FIREBASE_CLIENT_EMAIL=<from-firebase-console>
FIREBASE_CLIENT_ID=<from-firebase-console>
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=<from-firebase-console>
```

## 🔧 Deployment Steps

### 1. Render Dashboard Setup
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `cadremarkets-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `api`

### 2. Environment Variables Setup
1. In your service settings, go to **"Environment"** tab
2. Add all required variables listed above
3. Make sure `sync: false` for sensitive variables (MONGO, JWT_SECRET, etc.)

### 3. Deploy
1. Click **"Create Web Service"**
2. Wait for the build to complete
3. Check the logs for any errors

## 🚨 Troubleshooting 404 Errors

### Step 1: Check Service Status
- Go to Render Dashboard
- Find your `cadremarkets-api` service
- Check if status is **"Live"** (green)
- If not, click **"Manual Deploy"**

### Step 2: Check Render Logs
1. Click on your service
2. Go to **"Logs"** tab
3. Look for these common errors:

#### ❌ "Application Error"
**Cause**: Missing environment variables or syntax errors
**Solution**: 
- Check all environment variables are set
- Verify MONGO connection string
- Check for JavaScript syntax errors

#### ❌ "Failed to connect to MongoDB"
**Cause**: Invalid MongoDB connection string or network issues
**Solution**:
- Verify MongoDB Atlas connection string
- Check IP whitelist in MongoDB Atlas
- Test connection string locally

#### ❌ "dotenv: ENOENT"
**Cause**: Missing .env file (not needed on Render)
**Solution**: Set environment variables in Render dashboard

#### ❌ "Port already in use"
**Cause**: PORT environment variable conflict
**Solution**: Ensure PORT=3000 is set

#### ❌ "Module not found"
**Cause**: Missing dependencies
**Solution**: Check package.json and run npm install

### Step 3: Test API Endpoints

Test these endpoints to verify your server is running:

```bash
# Root endpoint
curl https://api.cadremarkets.com/

# Health check
curl https://api.cadremarkets.com/api/health

# Test endpoint
curl https://api.cadremarkets.com/api/test
```

Expected responses:
- **Root**: JSON with API status
- **Health**: JSON with server health info
- **Test**: JSON with detailed API info

### Step 4: Manual Health Check

If endpoints return 404, your server isn't starting. Check:

1. **Environment Variables**: All required variables set
2. **MongoDB Connection**: Valid connection string
3. **Code Syntax**: No JavaScript errors
4. **Dependencies**: All packages installed

## 🔍 Diagnostic Commands

### Run Local Health Check
```bash
cd api
npm install
NODE_ENV=production node index.js
```

### Test MongoDB Connection
```bash
# Add this to your index.js temporarily
console.log('MongoDB Connection String:', process.env.MONGO);
console.log('MongoDB Ready State:', mongoose.connection.readyState);
```

### Check Environment Variables
```bash
# Add this to your index.js temporarily
console.log('Environment Variables:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', process.env.PORT);
console.log('- MONGO:', process.env.MONGO ? 'Set' : 'Missing');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Missing');
```

## 🛠️ Common Fixes

### Fix 1: Missing Environment Variables
1. Go to Render Dashboard → Your Service → Environment
2. Add missing variables
3. Redeploy manually

### Fix 2: MongoDB Connection Issues
1. Check MongoDB Atlas connection string
2. Verify IP whitelist includes Render's IPs
3. Test connection string locally

### Fix 3: Firebase Admin SDK Issues
1. Download service account key from Firebase Console
2. Set all Firebase environment variables
3. Verify FIREBASE_PROJECT_ID matches your project

### Fix 4: Port Issues
1. Ensure PORT=3000 in environment variables
2. Check no other services use the same port

## 📞 Getting Help

### Render Support
- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)

### Debugging Steps
1. Check Render logs first
2. Test endpoints manually
3. Verify environment variables
4. Test MongoDB connection
5. Check for syntax errors

### Share for Help
When asking for help, include:
- Render service logs
- Environment variables (without sensitive values)
- Error messages
- Steps you've already tried

## ✅ Success Indicators

Your deployment is successful when:
- ✅ Service status shows "Live" (green)
- ✅ https://api.cadremarkets.com/ returns JSON
- ✅ https://api.cadremarkets.com/api/health returns healthy status
- ✅ No errors in Render logs
- ✅ Frontend can connect to API

## 🔄 Redeployment

To redeploy:
1. Go to Render Dashboard
2. Select your service
3. Click **"Manual Deploy"**
4. Wait for build to complete
5. Check logs for errors

---

**Need immediate help?** Check the logs in your Render dashboard and share the specific error message! 