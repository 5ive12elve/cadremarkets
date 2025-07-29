#!/bin/bash

# Cadre Markets API Documentation Deployment Script
# This script helps deploy the API documentation to various hosting platforms

set -e

echo "🚀 Cadre Markets API Documentation Deployment"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check if api-docs directory exists
if [ ! -d "api-docs" ]; then
    print_error "api-docs directory not found. Please run the documentation generation first."
    exit 1
fi

# Check if index.html exists in api-docs
if [ ! -f "api-docs/index.html" ]; then
    print_error "index.html not found in api-docs directory"
    exit 1
fi

print_status "Documentation files found"

# Function to deploy to Vercel
deploy_vercel() {
    print_info "Deploying to Vercel..."
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    cd api-docs
    
    # Deploy to Vercel
    print_info "Running Vercel deployment..."
    vercel --prod --yes
    
    print_status "Deployment to Vercel completed!"
    print_info "Check your Vercel dashboard for the deployment URL"
    print_info "To add a custom domain, go to Settings → Domains in your Vercel dashboard"
}

# Function to deploy to Netlify
deploy_netlify() {
    print_info "Deploying to Netlify..."
    
    # Check if Netlify CLI is installed
    if ! command -v netlify &> /dev/null; then
        print_warning "Netlify CLI not found. Installing..."
        npm install -g netlify-cli
    fi
    
    cd api-docs
    
    # Deploy to Netlify
    print_info "Running Netlify deployment..."
    netlify deploy --prod --dir=.
    
    print_status "Deployment to Netlify completed!"
    print_info "Check your Netlify dashboard for the deployment URL"
}

# Function to prepare for traditional hosting
prepare_traditional() {
    print_info "Preparing files for traditional hosting..."
    
    # Create a zip file for easy upload
    cd api-docs
    zip -r ../api-docs.zip .
    cd ..
    
    print_status "Files prepared for traditional hosting"
    print_info "Upload the contents of the api-docs/ directory to your web server"
    print_info "Or use the generated api-docs.zip file"
}

# Main menu
echo ""
echo "Choose deployment option:"
echo "1) Deploy to Vercel (Recommended)"
echo "2) Deploy to Netlify"
echo "3) Prepare for traditional hosting"
echo "4) Show deployment URLs"
echo "5) Exit"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        deploy_vercel
        ;;
    2)
        deploy_netlify
        ;;
    3)
        prepare_traditional
        ;;
    4)
        echo ""
        print_info "Current API Documentation URLs:"
        echo "• Local API Docs: http://localhost:3000/api-docs"
        echo "• Production API: https://api.cadremarkets.com"
        echo "• Main Website: https://cadremarkets.com"
        echo ""
        print_info "After deployment, your docs will be available at your chosen domain"
        ;;
    5)
        print_info "Exiting..."
        exit 0
        ;;
    *)
        print_error "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
print_status "Deployment process completed!"
echo ""
print_info "Next steps:"
echo "1. Configure your custom domain (if using Vercel/Netlify)"
echo "2. Update DNS records if needed"
echo "3. Test the deployed documentation"
echo "4. Update any internal links to point to the new URL"
echo ""
print_info "For detailed instructions, see: API_DOCS_DEPLOYMENT.md" 