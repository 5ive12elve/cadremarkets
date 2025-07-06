// Debug utility for token storage issues
export const debugTokenStorage = () => {
  console.log('=== TOKEN STORAGE DEBUG ===');
  
  // Check localStorage
  const authToken = localStorage.getItem('auth_token');
  console.log('auth_token in localStorage:', !!authToken);
  console.log('auth_token length:', authToken ? authToken.length : 0);
  console.log('auth_token preview:', authToken ? authToken.substring(0, 20) + '...' : 'N/A');
  
  // Check user object
  const userString = localStorage.getItem('user');
  if (userString) {
    try {
      const user = JSON.parse(userString);
      console.log('user.token in localStorage:', !!user.token);
      console.log('user.token length:', user.token ? user.token.length : 0);
    } catch (e) {
      console.log('Error parsing user object:', e);
    }
  } else {
    console.log('No user object in localStorage');
  }
  
  // Check Redux state
  if (typeof window !== 'undefined' && window.__REDUX_STORE__) {
    try {
      const state = window.__REDUX_STORE__.getState();
      console.log('Redux user.token:', !!state.user?.token);
      console.log('Redux user.token length:', state.user?.token ? state.user.token.length : 0);
    } catch (e) {
      console.log('Error accessing Redux state:', e);
    }
  } else {
    console.log('Redux store not available');
  }
  
  // List all localStorage keys
  console.log('All localStorage keys:', Object.keys(localStorage));
  
  // Test token format if available
  if (authToken) {
    try {
      const parts = authToken.split('.');
      console.log('Token parts count:', parts.length);
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        console.log('Token payload:', payload);
        console.log('Token expires at:', new Date(payload.exp * 1000));
        console.log('Token is expired:', payload.exp < Math.floor(Date.now() / 1000));
      }
    } catch (e) {
      console.log('Error parsing token:', e);
    }
  }
};

// Test function to simulate a request
export const testAuthenticatedRequest = async () => {
  console.log('=== TESTING AUTHENTICATED REQUEST ===');
  
  const authToken = localStorage.getItem('auth_token');
  if (!authToken) {
    console.log('No token available for testing');
    return;
  }
  
  try {
    const response = await fetch('/api/user/test', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    console.log('Test request status:', response.status);
    const data = await response.json();
    console.log('Test request response:', data);
  } catch (error) {
    console.error('Test request failed:', error);
  }
};

// Test function to simulate the exact flow
export const testTokenFlow = async () => {
  console.log('=== TESTING COMPLETE TOKEN FLOW ===');
  
  // Check localStorage
  const authToken = localStorage.getItem('auth_token');
  console.log('1. localStorage auth_token:', !!authToken);
  console.log('   Token length:', authToken ? authToken.length : 0);
  console.log('   Token preview:', authToken ? authToken.substring(0, 20) + '...' : 'N/A');
  
  // Check Redux state
  if (typeof window !== 'undefined' && window.__REDUX_STORE__) {
    const state = window.__REDUX_STORE__.getState();
    console.log('2. Redux state token:', !!state.user?.token);
    console.log('   Redux token length:', state.user?.token ? state.user.token.length : 0);
    console.log('   Redux token preview:', state.user?.token ? state.user.token.substring(0, 20) + '...' : 'N/A');
  }
  
  // Check user object
  const userString = localStorage.getItem('user');
  if (userString) {
    try {
      const user = JSON.parse(userString);
      console.log('3. User object token:', !!user.token);
      console.log('   User token length:', user.token ? user.token.length : 0);
      console.log('   User token preview:', user.token ? user.token.substring(0, 20) + '...' : 'N/A');
    } catch (e) {
      console.log('   Error parsing user object:', e);
    }
  }
  
  // Check sessionStorage
  const sessionToken = sessionStorage.getItem('auth_token');
  console.log('4. Session storage token:', !!sessionToken);
  console.log('   Session token length:', sessionToken ? sessionToken.length : 0);
  console.log('   Session token preview:', sessionToken ? sessionToken.substring(0, 20) + '...' : 'N/A');
  
  // Test API health first
  try {
    console.log('5. Testing API health...');
    const healthResponse = await fetch('/api/health');
    console.log('   Health check status:', healthResponse.status);
    const healthData = await healthResponse.json();
    console.log('   Health check data:', healthData);
  } catch (error) {
    console.error('   Health check failed:', error);
  }
  
  // Test basic API endpoint
  try {
    console.log('6. Testing basic API endpoint...');
    const testResponse = await fetch('/api/test');
    console.log('   Basic API status:', testResponse.status);
    const testData = await testResponse.json();
    console.log('   Basic API data:', testData);
  } catch (error) {
    console.error('   Basic API test failed:', error);
  }
  
  // Test authenticatedFetch
  try {
    console.log('7. Testing authenticatedFetch...');
    const response = await fetch('/api/user/test', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    console.log('   Response status:', response.status);
    const data = await response.json();
    console.log('   Response data:', data);
  } catch (error) {
    console.error('   Test request failed:', error);
  }
  
  // Test the actual endpoint that's failing
  try {
    console.log('8. Testing user listings endpoint...');
    const response = await fetch('/api/user/listings/68687724b9bb2ebe001621de', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    console.log('   Response status:', response.status);
    const data = await response.json();
    console.log('   Response data:', data);
  } catch (error) {
    console.error('   User listings test failed:', error);
  }
};

// New comprehensive debug function for production
export const debugProductionToken = () => {
  console.log('=== PRODUCTION TOKEN DEBUG ===');
  console.log('Current URL:', window.location.href);
  console.log('Current domain:', window.location.hostname);
  console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
  
  // Check all storage locations
  const authToken = localStorage.getItem('auth_token');
  const userString = localStorage.getItem('user');
  const sessionToken = sessionStorage.getItem('auth_token');
  
  console.log('Storage Status:');
  console.log('  localStorage auth_token:', !!authToken);
  console.log('  localStorage user object:', !!userString);
  console.log('  sessionStorage auth_token:', !!sessionToken);
  
  // Check Redux state
  if (typeof window !== 'undefined' && window.__REDUX_STORE__) {
    const state = window.__REDUX_STORE__.getState();
    console.log('Redux Status:');
    console.log('  user.currentUser:', !!state.user?.currentUser);
    console.log('  user.token:', !!state.user?.token);
    console.log('  user.loading:', state.user?.loading);
  }
  
  // Test token format if available
  if (authToken) {
    try {
      const parts = authToken.split('.');
      console.log('Token Format:');
      console.log('  Parts count:', parts.length);
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        console.log('  Expires at:', new Date(payload.exp * 1000));
        console.log('  Is expired:', payload.exp < Math.floor(Date.now() / 1000));
        console.log('  User ID:', payload.id);
      }
    } catch (e) {
      console.log('  Token format error:', e);
    }
  }
  
  // List all storage keys
  console.log('All localStorage keys:', Object.keys(localStorage));
  console.log('All sessionStorage keys:', Object.keys(sessionStorage));
};

// Make functions available globally for console debugging
if (typeof window !== 'undefined') {
  window.debugTokenStorage = debugTokenStorage;
  window.testAuthenticatedRequest = testAuthenticatedRequest;
  window.testTokenFlow = testTokenFlow;
  window.debugProductionToken = debugProductionToken;
} 