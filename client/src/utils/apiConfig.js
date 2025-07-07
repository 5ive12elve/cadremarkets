// Centralized API configuration
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
      console.log('=== TOKEN DEBUG ===');
      console.log('Token found in localStorage, length:', storedToken.length);
      console.log('Token preview:', storedToken.substring(0, 20) + '...');
    } else {
      console.log('=== TOKEN DEBUG ===');
      console.log('No token found in localStorage');
      console.log('localStorage keys:', Object.keys(localStorage));
    }
  } else {
    console.log('=== AUTH ENDPOINT DEBUG ===');
    console.log('Auth endpoint detected, skipping Authorization header');
  }
  
  // If body is FormData, remove Content-Type header to let browser set it
  if (options.body instanceof FormData) {
    delete defaultOptions.headers['Content-Type'];
  }
  
  const finalOptions = { ...defaultOptions, ...options };
  
  // Enhanced debug logging
  console.log('=== API CALL DEBUG ===');
  console.log('Endpoint:', endpoint);
  console.log('Constructed URL:', url);
  console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
  console.log('Final options:', finalOptions);
  console.log('Credentials included:', finalOptions.credentials);
  console.log('Mode:', finalOptions.mode);
  console.log('Authorization header set:', !!finalOptions.headers['Authorization']);
  console.log('Authorization header value:', finalOptions.headers['Authorization'] ? finalOptions.headers['Authorization'].substring(0, 30) + '...' : 'undefined');
  
  // Check if cookies are available
  console.log('Document cookie available:', typeof document !== 'undefined' && document.cookie);
  console.log('Navigator cookie enabled:', typeof navigator !== 'undefined' && navigator.cookieEnabled);
  console.log('Current domain:', typeof window !== 'undefined' ? window.location.hostname : 'N/A');
  console.log('API domain:', new URL(url).hostname);
  
  // Log all headers being sent
  console.log('Headers being sent:', finalOptions.headers);
  
  const response = await fetch(url, finalOptions);
  
  // Log response details
  console.log('Response status:', response.status);
  console.log('Response headers:', Object.fromEntries(response.headers.entries()));
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

export default { getApiUrl, apiCall }; 