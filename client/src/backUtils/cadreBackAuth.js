import { getApiUrl } from '../utils/apiConfig.js';

/**
 * Backoffice Authentication Utilities
 */

/**
 * Check if backoffice user is authenticated
 * @returns {boolean} True if user has backoffice access
 */
export const isBackofficeAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  // Check both localStorage flags and cookie presence
  const accessGranted = localStorage.getItem('cadreAccessGranted');
  const userRole = localStorage.getItem('cadreUserRole');
  return accessGranted === 'true' && userRole;
};

/**
 * Get backoffice user role
 * @returns {string|null} The user role or null if not authenticated
 */
export const getBackofficeUserRole = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('cadreUserRole');
};

/**
 * Make an authenticated backoffice API request
 * @param {string} endpoint - The API endpoint (without base URL)
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} The fetch response
 */
export const backofficeApiRequest = async (endpoint, options = {}) => {
  if (!isBackofficeAuthenticated()) {
    throw new Error('Not authenticated for backoffice access');
  }

  const API_URL = getApiUrl('api');
  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  // Ensure credentials are always included for cookie-based auth
  defaultOptions.credentials = 'include';

  return fetch(url, defaultOptions);
};

/**
 * Clear backoffice authentication data
 */
export const clearBackofficeAuth = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('cadreAccessGranted');
    localStorage.removeItem('cadreUserRole');
  }
};

/**
 * Logout backoffice user
 */
export const logoutBackoffice = () => {
  clearBackofficeAuth();
  window.location.href = '/cadreBack/login';
};