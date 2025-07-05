// Test script to test production authentication flow
const PRODUCTION_API = 'https://api.cadremarkets.com';
const PRODUCTION_CLIENT = 'https://www.cadremarkets.com';

async function testProductionAuth() {
  console.log('=== TESTING PRODUCTION AUTHENTICATION ===');
  console.log('API URL:', PRODUCTION_API);
  console.log('Client URL:', PRODUCTION_CLIENT);
  
  // Step 1: Test signin on production
  console.log('\n1. Testing production signin...');
  try {
    const signinResponse = await fetch(`${PRODUCTION_API}/api/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': PRODUCTION_CLIENT
      },
      body: JSON.stringify({
        email: 'mok@gmail.com',
        password: '123123123'
      })
    });
    
    console.log('Signin response status:', signinResponse.status);
    console.log('Signin response headers:', Object.fromEntries(signinResponse.headers.entries()));
    
    const signinData = await signinResponse.json();
    console.log('Signin response data:', signinData);
    
    if (!signinData.success) {
      console.error('Production signin failed!');
      return;
    }
    
    const token = signinData.token;
    console.log('Token received:', token ? 'YES' : 'NO');
    console.log('Token length:', token ? token.length : 0);
    
    // Step 2: Test API call with token
    console.log('\n2. Testing production API call with token...');
    const apiResponse = await fetch(`${PRODUCTION_API}/api/user/auth-test`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Origin': PRODUCTION_CLIENT
      },
      credentials: 'include'
    });
    
    console.log('API response status:', apiResponse.status);
    console.log('API response headers:', Object.fromEntries(apiResponse.headers.entries()));
    
    const apiData = await apiResponse.json();
    console.log('API response data:', apiData);
    
    // Step 3: Test user listings
    console.log('\n3. Testing production user listings...');
    const listingsResponse = await fetch(`${PRODUCTION_API}/api/user/listings/${signinData.user._id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Origin': PRODUCTION_CLIENT
      },
      credentials: 'include'
    });
    
    console.log('Listings response status:', listingsResponse.status);
    console.log('Listings response headers:', Object.fromEntries(listingsResponse.headers.entries()));
    
    const listingsData = await listingsResponse.json();
    console.log('Listings count:', Array.isArray(listingsData) ? listingsData.length : 'Not an array');
    
    // Step 4: Test without token (should fail)
    console.log('\n4. Testing production without token (should fail)...');
    const noTokenResponse = await fetch(`${PRODUCTION_API}/api/user/auth-test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Origin': PRODUCTION_CLIENT
      },
      credentials: 'include'
    });
    
    console.log('No token response status:', noTokenResponse.status);
    const noTokenData = await noTokenResponse.json();
    console.log('No token response data:', noTokenData);
    
  } catch (error) {
    console.error('Production test error:', error);
  }
  
  console.log('\n=== PRODUCTION AUTHENTICATION TEST COMPLETE ===');
}

// Run the test
testProductionAuth().catch(console.error); 