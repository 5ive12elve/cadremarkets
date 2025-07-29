# Local Development Setup

## 🚀 Quick Start

### Option 1: Clean start (recommended)
```bash
./clean-start.sh
```

### Option 2: Using the convenience script
```bash
./start-dev.sh
```

### Option 3: Manual setup
```bash
# Start both API and client servers
npm run dev:all

# Or start them separately:
npm run dev          # API server only
npm run client       # Client server only
```

## 🔧 Prerequisites

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **MongoDB** (local or cloud)

## 📦 Installation

```bash
# Install root dependencies
npm install

# Install API dependencies
cd api && npm install

# Install client dependencies
cd client && npm install
```

## ⚙️ Environment Configuration

### Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGO="your-mongodb-connection-string"
MONGODB_URI="your-mongodb-connection-string"

# JWT Configuration
JWT_SECRET="your-jwt-secret"

# Back Office Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Client Configuration
CLIENT_URL=http://localhost:5173
VITE_API_URL=http://localhost:3000
```

### Optional: Firebase Configuration (for OAuth)

If you want to use Google OAuth authentication locally, add these Firebase variables to your `.env`:

```bash
# Firebase Configuration (Optional for local development)
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=your-cert-url
```

**Note**: The application will work without Firebase credentials for local development. Firebase is only required for Google OAuth authentication.

## 🌐 Access Points

- **API Server**: http://localhost:3000
- **Client Application**: http://localhost:5173
- **API Health Check**: http://localhost:3000/api/health

## 🔍 Troubleshooting

### Firebase Admin SDK Error

If you see this error:
```
FirebaseAppError: Service account object must contain a string "private_key" property.
```

**Solution**: This is expected for local development without Firebase credentials. The application will continue to run without Firebase Admin SDK initialization.

### Port Already in Use

If you get a port conflict:

```bash
# Use the clean start script (recommended)
./clean-start.sh

# Or manually kill processes
pkill -f "node api/index.js"
pkill -f "vite"

# Or use the convenience script
./start-dev.sh
```

### MongoDB Connection Issues

Ensure your MongoDB connection string is correct in the `.env` file. For local MongoDB:
```bash
MONGO="mongodb://localhost:27017/cadremarkets"
```

For MongoDB Atlas:
```bash
MONGO="mongodb+srv://username:password@cluster.mongodb.net/cadremarkets"
```

## 🧪 Testing

### API Testing
```bash
# Health check
curl http://localhost:3000/api/health

# Test endpoints
curl http://localhost:3000/api/users
```

### Client Testing
Open http://localhost:5173 in your browser to test the frontend application.

## 📝 Development Notes

- The API server runs on port 3000
- The client (Vite) server runs on port 5173
- Hot reloading is enabled for both servers
- API changes will restart the server automatically
- Client changes will reload the browser automatically

## 🚀 Production vs Development

- **Development**: Uses local environment variables and optional Firebase setup
- **Production**: Requires all Firebase credentials and uses production environment variables
- **Render Deployment**: Uses environment variables set in Render dashboard 