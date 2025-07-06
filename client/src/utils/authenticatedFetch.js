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
  
  // Also check for token in user object (fallback)
  const userString = localStorage.getItem('user');
  let userToken = null;
  if (userString) {
    try {
      const user = JSON.parse(userString);
      userToken = user.token;
    } catch (e) {
      console.log('Error parsing user from localStorage:', e);
    }
  }
  
  // Use storedToken first, then fallback to userToken
  const token = storedToken || userToken;
  
  // Default options
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };
  
  // Add Authorization header if token is available
  if (token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`;
  }
  
  // If body is FormData, remove Content-Type header to let browser set it
  if (options.body instanceof FormData) {
    delete defaultOptions.headers['Content-Type'];
  }
  
  const finalOptions = { ...defaultOptions, ...options };
  
  console.log('=== AUTHENTICATED FETCH DEBUG ===');
  console.log('Endpoint:', endpoint);
  console.log('Constructed URL:', url);
  console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
  console.log('Current location:', window.location.href);
  console.log('Stored token available:', !!storedToken);
  console.log('User token available:', !!userToken);
  console.log('Final token available:', !!token);
  console.log('Token length:', token ? token.length : 0);
  console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'N/A');
  console.log('Authorization header set:', !!finalOptions.headers['Authorization']);
  console.log('Authorization header value:', finalOptions.headers['Authorization'] ? finalOptions.headers['Authorization'].substring(0, 30) + '...' : 'undefined');
  console.log('All localStorage keys:', Object.keys(localStorage));
  console.log('Final options:', finalOptions);
  
  const response = await fetch(url, finalOptions);
  
  console.log('Response status:', response.status);
  console.log('Response headers:', Object.fromEntries(response.headers.entries()));
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    console.log('Error response:', error);
    
    // If we get a 401 and have a token, try to refresh or re-authenticate
    if (response.status === 401 && token) {
      console.log('401 error with token present - attempting to clear auth and redirect');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      
      // Redirect to sign-in page
      if (typeof window !== 'undefined') {
        window.location.href = '/sign-in';
        return;
      }
    }
    
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

export default authenticatedFetch; 