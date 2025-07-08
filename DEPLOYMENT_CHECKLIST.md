# 🚀 CADRE MARKETS DEPLOYMENT CHECKLIST

## ✅ **PRE-DEPLOYMENT PREPARATION**

### **1. Environment Variables Setup**

#### **Backend Environment Variables (Render)**
Set these in your Render dashboard:

```bash
NODE_ENV=production
MONGO=mongodb+srv://username:password@cluster.mongodb.net/cadremarkets?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-random-string-at-least-32-characters-long
CLIENT_URL=https://www.cadremarkets.com
PORT=3000
ADMIN_USERNAME=your-secure-admin-username
ADMIN_PASSWORD=your-secure-admin-password

# Firebase Admin SDK (Required for Google OAuth)
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=cadremarkets-fce26
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@cadremarkets-fce26.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40cadremarkets-fce26.iam.gserviceaccount.com
```

**📖 For detailed Firebase setup instructions, see `FIREBASE_ADMIN_SETUP.md`**

#### **Frontend Environment Variables (Vercel)**
Set this in your Vercel dashboard:

```bash
VITE_API_URL=https://api.cadremarkets.com
```

### **2. Database Setup**
- [ ] Ensure MongoDB Atlas cluster is running
- [ ] Verify database connection string is correct
- [ ] Test database connectivity from localhost
- [ ] Ensure database user has proper permissions

### **3. Domain Configuration**
- [ ] Purchase/configure domain (cadremarkets.com)
- [ ] Set up DNS records for:
  - `www.cadremarkets.com` → Vercel
  - `api.cadremarkets.com` → Render

---

## 🚀 **DEPLOYMENT STEPS**

### **Step 1: Deploy Backend to Render**

#### **1.1 Create Render Service**
- [ ] Go to [Render Dashboard](https://dashboard.render.com)
- [ ] Click "New Web Service"
- [ ] Connect your GitHub repository

#### **1.2 Configure Service Settings**
```
Name: cadremarkets-api
Environment: Node
Build Command: npm install
Start Command: npm start
Root Directory: api
```

#### **1.3 Set Environment Variables**
- [ ] Add all backend environment variables listed above
- [ ] Mark sensitive variables (MONGO, JWT_SECRET, ADMIN_*) as "Sync: false"

#### **1.4 Deploy**
- [ ] Click "Create Web Service"
- [ ] Wait for deployment to complete
- [ ] Note the generated URL (e.g., `https://cadremarkets-api.onrender.com`)

#### **1.5 Test Backend**
- [ ] Test health endpoint: `curl https://your-render-url/api/health`
- [ ] Verify database connection
- [ ] Test admin login functionality

### **Step 2: Deploy Frontend to Vercel**

#### **2.1 Create Vercel Project**
- [ ] Go to [Vercel Dashboard](https://vercel.com/dashboard)
- [ ] Click "New Project"
- [ ] Import your GitHub repository

#### **2.2 Configure Project Settings**
```
Framework Preset: Vite
Root Directory: client
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

#### **2.3 Set Environment Variables**
- [ ] Add `VITE_API_URL=https://api.cadremarkets.com`

#### **2.4 Deploy**
- [ ] Click "Deploy"
- [ ] Wait for deployment to complete

#### **2.5 Test Frontend**
- [ ] Visit the deployed URL
- [ ] Test basic functionality
- [ ] Verify API communication

---

## 🌐 **DOMAIN CONFIGURATION**

### **Backend Domain (api.cadremarkets.com)**
- [ ] In Render dashboard, go to your service
- [ ] Click "Settings" → "Custom Domains"
- [ ] Add `api.cadremarkets.com`
- [ ] Update your DNS with the provided CNAME record
- [ ] Wait for DNS propagation (up to 48 hours)

### **Frontend Domain (www.cadremarkets.com)**
- [ ] In Vercel dashboard, go to your project
- [ ] Click "Settings" → "Domains"
- [ ] Add `www.cadremarkets.com`
- [ ] Update your DNS with the provided records
- [ ] Wait for DNS propagation (up to 48 hours)

---

## 🔧 **POST-DEPLOYMENT VERIFICATION**

### **1. API Endpoints Testing**
- [ ] Health check: `curl https://api.cadremarkets.com/api/health`
- [ ] Test endpoint: `curl https://api.cadremarkets.com/api/test`
- [ ] User registration: Test signup functionality
- [ ] User login: Test authentication
- [ ] Admin panel: Test back office access

### **2. Frontend Functionality Testing**
- [ ] Visit `https://www.cadremarkets.com`
- [ ] Test user registration/login
- [ ] Test admin panel access (`/backoffice`)
- [ ] Test file uploads
- [ ] Test all major features
- [ ] Test responsive design

### **3. CORS and Cross-Domain Testing**
- [ ] Ensure frontend can communicate with backend
- [ ] Check browser console for CORS errors
- [ ] Verify authentication works across domains
- [ ] Test cookie-based sessions

### **4. Security Testing**
- [ ] Verify HTTPS is working
- [ ] Test authentication flows
- [ ] Verify admin access is restricted
- [ ] Check for exposed sensitive information

---

## 🛠️ **TROUBLESHOOTING**

### **Common Issues & Solutions**

#### **1. CORS Errors**
**Problem**: Frontend can't communicate with backend
**Solution**: 
- [ ] Verify CORS configuration in `api/index.js`
- [ ] Check that `CLIENT_URL` is set correctly in backend
- [ ] Ensure domains are properly configured

#### **2. Environment Variables Not Working**
**Problem**: API calls failing due to wrong URLs
**Solution**:
- [ ] Verify `VITE_API_URL` is set in Vercel
- [ ] Check that environment variables are properly configured in Render
- [ ] Restart services after changing environment variables

#### **3. Database Connection Issues**
**Problem**: Backend can't connect to MongoDB
**Solution**:
- [ ] Verify `MONGO` environment variable is correct
- [ ] Check MongoDB Atlas network access settings
- [ ] Ensure database user has proper permissions

#### **4. File Upload Issues**
**Problem**: File uploads not working
**Solution**:
- [ ] Verify Cloudinary/Firebase configuration
- [ ] Check API keys are set correctly
- [ ] Ensure proper CORS headers for file uploads

#### **5. Build Failures**
**Problem**: Frontend or backend won't build
**Solution**:
- [ ] Check for missing dependencies
- [ ] Verify Node.js version compatibility
- [ ] Check for syntax errors in code
- [ ] Review build logs for specific errors

---

## 📊 **MONITORING & MAINTENANCE**

### **1. Health Monitoring**
- [ ] Set up uptime monitoring for both services
- [ ] Configure error alerts
- [ ] Monitor application performance
- [ ] Set up log aggregation

### **2. Security Monitoring**
- [ ] Regularly update dependencies
- [ ] Monitor for security vulnerabilities
- [ ] Keep environment variables secure
- [ ] Monitor for suspicious activity

### **3. Performance Monitoring**
- [ ] Monitor API response times
- [ ] Track database performance
- [ ] Monitor frontend load times
- [ ] Set up performance alerts

---

## 🔗 **USEFUL LINKS**

- **Render Dashboard**: https://dashboard.render.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Project Repository**: [Your GitHub repo URL]

---

## 📝 **NOTES**

- Keep environment variables secure and never commit them to version control
- Regularly backup your database
- Monitor your application logs for issues
- Set up automated deployments for future updates
- Consider setting up staging environment for testing

---

**✅ Deployment Status**: [ ] Complete
**Last Updated**: [Date]
**Deployed By**: [Your Name] 