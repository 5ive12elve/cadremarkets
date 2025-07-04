import { logger } from '../utils/logger.js';

// Custom error class
export class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Error handler middleware
export const errorHandler = (err, req, res, next) => {
  const { statusCode = 500, message } = err;
  
  // Log error details
  logger.error('API Error:', {
    requestId: req.id,
    method: req.method,
    url: req.originalUrl,
    statusCode,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Send appropriate response based on environment
  const errorResponse = {
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? getGenericErrorMessage(statusCode)
      : message,
    requestId: req.id,
    timestamp: new Date().toISOString()
  };

  // Add stack trace only in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};

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

// 404 handler
export const notFoundHandler = (req, res, next) => {
  const error = new ApiError(404, `Route ${req.originalUrl} not found`);
  next(error);
};

// Async error wrapper
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Validation error handler
export const validationErrorHandler = (err) => {
  const errors = Object.values(err.errors).map(error => error.message);
  const message = `Invalid input data: ${errors.join(', ')}`;
  return new ApiError(400, message);
};

// Mongoose duplicate key error handler
export const duplicateKeyErrorHandler = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const message = `${field} already exists`;
  return new ApiError(409, message);
};

// JWT error handler
export const jwtErrorHandler = (err) => {
  if (err.name === 'JsonWebTokenError') {
    return new ApiError(401, 'Invalid token');
  }
  if (err.name === 'TokenExpiredError') {
    return new ApiError(401, 'Token expired');
  }
  return new ApiError(401, 'Authentication failed');
}; 