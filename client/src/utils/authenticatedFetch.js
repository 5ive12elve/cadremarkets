// Authenticated fetch utility for regular users
// This handles authentication tokens stored in localStorage

const getApiUrl = (endpoint = '') => {
  const baseUrl = import.meta.env.VITE_API_URL || '';
  
  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // In development, use relative URLs. In production, use the full API URL
  if (baseUrl) {
    return `${baseUrl}/${cleanEndpoint}`;
  } else {
    return `/${cleanEndpoint}`;
  }
};

export const authenticatedFetch = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  
  // Get stored token from localStorage
  const storedToken = localStorage.getItem('auth_token');
  
  // Default options
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };
  
  // Add Authorization header if token is available
  if (storedToken) {
    defaultOptions.headers['Authorization'] = `Bearer ${storedToken}`;
  }
  
  // If body is FormData, remove Content-Type header to let browser set it
  if (options.body instanceof FormData) {
    delete defaultOptions.headers['Content-Type'];
  }
  
  const finalOptions = { ...defaultOptions, ...options };
  
  console.log('=== AUTHENTICATED FETCH DEBUG ===');
  console.log('Endpoint:', endpoint);
  console.log('Constructed URL:', url);
  console.log('Token available:', !!storedToken);
  console.log('Authorization header set:', !!finalOptions.headers['Authorization']);
  
  const response = await fetch(url, finalOptions);
  
  console.log('Response status:', response.status);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

export default authenticatedFetch; 