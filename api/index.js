import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import listingRouter from './routes/listing.route.js';
import orderRouter from './routes/order.route.js';
import serviceRouter from './routes/service.route.js';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import backOfficeRouter from './routes/backOffice.route.js';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { specs } from './swagger.js';
import { dirname, join } from 'path';
import morgan from 'morgan';
import { v4 as uuidv4 } from 'uuid';
import { logger, stream } from './utils/logger.js';
import { 
  errorHandler, 
  notFoundHandler, 
  ApiError, 
  asyncHandler, 
  validationErrorHandler, 
  duplicateKeyErrorHandler, 
  jwtErrorHandler 
} from './middleware/errorHandler.js';
import ticketRouter from './routes/ticket.route.js';
import supportRequestRoute from './routes/supportRequest.route.js';
import projectRouter from './routes/project.route.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import escapeHtml from 'escape-html';
import validator from 'validator';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = join(__dirname, '..', '.env');
logger.info('Loading environment variables from:', envPath);
dotenv.config({ path: envPath });

// Debug environment variables
logger.info('Environment Configuration:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT || 3000,
  ADMIN_USERNAME_EXISTS: !!process.env.ADMIN_USERNAME,
  ADMIN_PASSWORD_EXISTS: !!process.env.ADMIN_PASSWORD,
  JWT_SECRET_EXISTS: !!process.env.JWT_SECRET,
  CLIENT_URL: process.env.CLIENT_URL
});

if (process.env.MONGO) {
  const maskedUri = process.env.MONGO.replace(
    /(mongodb\+srv:\/\/)([^:]+):([^@]+)@/,
    '$1***:***@'
  );
  logger.debug('MONGO URI (masked):', maskedUri);
}

const app = express();

// Trust proxy for rate limiting behind load balancers/proxies
app.set('trust proxy', 1);

// Security middleware - must be first
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'", "https:", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:", "wss:"],
      frameSrc: ["'self'", "https://cadremarkets-fce26.firebaseapp.com", "https://accounts.google.com"],
      fontSrc: ["'self'", "https:", "data:"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false // Allow OAuth popups
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit auth attempts
  message: {
    error: 'Too many authentication attempts, please try again later'
  }
});

app.use(limiter);

// Request ID middleware
app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// XSS protection middleware
app.use((req, res, next) => {
  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  
  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  
  next();
});

// Helper function to sanitize objects recursively
function sanitizeObject(obj) {
  // Fields that should not have HTML entities escaped (legitimate data)
  const exemptFields = ['type', 'contactPreference', 'city', 'district', 'dimensions', 'status'];
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'string') {
        // Remove script tags and other dangerous HTML
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
          .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
          .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // Remove object tags
          .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '') // Remove embed tags
          .replace(/javascript:/gi, '') // Remove javascript: protocol
          .replace(/on\w+\s*=/gi, '') // Remove event handlers
          .trim();
        
        // Only escape HTML entities for fields that are likely to contain user input
        // Skip escaping for enum/structured data fields
        if (!exemptFields.includes(key)) {
        obj[key] = escapeHtml(obj[key]);
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        obj[key] = sanitizeObject(obj[key]);
      }
    }
  }
  return obj;
}

// CORS configuration for multiple domains
const allowedOrigins = [
  'http://localhost:5173',
  'https://cadremarkets.vercel.app',
  'https://cadremarkets.com',
  'https://www.cadremarkets.com'
];

app.use(cors({
  origin: (origin, callback) => {
    console.log('=== CORS DEBUG ===');
    console.log('Request origin:', origin);
    console.log('Allowed origins:', allowedOrigins);
    console.log('Origin allowed:', !origin || allowedOrigins.includes(origin));
    
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie']
}));

// HTTP request logging
app.use(morgan('combined', { stream }));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Mount routes
app.use('/api/user', userRouter);
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/listing', listingRouter);
app.use('/api/orders', orderRouter);
app.use('/api/services', serviceRouter);
app.use('/api/backoffice', backOfficeRouter);
app.use('/api/customer-service', ticketRouter);
app.use('/api/support', supportRequestRoute);
app.use('/api/projects', projectRouter);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    requestId: req.id
  });
});

// Test endpoint for API functionality
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Cadre Markets API is working perfectly! 🚀',
    timestamp: new Date().toISOString(),
    server: 'Render',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    environment: process.env.NODE_ENV || 'development',
    requestId: req.id,
    features: [
      'User Authentication',
      'Listing Management', 
      'Order Processing',
      'Service Booking',
      'Admin Dashboard',
      'File Upload Support'
    ]
  });
});

// Serve uploaded files only (keep these for file storage)
app.use('/uploads', express.static(path.join(__dirname, '../server/public/uploads')));
app.use('/uploads/listings', express.static(path.join(__dirname, '../server/public/uploads/listings')));
app.use('/uploads/profiles', express.static(path.join(__dirname, '../server/public/uploads/profiles')));

// Root route - API status
app.get('/', (req, res) => {
  res.json({
    message: 'Cadre Markets API is alive 🚀',
    status: 'running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      docs: '/api-docs',
      auth: '/api/auth',
      listings: '/api/listing',
      orders: '/api/orders',
      services: '/api/services'
    }
  });
});

// Commented out: No longer serving frontend from backend (deployed separately on Vercel)
// app.use(express.static(path.join(__dirname, '../client/dist')));
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../client/dist/index.html'));
// });

// Handle specific error types
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    err = validationErrorHandler(err);
  } else if (err.code === 11000) {
    err = duplicateKeyErrorHandler(err);
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    err = jwtErrorHandler(err);
  }
  next(err);
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  // Close MongoDB connection
  if (mongoose.connection.readyState === 1) {
    logger.info('Closing MongoDB connection...');
    await mongoose.connection.close();
  }

  // Exit process
  logger.info('Shutting down application...');
  process.exit(0);
};

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', {
    promise,
    reason: reason?.message,
    stack: reason?.stack
  });
});

// MongoDB Connection Handling
mongoose.connection.on('connecting', () => {
  logger.info('Connecting to MongoDB...');
});

mongoose.connection.on('connected', () => {
  logger.info('Connected to MongoDB successfully');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

logger.info('Starting server...');

mongoose
  .connect(process.env.MONGO || "mongodb+srv://sam:sam@cadremarkets.tqx98.mongodb.net/?retryWrites=true&w=majority&appName=cadremarkets")
  .then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((err) => {
    logger.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });