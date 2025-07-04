import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import escapeHtml from 'escape-html';
import validator from 'validator';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-for-testing-only';

// Import routes
import authRouter from '../routes/auth.route.js';
import userRouter from '../routes/user.route.js';
import listingRouter from '../routes/listing.route.js';
import orderRouter from '../routes/order.route.js';
import serviceRouter from '../routes/service.route.js';
import backOfficeRouter from '../routes/backOffice.route.js';

// Create Express app for testing
const app = express();

// Security middleware (with relaxed settings for testing)
app.use(helmet({
  contentSecurityPolicy: false, // Disable for testing
  crossOriginEmbedderPolicy: false
}));

// Rate limiting (relaxed for testing)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // High limit for testing
  skip: () => true // Skip rate limiting in tests
});

app.use(limiter);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
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
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'string') {
        // Remove HTML tags and escape HTML entities
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
          .replace(/<[^>]*>/g, '') // Remove all HTML tags
          .trim();
        
        // Escape any remaining HTML entities
        obj[key] = escapeHtml(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        obj[key] = sanitizeObject(obj[key]);
      }
    }
  }
  return obj;
}

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Import error handling middleware
import { 
  errorHandler, 
  notFoundHandler, 
  validationErrorHandler, 
  duplicateKeyErrorHandler, 
  jwtErrorHandler 
} from '../middleware/errorHandler.js';

// Routes
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/listing', listingRouter);
app.use('/api/orders', orderRouter); // Using /orders endpoint for tests
app.use('/api/order', orderRouter); // Also mount on /order for compatibility
app.use('/api/services', serviceRouter); // Using /services endpoint for tests  
app.use('/api/service', serviceRouter); // Also mount on /service for compatibility
app.use('/api/backoffice', backOfficeRouter);

// Health check endpoint for testing
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Test app is running' });
});

// Handle specific error types (same as main app)
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

export default app; 