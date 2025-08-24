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

// Performance monitoring utility
export const measureApiPerformance = async (endpoint, apiCall) => {
  const startTime = performance.now();
  try {
    const result = await apiCall;
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`⚡ API Performance: ${endpoint} took ${duration.toFixed(2)}ms`);
    
    // Log slow requests
    if (duration > 1000) {
      console.warn(`🐌 Slow API request: ${endpoint} took ${duration.toFixed(2)}ms`);
    }
    
    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    console.error(`❌ API Error: ${endpoint} failed after ${duration.toFixed(2)}ms`, error);
    throw error;
  }
};

// Enhanced smartFetch with performance monitoring
export const smartFetch = async (endpoint, options = {}) => {
  return measureApiPerformance(endpoint, (async () => {
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
    
    console.log(`🔍 SmartFetch Response: ${response.status} ${response.statusText}`);
    console.log(`🔍 SmartFetch Headers:`, Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`🔍 SmartFetch Data:`, data);
    return data;
  })());
};

// Simple cache for public API calls
const apiCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function for making public API calls (no authentication required)
export const publicApiCall = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  
  // Check cache first
  const cacheKey = `${endpoint}_${JSON.stringify(options)}`;
  const cached = apiCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('🔍 PublicApiCall: Using cached response for', endpoint);
    return cached.data;
  }
  
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
  
  const data = await response.json();
  
  // Cache the response
  apiCache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
  
  return data;
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