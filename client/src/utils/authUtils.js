// Authentication utility functions

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has a valid token
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('auth_token');
  return !!token;
};

/**
 * Get the current authentication token
 * @returns {string|null} The token or null if not found
 */
export const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

/**
 * Clear authentication data
 */
export const clearAuth = () => {
  localStorage.removeItem('auth_token');
};

/**
 * Check if token is likely expired (basic check)
 * @param {string} token - JWT token
 * @returns {boolean} True if token appears to be expired
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // Decode JWT payload (without verification)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // Assume expired if we can't decode
  }
};

/**
 * Validate authentication and redirect if needed
 * @param {Function} redirectFn - Function to call for redirect
 * @returns {boolean} True if authenticated, false if not
 */
export const validateAuth = (redirectFn = null) => {
  const token = getAuthToken();
  
  if (!token) {
    if (redirectFn) redirectFn('/sign-in');
    return false;
  }
  
  if (isTokenExpired(token)) {
    clearAuth();
    if (redirectFn) redirectFn('/sign-in');
    return false;
  }
  
  return true;
};

/**
 * Get user ID from token (if available)
 * @returns {string|null} User ID or null
 */
export const getUserIdFromToken = () => {
  const token = getAuthToken();
  
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id;
  } catch (error) {
    console.error('Error extracting user ID from token:', error);
    return null;
  }
}; 