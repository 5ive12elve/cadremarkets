# 🎨 Cadre Markets

**A creative platform connecting artists with buyers while providing advertisement, filmmaking and digital services.**

Cadre Markets is a full-stack web application that serves as a marketplace for creative professionals and a service booking platform for brands and clients. The platform allows artists to showcase and sell their work while providing high-quality creative services to businesses.

## ✨ Features

### 🛍️ Marketplace
- **Artist Listings**: Upload and sell artwork through a curated marketplace
- **Product Categories**: Prints & Posters, Paintings & Drawings, Clothing & Wearables
- **Shopping Cart**: Seamless purchasing experience
- **Search & Filter**: Advanced search capabilities for finding specific artwork

### 🎥 Creative Services
- **Advertisement Production**: Professional ad creation and production services
- **Filmmaking**: Video production and cinematic content creation
- **Digital Services**: Brand amplification and digital content strategy
- **Service Booking**: Direct booking system for creative services

### 👥 User Management
- **Dual User Types**: Separate experiences for artists and brands/clients
- **Artist Profiles**: Portfolio showcase and listing management
- **Authentication**: Secure login with Google OAuth integration
- **User Dashboard**: Comprehensive management interface

### 🔐 Admin Panel
- **Back Office**: Complete administrative control
- **User Management**: Monitor and manage users
- **Order Management**: Track and process orders
- **Analytics**: Business insights and statistics
- **Service Requests**: Manage incoming service bookings

### 🌐 Multi-language Support
- **English & Arabic**: Full localization support
- **RTL Support**: Right-to-left text direction for Arabic
- **Cultural Adaptation**: Culturally appropriate fonts and layouts

### 🎨 Modern UI/UX
- **Dark/Light Theme**: Toggle between theme preferences
- **Responsive Design**: Mobile-first approach
- **Smooth Animations**: Framer Motion animations
- **Modern Components**: Tailwind CSS with custom styling

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Framer Motion** - Animation library
- **Firebase** - Authentication and file storage
- **Recharts** - Data visualization

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **Winston** - Logging system
- **Multer** - File upload handling
- **Redis** - Caching and session management

### DevOps & Security
- **Helmet** - Security middleware
- **Rate Limiting** - API protection
- **CORS** - Cross-origin resource sharing
- **Input Validation** - Data sanitization
- **Environment Variables** - Configuration management

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB instance
- Redis instance (optional, for caching)
- Firebase project (for authentication & storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cadremarkets.com.git
   cd cadremarkets.com
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install API dependencies
   cd api && npm install && cd ..
   
   # Install client dependencies
   cd client && npm install && cd ..
   ```

3. **Environment Setup**
   
   Create `.env` file in the root directory:
   ```bash
   NODE_ENV=development
   MONGO=mongodb://localhost:27017/cadremarkets
   JWT_SECRET=your-super-secure-jwt-secret-key
   CLIENT_URL=http://localhost:5173
   PORT=3000
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=secure-password
   ```

   Create `.env` file in the `client` directory:
   ```bash
   VITE_FIREBASE_API_KEY=your-firebase-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_API_URL=http://localhost:3000
   ```

4. **Start the development servers**
   ```bash
   # Start both frontend and backend concurrently
   npm run dev:all
   
   # Or start them separately:
   # Backend: npm run dev
   # Frontend: npm run client
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - API Documentation: http://localhost:3000/api-docs

## 📁 Project Structure

```
cadremarkets.com/
├── api/                    # Backend API
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   └── tests/             # API tests
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API services
│   │   ├── utils/         # Utility functions
│   │   └── locales/       # Translations
│   └── public/            # Static assets
├── server/                 # Additional server config
└── docs/                   # Documentation
```

## 🧪 Testing

```bash
# Run API tests
cd api && npm test

# Run tests with coverage
cd api && npm run test:coverage

# Run tests in watch mode
cd api && npm run test:watch
```

## 🚀 Deployment

### Production Build
```bash
# Build the client
npm run build

# Start in production mode
npm run prod
```

### Environment Variables for Production
```bash
NODE_ENV=production
MONGO=mongodb+srv://username:password@cluster.mongodb.net/cadremarkets
JWT_SECRET=your-production-jwt-secret
CLIENT_URL=https://yourdomain.com
PORT=3000
```

### Deployment Platforms
- **Vercel** (Frontend) + **Railway/Render** (Backend)
- **DigitalOcean App Platform**
- **AWS** (EC2 + RDS + S3)
- **Docker** deployment ready

## 📊 API Documentation

The API is documented using Swagger/OpenAPI. Access the documentation at:
- Development: http://localhost:3000/api-docs
- Production: https://yourdomain.com/api-docs

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: API protection against abuse
- **Input Validation**: Comprehensive data sanitization
- **CORS Configuration**: Secure cross-origin requests
- **Helmet Security**: Security headers and protection
- **MongoDB Injection Protection**: Query sanitization

## 🌍 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support, email support@cadremarkets.com or create an issue in the GitHub repository.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by the creative community
- Designed for artists and brands alike

---

**Made with ❤️ by the Cadre Markets team**
