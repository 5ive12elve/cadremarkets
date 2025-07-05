// Centralized API configuration
export const getApiUrl = (endpoint = '') => {
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
  
  // If body is FormData, remove Content-Type header to let browser set it
  if (options.body instanceof FormData) {
    delete defaultOptions.headers['Content-Type'];
  }
  
  const finalOptions = { ...defaultOptions, ...options };
  
  // Debug logging
  console.log('=== API CALL DEBUG ===');
  console.log('Endpoint:', endpoint);
  console.log('Constructed URL:', url);
  console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
  console.log('Final options:', finalOptions);
  console.log('Credentials included:', finalOptions.credentials);
  console.log('Mode:', finalOptions.mode);
  
  // Check if cookies are available
  console.log('Document cookie available:', typeof document !== 'undefined' && document.cookie);
  console.log('Navigator cookie enabled:', typeof navigator !== 'undefined' && navigator.cookieEnabled);
  
  const response = await fetch(url, finalOptions);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

export default { getApiUrl, apiCall }; 