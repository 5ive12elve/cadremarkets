#!/bin/bash

# Update API Documentation Script for Client
# This script regenerates the API documentation and copies it to the client

set -e

echo "🔄 Updating API Documentation for Client..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Go to project root
cd ..

# Check if generate-api-docs.js exists
if [ ! -f "generate-api-docs.js" ]; then
    print_warning "generate-api-docs.js not found. Creating it..."
    # You can add the content here if needed
fi

# Regenerate API documentation
print_status "Regenerating API documentation..."
node generate-api-docs.js

# Copy to client public directory
print_status "Copying to client public directory..."
cp -r api-docs client/public/

# Copy to client root directory (for Vercel)
print_status "Copying to client root directory..."
cp -r api-docs client/

print_status "API documentation updated successfully!"
echo ""
print_status "Next steps:"
echo "1. Commit and push the changes"
echo "2. Deploy to Vercel: vercel --prod"
echo "3. The docs will be available at: https://cadremarkets.com/api-docs" 