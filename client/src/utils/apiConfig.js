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
  
  const response = await fetch(url, { ...defaultOptions, ...options });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

export default { getApiUrl, apiCall }; 