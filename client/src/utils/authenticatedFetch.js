// Authenticated fetch utility for regular users
// This handles authentication tokens stored in localStorage and Redux state

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

// Enhanced token retrieval with multiple fallbacks
const getAuthToken = () => {
  console.log('=== ENHANCED TOKEN RETRIEVAL ===');
  
  // Method 1: Direct localStorage
  const storedToken = localStorage.getItem('auth_token');
  console.log('1. Direct localStorage token:', !!storedToken);
  console.log('   Token length:', storedToken ? storedToken.length : 0);
  
  if (storedToken) {
    return storedToken;
  }
  
  // Method 2: Redux state
  if (typeof window !== 'undefined' && window.__REDUX_STORE__) {
    try {
      const state = window.__REDUX_STORE__.getState();
      const reduxToken = state.user?.token;
      console.log('2. Redux state token:', !!reduxToken);
      console.log('   Token length:', reduxToken ? reduxToken.length : 0);
      
      if (reduxToken) {
        // Store in localStorage for future use
        localStorage.setItem('auth_token', reduxToken);
        console.log('   Token restored to localStorage from Redux');
        return reduxToken;
      }
    } catch (e) {
      console.log('Error accessing Redux state:', e);
    }
  }
  
  // Method 3: User object in localStorage
  const userString = localStorage.getItem('user');
  if (userString) {
    try {
      const user = JSON.parse(userString);
      const userToken = user.token;
      console.log('3. User object token:', !!userToken);
      console.log('   Token length:', userToken ? userToken.length : 0);
      
      if (userToken) {
        // Store in localStorage for future use
        localStorage.setItem('auth_token', userToken);
        console.log('   Token restored to localStorage from user object');
        return userToken;
      }
    } catch (e) {
      console.log('Error parsing user from localStorage:', e);
    }
  }
  
  // Method 4: Session storage (as additional fallback)
  const sessionToken = sessionStorage.getItem('auth_token');
  console.log('4. Session storage token:', !!sessionToken);
  console.log('   Token length:', sessionToken ? sessionToken.length : 0);
  
  if (sessionToken) {
    // Store in localStorage for future use
    localStorage.setItem('auth_token', sessionToken);
    console.log('   Token restored to localStorage from session storage');
    return sessionToken;
  }
  
  console.log('No token found in any storage location');
  return null;
};

export const authenticatedFetch = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  
  // Get token using enhanced retrieval
  const token = getAuthToken();
  
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
  console.log('Final token available:', !!token);
  console.log('Token length:', token ? token.length : 0);
  console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'N/A');
  console.log('Authorization header set:', !!finalOptions.headers['Authorization']);
  console.log('Authorization header value:', finalOptions.headers['Authorization'] ? finalOptions.headers['Authorization'].substring(0, 30) + '...' : 'undefined');
  console.log('All localStorage keys:', Object.keys(localStorage));
  console.log('Final options:', finalOptions);
  
  // Enhanced token validation
  if (token) {
    try {
      // Basic JWT structure validation
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Invalid JWT token structure');
        throw new Error('Invalid token format');
      }
      
      // Check if token is expired
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < currentTime) {
        console.error('Token is expired');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('auth_token');
        throw new Error('Token expired');
      }
      
      console.log('Token validation passed');
    } catch (error) {
      console.error('Token validation failed:', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('auth_token');
      throw new Error('Invalid or expired token');
    }
  }
  
  const response = await fetch(url, finalOptions);
  
  console.log('Response status:', response.status);
  console.log('Response headers:', Object.fromEntries(response.headers.entries()));
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    console.log('Error response:', error);
    
    // Handle specific error cases
    if (response.status === 401) {
      console.log('401 Unauthorized - clearing auth data');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('auth_token');
      
      // Redirect to sign-in page if we're not already there
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/sign-in')) {
        window.location.href = '/sign-in';
        return;
      }
    }
    
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

export default authenticatedFetch; 