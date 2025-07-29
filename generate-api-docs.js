#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { specs } from './api/swagger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create docs directory if it doesn't exist
const docsDir = path.join(__dirname, 'api-docs');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

// Create the main HTML file with Swagger UI from CDN
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cadre Markets API Documentation</title>
    <meta name="description" content="Complete API documentation for Cadre Markets platform - A marketplace for art and collectibles">
    <meta name="keywords" content="API, documentation, Cadre Markets, art marketplace, collectibles">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
    <style>
        body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 2rem; 
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header h1 { margin: 0; font-size: 2.5rem; font-weight: 300; }
        .header p { margin: 0.5rem 0 0 0; opacity: 0.9; font-size: 1.1rem; }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .info-box { 
            background: #f8f9fa; 
            border-left: 4px solid #667eea; 
            padding: 1rem; 
            margin-bottom: 2rem; 
            border-radius: 4px;
        }
        .info-box h3 { margin: 0 0 0.5rem 0; color: #333; }
        .info-box p { margin: 0; color: #666; }
        .swagger-container { margin-top: 2rem; }
        .swagger-ui .topbar { display: none; }
        .swagger-ui .info .title { color: #333; }
        .swagger-ui .info .description { color: #666; }
        .swagger-ui .scheme-container { background: #f8f9fa; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Cadre Markets API</h1>
        <p>Complete API documentation for the Cadre Markets platform</p>
    </div>
    
    <div class="container">
        <div class="info-box">
            <h3>🚀 API Overview</h3>
            <p>Welcome to the Cadre Markets API documentation. This API provides endpoints for user authentication, marketplace listings, order management, and more.</p>
        </div>
        
        <div class="info-box">
            <h3>🔗 Quick Links</h3>
            <p>
                <strong>Production API:</strong> <a href="https://api.cadremarkets.com" target="_blank">https://api.cadremarkets.com</a><br>
                <strong>Main Website:</strong> <a href="https://cadremarkets.com" target="_blank">https://cadremarkets.com</a><br>
                <strong>Support:</strong> <a href="mailto:support@cadremarkets.com">support@cadremarkets.com</a>
            </p>
        </div>
        
        <div class="swagger-container">
            <div id="swagger-ui"></div>
        </div>
    </div>

    <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                spec: ${JSON.stringify(specs)},
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout",
                docExpansion: "list",
                filter: true,
                showRequestHeaders: true,
                tryItOutEnabled: true,
                customSiteTitle: "Cadre Markets API Documentation"
            });
        };
    </script>
</body>
</html>`;

// Write the HTML file
fs.writeFileSync(path.join(docsDir, 'index.html'), htmlContent);

// Copy favicon if it exists
const faviconPath = path.join(__dirname, 'client', 'public', 'Cadre-Favicon01.png');
if (fs.existsSync(faviconPath)) {
  fs.copyFileSync(faviconPath, path.join(docsDir, 'favicon.ico'));
}

// Create a simple README for the docs
const readmeContent = `# Cadre Markets API Documentation

This directory contains the static API documentation for Cadre Markets.

## Files
- \`index.html\` - Main documentation page
- \`favicon.ico\` - Site favicon

## Deployment Options

### 1. Vercel (Recommended)
\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Deploy from the api-docs directory
cd api-docs
vercel --prod
\`\`\`

### 2. Netlify
\`\`\`bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy from the api-docs directory
cd api-docs
netlify deploy --prod --dir=.
\`\`\`

### 3. GitHub Pages
1. Create a new repository
2. Upload the contents of the \`api-docs\` directory
3. Enable GitHub Pages in repository settings

### 4. Custom Domain
You can set up a custom domain like \`docs.cadremarkets.com\` or \`api-docs.cadremarkets.com\`

## Regenerating Documentation
Run this script whenever you update the API:
\`\`\`bash
node generate-api-docs.js
\`\`\`
`;

fs.writeFileSync(path.join(docsDir, 'README.md'), readmeContent);

console.log('✅ API documentation generated successfully!');
console.log('📁 Files created in: ./api-docs/');
console.log('🌐 Deploy the contents of ./api-docs/ to any static hosting service');
console.log('');
console.log('🚀 Quick deployment options:');
console.log('   • Vercel: cd api-docs && vercel --prod');
console.log('   • Netlify: cd api-docs && netlify deploy --prod --dir=.');
console.log('   • GitHub Pages: Upload api-docs contents to a new repository'); 