import { logger } from './logger.js';

// Error types
export const ErrorTypes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR'
};

// Custom API Error class
export class ApiError extends Error {
  constructor(statusCode, message, type = ErrorTypes.INTERNAL_SERVER_ERROR, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.type = type;
    this.details = details;
    this.success = false;
    this.timestamp = new Date().toISOString();

    // Log error when created
    logger.error(`${this.type}: ${this.message}`, {
      statusCode: this.statusCode,
      details: this.details,
      stack: this.stack
    });
  }
}

// Error handler factory
export const errorHandler = (statusCode, message, type, details) => {
  return new ApiError(statusCode, message, type, details);
};

// Validation error handler
export const validationError = (message, details) => {
  return new ApiError(400, message, ErrorTypes.VALIDATION_ERROR, details);
};

// Authentication error handler
export const authenticationError = (message = 'Authentication required') => {
  return new ApiError(401, message, ErrorTypes.AUTHENTICATION_ERROR);
};

// Authorization error handler
export const authorizationError = (message = 'Not authorized') => {
  return new ApiError(403, message, ErrorTypes.AUTHORIZATION_ERROR);
};

// Not found error handler
export const notFoundError = (message = 'Resource not found') => {
  return new ApiError(404, message, ErrorTypes.NOT_FOUND_ERROR);
};

// Database error handler
export const databaseError = (message, details) => {
  return new ApiError(500, message, ErrorTypes.DATABASE_ERROR, details);
};

// Network error handler
export const networkError = (message, details) => {
  return new ApiError(503, message, ErrorTypes.NETWORK_ERROR, details);
};
