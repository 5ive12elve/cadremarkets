// Test script to verify API URL construction
export const testApiUrlConstruction = () => {
  console.log('=== API URL CONSTRUCTION TEST ===');
  
  // Test the getApiUrl function
  const getApiUrl = (endpoint = '') => {
    const baseUrl = import.meta.env.VITE_API_URL || '';
    
    // Remove leading slash from endpoint if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    
    // In production, always use the API domain
    if (window.location.hostname === 'www.cadremarkets.com' || window.location.hostname === 'cadremarkets.com') {
      return `https://api.cadremarkets.com/${cleanEndpoint}`;
    }
    
    // In development, use relative URLs. In production, use the full API URL
    if (baseUrl) {
      return `${baseUrl}/${cleanEndpoint}`;
    } else {
      return `/${cleanEndpoint}`;
    }
  };
  
  console.log('Current URL:', window.location.href);
  console.log('Current hostname:', window.location.hostname);
  console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
  
  // Get current user ID from token for testing
  let currentUserId = null;
  const authToken = localStorage.getItem('auth_token');
  if (authToken) {
    try {
      const parts = authToken.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        currentUserId = payload.id;
        console.log('Current user ID from token:', currentUserId);
      }
    } catch {
      console.log('Could not extract user ID from token');
    }
  }
  
  // Use dynamic user ID or fallback to a test ID
  const testUserId = currentUserId || 'test1234567890123456789012';
  const testEndpoint = `/api/user/listings/${testUserId}`;
  const constructedUrl = getApiUrl(testEndpoint);
  
  console.log('Test endpoint:', testEndpoint);
  console.log('Constructed URL:', constructedUrl);
  console.log('Expected URL:', `https://api.cadremarkets.com/api/user/listings/${testUserId}`);
  console.log('URLs match:', constructedUrl === `https://api.cadremarkets.com/api/user/listings/${testUserId}`);
  
  return constructedUrl;
};

// Make available globally
if (typeof window !== 'undefined') {
  window.testApiUrlConstruction = testApiUrlConstruction;
} 