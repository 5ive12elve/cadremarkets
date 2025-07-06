#!/bin/bash

# Cloudinary Setup Script
echo "🚀 Setting up Cloudinary environment variables..."

# Get cloud name from user
echo "Please enter your Cloudinary cloud name:"
read CLOUD_NAME

# Create/update .env.local file
cat > .env.local << EOF
# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=${CLOUD_NAME}
VITE_CLOUDINARY_UPLOAD_PRESET=cadremarkets
VITE_CLOUDINARY_API_KEY=487469746487422
VITE_CLOUDINARY_API_SECRET=m8-84oq7zRYjquZhqp4fQ82nLtc

# Development mode
NODE_ENV=development
EOF

echo "✅ Environment variables configured!"
echo "📁 Created/updated .env.local file"
echo ""
echo "🔧 Next steps:"
echo "1. Start your development server: npm run dev"
echo "2. Try uploading an image in CreateListing"
echo "3. Check the browser console for any errors"
echo ""
echo "📊 Your Cloudinary credentials:"
echo "   Cloud Name: ${CLOUD_NAME}"
echo "   API Key: 487469746487422"
echo "   Upload Preset: cadremarkets"
echo ""
echo "🌐 Check your uploads at: https://cloudinary.com/console" 