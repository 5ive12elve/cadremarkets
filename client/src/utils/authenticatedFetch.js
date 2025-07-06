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
  console.log('Current URL:', window.location.href);
  console.log('Current domain:', window.location.hostname);
  
  // Method 1: Direct localStorage
  const storedToken = localStorage.getItem('auth_token');
  console.log('1. Direct localStorage token:', !!storedToken);
  console.log('   Token length:', storedToken ? storedToken.length : 0);
  console.log('   Token preview:', storedToken ? storedToken.substring(0, 20) + '...' : 'N/A');
  
  if (storedToken) {
    // Validate token format before returning
    try {
      const parts = storedToken.split('.');
      if (parts.length === 3) {
        console.log('   Token format validation: PASSED');
        return storedToken;
      } else {
        console.log('   Token format validation: FAILED - removing invalid token');
        localStorage.removeItem('auth_token');
      }
    } catch {
      console.log('   Token format validation: FAILED - removing invalid token');
      localStorage.removeItem('auth_token');
    }
  }
  
  // Method 2: Redux state
  if (typeof window !== 'undefined' && window.__REDUX_STORE__) {
    try {
      const state = window.__REDUX_STORE__.getState();
      const reduxToken = state.user?.token;
      console.log('2. Redux state token:', !!reduxToken);
      console.log('   Token length:', reduxToken ? reduxToken.length : 0);
      console.log('   Token preview:', reduxToken ? reduxToken.substring(0, 20) + '...' : 'N/A');
      
      if (reduxToken) {
        // Validate token format before storing
        try {
          const parts = reduxToken.split('.');
          if (parts.length === 3) {
            // Store in localStorage for future use
            localStorage.setItem('auth_token', reduxToken);
            console.log('   Token restored to localStorage from Redux');
            return reduxToken;
          } else {
            console.log('   Redux token format validation: FAILED');
          }
        } catch {
          console.log('   Redux token format validation: FAILED');
        }
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
      console.log('   Token preview:', userToken ? userToken.substring(0, 20) + '...' : 'N/A');
      
      if (userToken) {
        // Validate token format before storing
        try {
          const parts = userToken.split('.');
          if (parts.length === 3) {
            // Store in localStorage for future use
            localStorage.setItem('auth_token', userToken);
            console.log('   Token restored to localStorage from user object');
            return userToken;
          } else {
            console.log('   User object token format validation: FAILED');
          }
        } catch {
          console.log('   User object token format validation: FAILED');
        }
      }
    } catch (e) {
      console.log('Error parsing user from localStorage:', e);
    }
  }
  
  // Method 4: Session storage (as additional fallback)
  const sessionToken = sessionStorage.getItem('auth_token');
  console.log('4. Session storage token:', !!sessionToken);
  console.log('   Token length:', sessionToken ? sessionToken.length : 0);
  console.log('   Token preview:', sessionToken ? sessionToken.substring(0, 20) + '...' : 'N/A');
  
  if (sessionToken) {
    // Validate token format before storing
    try {
      const parts = sessionToken.split('.');
      if (parts.length === 3) {
        // Store in localStorage for future use
        localStorage.setItem('auth_token', sessionToken);
        console.log('   Token restored to localStorage from session storage');
        return sessionToken;
      } else {
        console.log('   Session token format validation: FAILED');
      }
    } catch {
      console.log('   Session token format validation: FAILED');
    }
  }
  
  console.log('No valid token found in any storage location');
  console.log('All localStorage keys:', Object.keys(localStorage));
  console.log('All sessionStorage keys:', Object.keys(sessionStorage));
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
  
  // CRITICAL FIX: Always try to get token from multiple sources for cross-origin requests
  let finalToken = token;
  if (!finalToken) {
    console.log('⚠️ No token from getAuthToken(), trying direct retrieval...');
    
    // Direct localStorage check
    finalToken = localStorage.getItem('auth_token');
    if (finalToken) {
      console.log('✅ Found token in direct localStorage check');
    } else {
      // Direct sessionStorage check
      finalToken = sessionStorage.getItem('auth_token');
      if (finalToken) {
        console.log('✅ Found token in direct sessionStorage check');
      } else {
        // Direct user object check
        const userString = localStorage.getItem('user');
        if (userString) {
          try {
            const user = JSON.parse(userString);
            finalToken = user.token;
            if (finalToken) {
              console.log('✅ Found token in direct user object check');
            }
          } catch (e) {
            console.log('Error parsing user object in direct check:', e);
          }
        }
      }
    }
  }
  
  // Add Authorization header if token is available
  if (finalToken) {
    defaultOptions.headers['Authorization'] = `Bearer ${finalToken}`;
    console.log('✓ Authorization header set with Bearer token');
    console.log('Token length:', finalToken.length);
    console.log('Token preview:', finalToken.substring(0, 20) + '...');
  } else {
    console.log('⚠️ No token available - request will be made without Authorization header');
    console.log('This will likely result in a 401 Unauthorized error');
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
  console.log('Final token available:', !!finalToken);
  console.log('Token length:', finalToken ? finalToken.length : 0);
  console.log('Token preview:', finalToken ? finalToken.substring(0, 20) + '...' : 'N/A');
  console.log('Authorization header set:', !!finalOptions.headers['Authorization']);
  console.log('Authorization header value:', finalOptions.headers['Authorization'] ? finalOptions.headers['Authorization'].substring(0, 30) + '...' : 'undefined');
  console.log('All localStorage keys:', Object.keys(localStorage));
  console.log('Final options:', finalOptions);
  console.log('Request headers being sent:', finalOptions.headers);
  
  // Enhanced token validation
  if (finalToken) {
    try {
      // Basic JWT structure validation
      const parts = finalToken.split('.');
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