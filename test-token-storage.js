// Test script to verify token storage in browser
// Run this in the browser console after signing in

function testTokenStorage() {
  console.log('=== TOKEN STORAGE TEST ===');
  
  // Check localStorage
  console.log('\n1. localStorage check:');
  console.log('auth_token exists:', !!localStorage.getItem('auth_token'));
  console.log('auth_token length:', localStorage.getItem('auth_token')?.length || 0);
  console.log('auth_token preview:', localStorage.getItem('auth_token')?.substring(0, 20) + '...');
  
  // Check sessionStorage
  console.log('\n2. sessionStorage check:');
  console.log('auth_token exists:', !!sessionStorage.getItem('auth_token'));
  console.log('auth_token length:', sessionStorage.getItem('auth_token')?.length || 0);
  
  // Check cookies
  console.log('\n3. Cookies check:');
  console.log('All cookies:', document.cookie);
  console.log('access_token cookie:', document.cookie.includes('access_token'));
  
  // Check Redux state (if available)
  console.log('\n4. Redux state check:');
  if (window.__REDUX_DEVTOOLS_EXTENSION__) {
    console.log('Redux DevTools available');
  } else {
    console.log('Redux DevTools not available');
  }
  
  // Test token validation
  const token = localStorage.getItem('auth_token');
  if (token) {
    console.log('\n5. Token validation:');
    try {
      const parts = token.split('.');
      console.log('Token parts:', parts.length);
      
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        console.log('Token payload:', payload);
        console.log('Token expires:', new Date(payload.exp * 1000));
        console.log('Token is expired:', payload.exp < Math.floor(Date.now() / 1000));
      } else {
        console.log('Invalid token structure');
      }
    } catch (error) {
      console.error('Token validation error:', error);
    }
  }
  
  // Test API call
  if (token) {
    console.log('\n6. Testing API call:');
    fetch('https://api.cadremarkets.com/api/user/auth-test', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })
    .then(response => {
      console.log('API response status:', response.status);
      return response.json();
    })
    .then(data => {
      console.log('API response data:', data);
    })
    .catch(error => {
      console.error('API call failed:', error);
    });
  }
}

// Run the test
testTokenStorage(); 