// Error types
export const ErrorTypes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_ERROR: 'API_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  SERVER_ERROR: 'SERVER_ERROR',
};

// Error messages
export const ErrorMessages = {
  [ErrorTypes.NETWORK_ERROR]: 'Network error. Please check your internet connection.',
  [ErrorTypes.API_ERROR]: 'An error occurred while processing your request.',
  [ErrorTypes.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ErrorTypes.AUTH_ERROR]: 'Your session has expired or you are not authorized.',
  [ErrorTypes.NOT_FOUND]: 'The requested resource was not found.',
  [ErrorTypes.SERVER_ERROR]: 'An internal server error occurred. Please try again later.',
};

// Handle API errors
export const handleApiError = (error, navigate) => {
  // Handle different error types and redirect accordingly
  if (error.status || error.statusCode) {
    const statusCode = error.status || error.statusCode;
    
    switch (statusCode) {
      case 401:
        navigate('/401');
        break;
      case 403:
        navigate('/403');
        break;
      case 404:
        navigate('/404');
        break;
      case 500:
        navigate('/500');
        break;
      default:
        // For other errors, show generic error page
        navigate('/500');
    }
  } else {
    // For network errors or other unknown errors
    navigate('/500');
  }
};

// Generic error response handler for API calls
export const handleFetchError = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || 'An error occurred');
    error.status = response.status;
    error.data = errorData;
    throw error;
  }
  return response;
};

// Wrapper for API calls with error handling
export const apiCall = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    await handleFetchError(response);
    return await response.json();
  } catch (error) {
    // Log error for debugging in development
    if (import.meta.env.MODE === 'development') {
      console.error('API Call Error:', {
        url,
        method: options.method || 'GET',
        error: error.message,
        status: error.status
      });
    }
    throw error;
  }
};

// Format error message for display
export const formatErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  return ErrorMessages[ErrorTypes.API_ERROR];
};

// Create a custom error with type
export class CustomError extends Error {
  constructor(type, message) {
    super(message || ErrorMessages[type]);
    this.type = type;
  }
}

// Utility function to throw custom errors
export const throwCustomError = (type, message) => {
  throw new CustomError(type, message);
}; 