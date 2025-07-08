#!/bin/bash

# 🚀 CADRE MARKETS DEPLOYMENT SCRIPT
# This script helps deploy the application to Vercel (frontend) and Render (backend)

set -e

echo "🚀 Starting CADRE MARKETS deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "Dependencies check passed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install root dependencies
    npm install
    
    # Install client dependencies
    cd client
    npm install
    cd ..
    
    # Install API dependencies
    cd api
    npm install
    cd ..
    
    print_success "Dependencies installed successfully"
}

# Build the application
build_application() {
    print_status "Building application..."
    
    # Build client
    cd client
    npm run build
    cd ..
    
    print_success "Application built successfully"
}

# Check environment variables
check_environment() {
    print_status "Checking environment variables..."
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        print_warning "No .env file found. You'll need to set environment variables in your deployment platforms."
    else
        print_success ".env file found"
    fi
    
    # List required environment variables
    echo ""
    print_status "Required environment variables for deployment:"
    echo ""
    echo "🔧 BACKEND (Render):"
    echo "  - NODE_ENV=production"
    echo "  - MONGO=mongodb+srv://your-production-db-url"
    echo "  - JWT_SECRET=your-super-secure-random-string"
    echo "  - CLIENT_URL=https://www.cadremarkets.com"
    echo "  - PORT=3000"
    echo "  - ADMIN_USERNAME=your-secure-admin"
    echo "  - ADMIN_PASSWORD=your-secure-password"
    echo ""
    echo "🌐 FRONTEND (Vercel):"
    echo "  - VITE_API_URL=https://api.cadremarkets.com"
    echo ""
}

# Deploy to Render (Backend)
deploy_backend() {
    print_status "Deploying backend to Render..."
    
    echo ""
    print_warning "To deploy to Render:"
    echo "1. Go to https://dashboard.render.com"
    echo "2. Click 'New Web Service'"
    echo "3. Connect your GitHub repository"
    echo "4. Configure settings:"
    echo "   - Name: cadremarkets-api"
    echo "   - Environment: Node"
    echo "   - Build Command: npm install"
    echo "   - Start Command: npm start"
    echo "   - Root Directory: api"
    echo "5. Set environment variables (see list above)"
    echo "6. Click 'Create Web Service'"
    echo ""
    
    read -p "Press Enter when you've completed the Render deployment..."
    print_success "Backend deployment initiated"
}

# Deploy to Vercel (Frontend)
deploy_frontend() {
    print_status "Deploying frontend to Vercel..."
    
    echo ""
    print_warning "To deploy to Vercel:"
    echo "1. Go to https://vercel.com/dashboard"
    echo "2. Click 'New Project'"
    echo "3. Import your GitHub repository"
    echo "4. Configure settings:"
    echo "   - Framework Preset: Vite"
    echo "   - Root Directory: client"
    echo "   - Build Command: npm run build"
    echo "   - Output Directory: dist"
    echo "   - Install Command: npm install"
    echo "5. Set environment variable: VITE_API_URL=https://api.cadremarkets.com"
    echo "6. Click 'Deploy'"
    echo ""
    
    read -p "Press Enter when you've completed the Vercel deployment..."
    print_success "Frontend deployment initiated"
}

# Configure custom domains
configure_domains() {
    print_status "Configuring custom domains..."
    
    echo ""
    print_warning "Domain Configuration Steps:"
    echo ""
    echo "🔧 Backend Domain (api.cadremarkets.com):"
    echo "1. In Render dashboard, go to your service"
    echo "2. Click 'Settings' → 'Custom Domains'"
    echo "3. Add 'api.cadremarkets.com'"
    echo "4. Update your DNS with the provided CNAME record"
    echo ""
    echo "🌐 Frontend Domain (www.cadremarkets.com):"
    echo "1. In Vercel dashboard, go to your project"
    echo "2. Click 'Settings' → 'Domains'"
    echo "3. Add 'www.cadremarkets.com'"
    echo "4. Update your DNS with the provided records"
    echo ""
    
    read -p "Press Enter when you've completed domain configuration..."
    print_success "Domain configuration completed"
}

# Test deployment
test_deployment() {
    print_status "Testing deployment..."
    
    echo ""
    print_warning "Test these endpoints after deployment:"
    echo ""
    echo "🔧 Backend Tests:"
    echo "  curl https://api.cadremarkets.com/api/health"
    echo "  curl https://api.cadremarkets.com/api/test"
    echo ""
    echo "🌐 Frontend Tests:"
    echo "  Visit https://www.cadremarkets.com"
    echo "  Test user registration/login"
    echo "  Test admin panel access"
    echo "  Test file uploads"
    echo "  Test all major features"
    echo ""
    
    read -p "Press Enter when you've completed testing..."
    print_success "Deployment testing completed"
}

# Main deployment flow
main() {
    echo "🎯 CADRE MARKETS DEPLOYMENT"
    echo "=========================="
    echo ""
    
    check_dependencies
    install_dependencies
    build_application
    check_environment
    
    echo ""
    print_status "Starting deployment process..."
    echo ""
    
    deploy_backend
    deploy_frontend
    configure_domains
    test_deployment
    
    echo ""
    print_success "🎉 Deployment process completed!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Monitor your deployments in Render and Vercel dashboards"
    echo "2. Set up monitoring and alerts"
    echo "3. Configure SSL certificates (usually automatic)"
    echo "4. Set up backup strategies"
    echo "5. Monitor application performance"
    echo ""
    echo "🔗 Useful Links:"
    echo "- Render Dashboard: https://dashboard.render.com"
    echo "- Vercel Dashboard: https://vercel.com/dashboard"
    echo "- MongoDB Atlas: https://cloud.mongodb.com"
    echo ""
}

# Run main function
main "$@" 