# API Documentation Deployment Guide

This guide explains how to host the Cadre Markets API documentation on your main domain instead of localhost.

## 🎯 Current Setup

- **API Server**: `https://api.cadremarkets.com` (serves docs at `/api-docs`)
- **Main Website**: `https://cadremarkets.com`
- **Goal**: Host API docs at `https://cadremarkets.com/api-docs` or `https://docs.cadremarkets.com`

## 🚀 Deployment Options

### Option 1: Subdomain (Recommended)
Host at `https://docs.cadremarkets.com` or `https://api-docs.cadremarkets.com`

### Option 2: Path on Main Domain
Host at `https://cadremarkets.com/api-docs`

### Option 3: Dedicated Domain
Host at `https://cadremarkets-api.com`

## 📋 Implementation Steps

### Step 1: Generate Static Documentation

The static documentation is already generated in the `api-docs/` folder:
- `index.html` - Main documentation page
- `openapi.json` - OpenAPI specification
- `vercel.json` - Vercel deployment configuration

### Step 2: Deploy to Vercel (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy from api-docs directory**:
   ```bash
   cd api-docs
   vercel --prod
   ```

3. **Configure Custom Domain**:
   - Go to Vercel Dashboard
   - Select your project
   - Go to Settings → Domains
   - Add your custom domain (e.g., `docs.cadremarkets.com`)

### Step 3: Alternative Deployment Options

#### A. Netlify Deployment
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy from api-docs directory
cd api-docs
netlify deploy --prod --dir=.
```

#### B. GitHub Pages
1. Create a new repository
2. Upload contents of `api-docs/` folder
3. Enable GitHub Pages in repository settings
4. Configure custom domain

#### C. Traditional Web Hosting
1. Upload contents of `api-docs/` folder to your web server
2. Configure subdomain or path routing
3. Ensure proper MIME types for `.json` files

## 🔧 Configuration

### DNS Configuration

For subdomain deployment, add these DNS records:

```
Type: CNAME
Name: docs
Value: your-deployment-url.vercel.app
```

### SSL Certificate

Most hosting providers (Vercel, Netlify, etc.) automatically provide SSL certificates.

## 📱 Features

The deployed documentation includes:

- ✅ **Interactive API Explorer**: Test endpoints directly from the browser
- ✅ **Complete Endpoint Coverage**: All API routes documented
- ✅ **Authentication Examples**: Bearer token authentication
- ✅ **Request/Response Examples**: Real examples for each endpoint
- ✅ **Search & Filter**: Easy navigation through endpoints
- ✅ **Mobile Responsive**: Works on all devices
- ✅ **Professional Styling**: Cadre Markets branding

## 🔄 Updating Documentation

When you update the API:

1. **Regenerate documentation**:
   ```bash
   node generate-api-docs.js
   ```

2. **Redeploy**:
   ```bash
   cd api-docs
   vercel --prod
   ```

## 🌐 Final URLs

After deployment, your documentation will be available at:

- **Production API**: `https://api.cadremarkets.com`
- **API Documentation**: `https://docs.cadremarkets.com` (or your chosen URL)
- **Main Website**: `https://cadremarkets.com`

## 📞 Support

For deployment issues:
- **Email**: support@cadremarkets.com
- **Documentation**: Check the generated docs for API details
- **Hosting**: Contact your hosting provider for domain configuration

## ✅ Checklist

- [ ] Choose deployment option (Vercel recommended)
- [ ] Deploy static files
- [ ] Configure custom domain
- [ ] Test all endpoints
- [ ] Update any internal links
- [ ] Verify SSL certificate
- [ ] Test mobile responsiveness
- [ ] Update documentation links in codebase

## 🎉 Success!

Once deployed, your API documentation will be:
- ✅ **Publicly accessible** at your domain
- ✅ **Always up-to-date** with your API
- ✅ **Professional and branded**
- ✅ **Interactive and user-friendly**
- ✅ **SEO optimized** for search engines 