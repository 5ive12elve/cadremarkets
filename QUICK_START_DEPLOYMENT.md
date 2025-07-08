# 🚀 Quick Start Deployment Guide

## ⚡ **5-Minute Deployment**

### **Prerequisites**
- GitHub repository with your code
- MongoDB Atlas database
- Domain name (cadremarkets.com)

---

## 🎯 **Step 1: Deploy Backend (Render)**

1. **Go to Render**: https://dashboard.render.com
2. **Create Web Service**:
   - Connect your GitHub repo
   - Name: `cadremarkets-api`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Root Directory: `api`

3. **Set Environment Variables**:
   ```
   NODE_ENV=production
   MONGO=mongodb+srv://your-db-url
   JWT_SECRET=your-32-char-secret
   CLIENT_URL=https://www.cadremarkets.com
   PORT=3000
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=secure-password
   ```

4. **Deploy** → Wait for completion

---

## 🌐 **Step 2: Deploy Frontend (Vercel)**

1. **Go to Vercel**: https://vercel.com/dashboard
2. **Create Project**:
   - Import your GitHub repo
   - Framework: `Vite`
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Set Environment Variable**:
   ```
   VITE_API_URL=https://api.cadremarkets.com
   ```

4. **Deploy** → Wait for completion

---

## 🔗 **Step 3: Configure Domains**

### **Backend Domain**
- Render Dashboard → Settings → Custom Domains
- Add: `api.cadremarkets.com`
- Update DNS with CNAME record

### **Frontend Domain**
- Vercel Dashboard → Settings → Domains
- Add: `www.cadremarkets.com`
- Update DNS with provided records

---

## ✅ **Step 4: Test**

```bash
# Test backend
curl https://api.cadremarkets.com/api/health

# Test frontend
open https://www.cadremarkets.com
```

---

## 🆘 **Need Help?**

- **Detailed Guide**: See `DEPLOYMENT_CHECKLIST.md`
- **Troubleshooting**: See `DEPLOYMENT_GUIDE.md`
- **Run Script**: `./deploy.sh`

---

**🎉 You're Done!** Your app should now work exactly like localhost. 