/**
 * Utility functions for making authenticated API requests
 */

/**
 * Get the current auth token from localStorage
 * @returns {string|null} The auth token or null if not found
 */
export const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

/**
 * Make an authenticated API request
 * @param {string} url - The API endpoint URL
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} The fetch response
 */
export const authenticatedFetch = async (url, options = {}) => {
  const token = getAuthToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };

  const fetchOptions = {
    credentials: 'include',
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  return fetch(url, fetchOptions);
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has a valid token
 */
export const isAuthenticated = () => {
  const token = getAuthToken();
  return !!token;
};

/**
 * Clear authentication data
 */
export const clearAuth = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
}; 