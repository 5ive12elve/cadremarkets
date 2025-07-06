# Cloudinary Setup Guide

This guide will help you migrate from Firebase Storage to Cloudinary for image uploads.

## 🚀 Quick Setup

### 1. Create a Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Verify your email

### 2. Get Your Cloudinary Credentials

1. Log into your Cloudinary dashboard
2. Go to **Settings** → **Access Keys**
3. Copy your:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 3. Create Upload Preset

1. Go to **Settings** → **Upload**
2. Scroll down to **Upload presets**
3. Click **Add upload preset**
4. Set:
   - **Preset name**: `cadremarkets`
   - **Signing Mode**: `Unsigned`
   - **Folder**: `cadremarkets`
5. Save the preset

### 4. Configure Environment Variables

Create or update your `.env.local` file in the client directory:

```bash
# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
VITE_CLOUDINARY_UPLOAD_PRESET=cadremarkets
VITE_CLOUDINARY_API_KEY=your_api_key_here
VITE_CLOUDINARY_API_SECRET=your_api_secret_here
```

### 5. Update Cloudinary Configuration

Edit `client/src/utils/cloudinaryUpload.js` and replace:

```javascript
const CLOUDINARY_CONFIG = {
  cloudName: 'your-cloud-name', // Replace with your actual cloud name
  uploadPreset: 'cadremarkets', // This should match your preset name
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || '',
  apiSecret: import.meta.env.VITE_CLOUDINARY_API_SECRET || ''
};
```

## 📊 Cloudinary Free Tier Limits

- **Storage**: 25GB
- **Bandwidth**: 25GB/month
- **Transformations**: 25,000/month
- **File size**: 10MB per file
- **File types**: Images, videos, documents

## 🔧 Migration Steps

### Step 1: Update Components

The following components have been updated to use Cloudinary:

- ✅ `CreateListing.jsx` - Image upload for new listings
- ⏳ `UpdateListing.jsx` - Image upload for editing listings
- ⏳ `Profile.jsx` - Profile picture upload
- ⏳ `imageMigration.js` - Migrate existing Firebase images

### Step 2: Test Uploads

1. Start your development server: `npm run dev`
2. Try creating a new listing with images
3. Check the browser console for any errors
4. Verify images are uploaded to Cloudinary dashboard

### Step 3: Migrate Existing Images (Optional)

If you have existing Firebase images, you can migrate them:

```javascript
import { migrateFromFirebase } from '../utils/cloudinaryUpload';

// Migrate a single image
const newUrl = await migrateFromFirebase(oldFirebaseUrl);
```

## 🐛 Troubleshooting

### Common Issues

1. **"Upload preset not found"**
   - Check that your upload preset name matches exactly
   - Ensure the preset is set to "Unsigned"

2. **"Invalid API key"**
   - Verify your API key and secret are correct
   - Check that environment variables are loaded

3. **"File too large"**
   - Cloudinary free tier: 10MB per file
   - Compress images before upload if needed

4. **CORS errors**
   - Cloudinary handles CORS automatically
   - Check your browser's network tab for details

### Debug Mode

Add this to your component to debug uploads:

```javascript
console.log('Cloudinary Config:', {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
});
```

## 📈 Benefits of Cloudinary

- ✅ **25GB free storage** (vs Firebase's 5GB)
- ✅ **Automatic image optimization**
- ✅ **CDN delivery** for faster loading
- ✅ **Image transformations** (resize, crop, etc.)
- ✅ **Better error handling**
- ✅ **No authentication required** for uploads

## 🔄 Next Steps

1. **Update remaining components** (UpdateListing, Profile)
2. **Test thoroughly** in development
3. **Deploy to production** when ready
4. **Monitor usage** in Cloudinary dashboard
5. **Consider upgrading** if you exceed free tier

## 📞 Support

- **Cloudinary Docs**: [cloudinary.com/documentation](https://cloudinary.com/documentation)
- **Free Tier Limits**: [cloudinary.com/pricing](https://cloudinary.com/pricing)
- **API Reference**: [cloudinary.com/documentation/upload_images](https://cloudinary.com/documentation/upload_images)

---

**Note**: This migration maintains all existing functionality while providing better performance and more generous free tier limits. 