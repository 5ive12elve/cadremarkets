// Debug script to test authentication flow
// Run this in the browser console or as a Node.js script

const API_URL = 'https://api.cadremarkets.com';

async function debugAuth() {
  console.log('=== AUTHENTICATION DEBUG SCRIPT ===');
  
  // Step 1: Check localStorage
  console.log('\n1. Checking localStorage:');
  console.log('auth_token:', localStorage.getItem('auth_token') ? 'EXISTS' : 'MISSING');
  console.log('user:', localStorage.getItem('user') ? 'EXISTS' : 'MISSING');
  
  const token = localStorage.getItem('auth_token');
  if (token) {
    console.log('Token length:', token.length);
    console.log('Token preview:', token.substring(0, 20) + '...');
    
    // Decode token payload
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Token payload:', payload);
      console.log('Token expires:', new Date(payload.exp * 1000));
      console.log('Token is expired:', payload.exp < Math.floor(Date.now() / 1000));
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }
  
  // Step 2: Test API call
  if (token) {
    console.log('\n2. Testing API call with token:');
    try {
      const response = await fetch(`${API_URL}/api/user/auth-test`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok && data.user) {
        console.log('User ID from API:', data.user._id);
        
        // Step 3: Test listings endpoint
        console.log('\n3. Testing listings endpoint:');
        const listingsResponse = await fetch(`${API_URL}/api/user/listings/${data.user._id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        console.log('Listings response status:', listingsResponse.status);
        console.log('Listings response headers:', Object.fromEntries(listingsResponse.headers.entries()));
        
        const listingsData = await listingsResponse.json();
        console.log('Listings response data:', listingsData);
      }
    } catch (error) {
      console.error('API call failed:', error);
    }
  } else {
    console.log('\n2. No token available - cannot test API');
  }
  
  // Step 4: Check environment
  console.log('\n4. Environment check:');
  console.log('Current URL:', window.location.href);
  console.log('API URL:', API_URL);
  console.log('VITE_API_URL:', import.meta.env?.VITE_API_URL || 'NOT SET');
}

// Run the debug function
debugAuth(); 