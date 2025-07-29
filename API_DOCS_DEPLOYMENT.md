# API Documentation Deployment Guide

This guide explains how to deploy your Cadre Markets API documentation to various hosting platforms.

## 🚀 Quick Start

### Generate Documentation
```bash
npm run docs
```

### Deploy to Vercel (Recommended)
```bash
npm run docs:deploy
```

## 📁 Generated Files

After running `npm run docs`, the following files are created in the `api-docs/` directory:

- `index.html` - Main documentation page with Swagger UI
- `README.md` - Deployment instructions
- `favicon.ico` - Site favicon (if available)

## 🌐 Deployment Options

### 1. Vercel (Recommended)

**Pros**: Fast, free, automatic HTTPS, custom domains
**Best for**: Quick deployment with custom domain

```bash
# Install Vercel CLI
npm i -g vercel

# Generate docs and deploy
npm run docs:deploy

# Or manually:
npm run docs
cd api-docs
vercel --prod
```

**Custom Domain Setup**:
1. Go to Vercel dashboard
2. Select your project
3. Go to Settings → Domains
4. Add your custom domain (e.g., `docs.cadremarkets.com`)
5. Update DNS records as instructed

### 2. Netlify

**Pros**: Free tier, automatic HTTPS, form handling
**Best for**: Static sites with forms

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Generate and deploy
npm run docs
cd api-docs
netlify deploy --prod --dir=.
```

**Custom Domain Setup**:
1. Go to Netlify dashboard
2. Select your site
3. Go to Domain settings
4. Add custom domain
5. Update DNS records

### 3. GitHub Pages

**Pros**: Free, integrated with GitHub
**Best for**: Open source projects

1. Create a new repository (e.g., `cadremarkets-api-docs`)
2. Generate documentation: `npm run docs`
3. Upload contents of `api-docs/` to the repository
4. Go to Settings → Pages
5. Select source branch (usually `main`)
6. Save

**Custom Domain**:
1. Add custom domain in repository settings
2. Create a `CNAME` file in the repository with your domain

### 4. AWS S3 + CloudFront

**Pros**: Highly scalable, global CDN
**Best for**: Enterprise applications

```bash
# Install AWS CLI
npm i -g aws-cli

# Generate docs
npm run docs

# Upload to S3
aws s3 sync api-docs/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### 5. Firebase Hosting

**Pros**: Google's infrastructure, fast
**Best for**: Google ecosystem integration

```bash
# Install Firebase CLI
npm i -g firebase-tools

# Initialize Firebase
firebase init hosting

# Generate docs
npm run docs

# Deploy
firebase deploy
```

## 🔧 Custom Domain Setup

### DNS Configuration

For a custom domain like `docs.cadremarkets.com`:

1. **Add CNAME record**:
   ```
   docs.cadremarkets.com CNAME your-hosting-provider.com
   ```

2. **Or add A record** (for some providers):
   ```
   docs.cadremarkets.com A 192.168.1.1
   ```

### SSL Certificate

Most hosting providers automatically provide SSL certificates. If not:

1. **Let's Encrypt** (free)
2. **Cloudflare** (free SSL proxy)
3. **Provider's SSL** (usually included)

## 📝 Updating Documentation

### Automatic Updates

Add this to your CI/CD pipeline:

```yaml
# GitHub Actions example
- name: Generate API Docs
  run: npm run docs

- name: Deploy to Vercel
  run: npm run docs:deploy
```

### Manual Updates

```bash
# Regenerate documentation
npm run docs

# Deploy to your chosen platform
# (Follow the specific deployment steps above)
```

## 🎨 Customization

### Styling

Edit the `generate-api-docs.js` file to customize:

- Colors and branding
- Layout and typography
- Additional content sections
- Custom CSS

### Content

Modify the HTML template in `generate-api-docs.js` to add:

- Company information
- Contact details
- Usage examples
- Additional links

## 🔍 Testing

### Local Testing

```bash
# Generate docs
npm run docs

# Serve locally
cd api-docs
python3 -m http.server 8000
# or
npx serve .

# Visit http://localhost:8000
```

### Production Testing

After deployment, test:

1. **All endpoints** work correctly
2. **Authentication** flows properly
3. **Try it out** functionality works
4. **Mobile responsiveness**
5. **Loading speed**

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your API allows requests from the docs domain
2. **Authentication**: Update API URLs in the documentation
3. **Styling Issues**: Check CSS conflicts with hosting provider
4. **404 Errors**: Verify file paths and deployment structure

### Debug Commands

```bash
# Check generated files
ls -la api-docs/

# Validate HTML
npx html-validate api-docs/index.html

# Test local server
cd api-docs && python3 -m http.server 8000
```

## 📊 Analytics

### Google Analytics

Add to the HTML template in `generate-api-docs.js`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Other Analytics

- **Vercel Analytics**: Built-in with Vercel
- **Netlify Analytics**: Available in paid plans
- **Custom tracking**: Add your own analytics code

## 🔒 Security

### Best Practices

1. **HTTPS Only**: Ensure SSL is enabled
2. **CORS Configuration**: Limit allowed origins
3. **Rate Limiting**: Protect your API endpoints
4. **Authentication**: Secure sensitive endpoints

### Environment Variables

Never expose sensitive information in the documentation:

- API keys
- Database credentials
- Internal endpoints
- Admin credentials

## 📞 Support

For deployment issues:

1. **Vercel**: https://vercel.com/support
2. **Netlify**: https://www.netlify.com/support/
3. **GitHub**: https://docs.github.com/en/pages
4. **AWS**: https://aws.amazon.com/support/

---

**Remember**: Update this documentation whenever you change the deployment process or add new hosting options! 