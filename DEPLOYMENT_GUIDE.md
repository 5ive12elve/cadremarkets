# 🚀 CADRE MARKETS DEPLOYMENT GUIDE

## 📋 **DEPLOYMENT OVERVIEW**
- **Frontend**: Vercel (www.cadremarkets.com)
- **Backend**: Render (api.cadremarkets.com)
- **Database**: MongoDB Atlas
- **File Storage**: Cloudinary/Firebase

---

## ✅ **PRE-DEPLOYMENT CHECKLIST**

### 1. **Environment Variables Setup**

#### **For Render (Backend)**
Create these environment variables in your Render dashboard:

```bash
NODE_ENV=production
MONGO=mongodb+srv://your-production-db-url
JWT_SECRET=your-super-secure-random-string-at-least-32-chars
CLIENT_URL=https://www.cadremarkets.com
PORT=3000
ADMIN_USERNAME=your-secure-admin
ADMIN_PASSWORD=your-secure-password
```

#### **For Vercel (Frontend)**
Add these environment variables in your Vercel dashboard:

```bash
VITE_API_URL=https://api.cadremarkets.com
```

### 2. **Domain Configuration**

#### **DNS Records Setup**
Configure these DNS records with your domain provider:

```
Type: A
Name: @
Value: [Vercel IP] (Vercel will provide this)

Type: CNAME
Name: www
Value: [Vercel domain] (Vercel will provide this)

Type: CNAME
Name: api
Value: [Render domain] (Render will provide this)
```

---

## 🚀 **DEPLOYMENT STEPS**

### **Step 1: Deploy Backend to Render**

1. **Connect Repository**
   - Go to Render dashboard
   - Click "New Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   ```
   Name: cadremarkets-api
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   Root Directory: api
   ```

3. **Set Environment Variables**
   - Add all the backend environment variables listed above

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note the generated URL (e.g., `https://cadremarkets-api.onrender.com`)

### **Step 2: Deploy Frontend to Vercel**

1. **Connect Repository**
   - Go to Vercel dashboard
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Project**
   ```
   Framework Preset: Vite
   Root Directory: client
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **Set Environment Variables**
   - Add `VITE_API_URL=https://api.cadremarkets.com`

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete

### **Step 3: Configure Custom Domains**

#### **Backend Domain (api.cadremarkets.com)**
1. In Render dashboard, go to your service
2. Click "Settings" → "Custom Domains"
3. Add `api.cadremarkets.com`
4. Update your DNS with the provided CNAME record

#### **Frontend Domain (www.cadremarkets.com)**
1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add `www.cadremarkets.com`
4. Update your DNS with the provided records

---

## 🔧 **POST-DEPLOYMENT VERIFICATION**

### **1. Test API Endpoints**
```bash
# Health check
curl https://api.cadremarkets.com/api/health

# Test endpoint
curl https://api.cadremarkets.com/api/test
```

### **2. Test Frontend**
- Visit `https://www.cadremarkets.com`
- Test user registration/login
- Test admin panel access
- Test file uploads
- Test all major features

### **3. Test CORS**
- Ensure frontend can communicate with backend
- Check browser console for CORS errors
- Verify authentication works across domains

---

## 🛠️ **TROUBLESHOOTING**

### **Common Issues & Solutions**

#### **1. CORS Errors**
**Problem**: Frontend can't communicate with backend
**Solution**: 
- Verify CORS configuration in `api/index.js`
- Check that `CLIENT_URL` is set correctly in backend
- Ensure domains are properly configured

#### **2. Environment Variables Not Working**
**Problem**: API calls failing due to wrong URLs
**Solution**:
- Verify `VITE_API_URL` is set in Vercel
- Check that environment variables are properly configured in Render
- Restart services after changing environment variables

#### **3. Database Connection Issues**
**Problem**: Backend can't connect to MongoDB
**Solution**:
- Verify `MONGO` environment variable is correct
- Check MongoDB Atlas network access settings
- Ensure database user has proper permissions

#### **4. File Upload Issues**
**Problem**: File uploads not working
**Solution**:
- Verify Cloudinary/Firebase configuration
- Check API keys are set correctly
- Ensure proper CORS headers for file uploads

---

## 📊 **MONITORING & MAINTENANCE**

### **1. Health Checks**
- Monitor `/api/health` endpoint
- Set up uptime monitoring
- Configure error alerts

### **2. Logs**
- Check Render logs for backend issues
- Check Vercel logs for frontend issues
- Monitor application performance

### **3. Security**
- Regularly update dependencies
- Monitor for security vulnerabilities
- Keep environment variables secure

---

## 🔒 **SECURITY CONSIDERATIONS**

### **✅ Already Implemented**
- Helmet security headers
- Rate limiting
- Input sanitization
- JWT authentication
- CORS protection

### **⚠️ Additional Recommendations**
- Set up SSL certificates (automatic with Vercel/Render)
- Configure proper cookie settings
- Implement request logging
- Set up backup strategies

---

## 📞 **SUPPORT**

If you encounter issues during deployment:

1. **Check Logs**: Review deployment logs in both platforms
2. **Verify Configuration**: Double-check environment variables
3. **Test Locally**: Ensure everything works in development
4. **Contact Support**: Use platform support if needed

---

## 🎯 **SUCCESS CRITERIA**

Your deployment is successful when:
- ✅ Frontend loads at `https://www.cadremarkets.com`
- ✅ Backend responds at `https://api.cadremarkets.com`
- ✅ User authentication works
- ✅ Admin panel is accessible
- ✅ File uploads function properly
- ✅ All features work as expected

---

**Good luck with your deployment! 🚀** 