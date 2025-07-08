# 🔥 Firebase Admin SDK Setup Guide

## 🎯 **Problem Solved**
Your production deployment was failing with 401 Unauthorized errors because the backend wasn't verifying Firebase tokens from the frontend. This guide fixes that by setting up Firebase Admin SDK.

---

## 📋 **What Was Wrong**

### **Before (Insecure)**
```javascript
// Frontend sent Firebase access token
tokenId: result.user.accessToken

// Backend trusted frontend data without verification
const { email, name, photo, tokenId } = req.body;
// No verification of the token!
```

### **After (Secure)**
```javascript
// Frontend sends Firebase ID token
const idToken = await result.user.getIdToken();
tokenId: idToken

// Backend verifies the token with Firebase Admin
const firebaseResult = await verifyFirebaseToken(tokenId);
if (!firebaseResult.success) {
  return next(errorHandler(401, 'Invalid Google token'));
}
```

---

## 🚀 **Setup Steps**

### **Step 1: Get Firebase Service Account Key**

1. **Go to Firebase Console**: https://console.firebase.google.com
2. **Select your project**: `cadremarkets-fce26`
3. **Go to Project Settings** (gear icon)
4. **Service Accounts tab**
5. **Click "Generate new private key"**
6. **Download the JSON file**

### **Step 2: Extract Environment Variables**

From the downloaded JSON file, extract these values:

```json
{
  "type": "service_account",
  "project_id": "cadremarkets-fce26",
  "private_key_id": "your-private-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@cadremarkets-fce26.iam.gserviceaccount.com",
  "client_id": "your-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40cadremarkets-fce26.iam.gserviceaccount.com"
}
```

### **Step 3: Set Environment Variables in Render**

Add these to your Render backend environment variables:

```bash
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

**⚠️ Important**: 
- Copy the `private_key` exactly as it appears in the JSON
- Include the `\n` characters in the private key
- Set `FIREBASE_PRIVATE_KEY` as a single line with `\n` characters

---

## 🔧 **Files Updated**

### **1. Backend Files**
- `api/config/firebase.js` - Firebase Admin SDK configuration
- `api/controllers/auth.controller.js` - Updated Google OAuth to verify tokens
- `api/package.json` - Added `firebase-admin` dependency

### **2. Frontend Files**
- `client/src/components/OAuth.jsx` - Now sends Firebase ID token instead of access token

---

## 🧪 **Testing**

### **Local Testing**
1. Set up environment variables in your `.env` file
2. Test Google OAuth login
3. Check server logs for Firebase verification messages

### **Production Testing**
1. Deploy with new environment variables
2. Test Google OAuth on production
3. Verify no more 401 errors

---

## 🔒 **Security Benefits**

1. **Token Verification**: Backend now verifies Firebase tokens with Google
2. **Data Integrity**: Uses verified data from Firebase, not trusted frontend data
3. **Prevents Spoofing**: Users can't fake Google authentication
4. **Proper OAuth Flow**: Follows OAuth 2.0 best practices

---

## 🛠️ **Troubleshooting**

### **Common Issues**

1. **"Invalid private key" error**
   - Make sure `FIREBASE_PRIVATE_KEY` includes `\n` characters
   - Copy the entire private key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`

2. **"Project ID mismatch" error**
   - Verify `FIREBASE_PROJECT_ID` matches your Firebase project
   - Should be `cadremarkets-fce26`

3. **"Service account not found" error**
   - Check `FIREBASE_CLIENT_EMAIL` is correct
   - Ensure the service account exists in Firebase Console

### **Debug Commands**
```bash
# Check if Firebase Admin is initialized
curl https://api.cadremarkets.com/api/health

# Test Google OAuth
# Try logging in with Google on the frontend
```

---

## 📝 **Environment Variables Summary**

### **Required for Production**
```bash
# Existing variables
NODE_ENV=production
MONGO=mongodb+srv://...
JWT_SECRET=your-secret
CLIENT_URL=https://www.cadremarkets.com
PORT=3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=password

# New Firebase variables
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

---

**🎉 Result**: Your Google OAuth will now work securely in production! 