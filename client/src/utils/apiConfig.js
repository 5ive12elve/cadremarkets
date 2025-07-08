// Centralized API configuration
// Cache-busting update 6.3.1 - Force new deployment
export const getApiUrl = (endpoint = '') => {
  const baseUrl = import.meta.env.VITE_API_URL || '';
  
  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // In production, always use the API domain
  if (typeof window !== 'undefined' && (window.location.hostname === 'www.cadremarkets.com' || window.location.hostname === 'cadremarkets.com')) {
    return `https://api.cadremarkets.com/${cleanEndpoint}`;
  }
  
  // In development, use relative URLs. In production, use the full API URL
  if (baseUrl) {
    return `${baseUrl}/${cleanEndpoint}`;
  } else {
    return `/${cleanEndpoint}`;
  }
};

// Smart fetch helper that automatically detects authentication
export const smartFetch = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  
  // Check if user has a token
  const token = localStorage.getItem('auth_token');
  const hasToken = token && token !== 'undefined' && token !== 'null';
  
  console.log(`🔍 SmartFetch: ${endpoint} - Token available: ${hasToken}`);
  
  // Default options
  const defaultOptions = {
    credentials: hasToken ? 'include' : 'omit', // Include credentials only if authenticated
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };
  
  // Add Authorization header if token is available
  if (hasToken) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`;
  }
  
  // If body is FormData, remove Content-Type header to let browser set it
  if (options.body instanceof FormData) {
    delete defaultOptions.headers['Content-Type'];
  }
  
  const finalOptions = { ...defaultOptions, ...options };
  
  const response = await fetch(url, finalOptions);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// Helper function for making public API calls (no authentication required)
export const publicApiCall = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  
  // Default options for public endpoints
  const defaultOptions = {
    credentials: 'omit', // Don't include credentials for public endpoints
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache', // Prevent caching for public endpoints
      ...options.headers
    }
  };
  
  // If body is FormData, remove Content-Type header to let browser set it
  if (options.body instanceof FormData) {
    delete defaultOptions.headers['Content-Type'];
  }
  
  const finalOptions = { ...defaultOptions, ...options };
  
  const response = await fetch(url, finalOptions);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// Helper function for making API calls with proper URL
export const apiCall = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  
  // Default options
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };
  
  // Only add Authorization header for non-auth endpoints
  if (!endpoint.includes('/auth/')) {
    // Get stored token as fallback for cross-origin cookie issues
    const storedToken = localStorage.getItem('auth_token');
    
    // Add Authorization header if token is available
    if (storedToken) {
      defaultOptions.headers['Authorization'] = `Bearer ${storedToken}`;
    }
  }
  
  // If body is FormData, remove Content-Type header to let browser set it
  if (options.body instanceof FormData) {
    delete defaultOptions.headers['Content-Type'];
  }
  
  const finalOptions = { ...defaultOptions, ...options };
  
  const response = await fetch(url, finalOptions);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

export default { getApiUrl, apiCall, publicApiCall, smartFetch }; 