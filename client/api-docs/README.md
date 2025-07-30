# Cadre Markets API Documentation

This directory contains the static API documentation for Cadre Markets.

## Files
- `index.html` - Main documentation page
- `favicon.ico` - Site favicon

## Deployment Options

### 1. Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from the api-docs directory
cd api-docs
vercel --prod
```

### 2. Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy from the api-docs directory
cd api-docs
netlify deploy --prod --dir=.
```

### 3. GitHub Pages
1. Create a new repository
2. Upload the contents of the `api-docs` directory
3. Enable GitHub Pages in repository settings

### 4. Custom Domain
You can set up a custom domain like `docs.cadremarkets.com` or `api-docs.cadremarkets.com`

## Regenerating Documentation
Run this script whenever you update the API:
```bash
node generate-api-docs.js
```
