import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';

// API Routes (handle these before static files)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Serve static files from the uploads directory
app.use('/uploads', express.static(join(__dirname, 'public/uploads')));

// In development, don't serve static files - let Vite handle it
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the client's build directory
  app.use(express.static(join(__dirname, '../client/dist')));
  
  // Handle client-side routing - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    // Only serve index.html for non-API routes
    if (!req.path.startsWith('/api/')) {
      res.sendFile(join(__dirname, '../client/dist/index.html'));
    }
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  // Log error with proper format
  const errorLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    statusCode,
    message,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress
  };
  
  // Only log stack trace in development
  if (process.env.NODE_ENV !== 'production') {
    errorLog.stack = err.stack;
  }
  
  console.error('API Error:', errorLog);
  
  // Send appropriate response based on environment
  const response = {
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? getGenericErrorMessage(statusCode)
      : message,
    timestamp: new Date().toISOString()
  };
  
  // Add stack trace only in development
  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }
  
  res.status(statusCode).json(response);
});

// Generic error messages for production
const getGenericErrorMessage = (statusCode) => {
  switch (statusCode) {
    case 400:
      return 'Bad Request';
    case 401:
      return 'Unauthorized';
    case 403:
      return 'Forbidden';
    case 404:
      return 'Not Found';
    case 409:
      return 'Conflict';
    case 422:
      return 'Unprocessable Entity';
    case 429:
      return 'Too Many Requests';
    case 500:
    default:
      return 'Internal Server Error';
  }
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    
    // Start server
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }); 