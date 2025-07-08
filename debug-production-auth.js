// Debug script for production authentication
const PRODUCTION_API = 'https://api.cadremarkets.com';
const PRODUCTION_CLIENT = 'https://cadremarkets.com';

async function debugProductionAuth() {
  console.log('=== PRODUCTION AUTHENTICATION DEBUG ===');
  
  try {
    // Step 1: Test basic API connectivity
    console.log('\n1. Testing API connectivity...');
    const testResponse = await fetch(`${PRODUCTION_API}/api/test`);
    console.log('Test response status:', testResponse.status);
    const testData = await testResponse.json();
    console.log('Test response:', testData);
    
    // Step 2: Test signin endpoint
    console.log('\n2. Testing signin endpoint...');
    const signinResponse = await fetch(`${PRODUCTION_API}/api/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': PRODUCTION_CLIENT
      },
      credentials: 'include',
      body: JSON.stringify({
        email: 'test@example.com', // Replace with a real test account
        password: 'testpassword123'
      })
    });
    
    console.log('Signin response status:', signinResponse.status);
    console.log('Signin response headers:', Object.fromEntries(signinResponse.headers.entries()));
    
    if (signinResponse.ok) {
      const signinData = await signinResponse.json();
      console.log('Signin response data:', {
        success: signinData.success,
        hasToken: !!signinData.token,
        tokenLength: signinData.token ? signinData.token.length : 0,
        hasUser: !!signinData.user,
        message: signinData.message
      });
      
      // Step 3: Test authenticated endpoint with token from response
      if (signinData.token) {
        console.log('\n3. Testing authenticated endpoint with token...');
        const authResponse = await fetch(`${PRODUCTION_API}/api/user/auth-test`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${signinData.token}`,
            'Content-Type': 'application/json',
            'Origin': PRODUCTION_CLIENT
          },
          credentials: 'include'
        });
        
        console.log('Auth test response status:', authResponse.status);
        console.log('Auth test response headers:', Object.fromEntries(authResponse.headers.entries()));
        
        const authData = await authResponse.json();
        console.log('Auth test response data:', authData);
        
        // Step 4: Test user listings endpoint
        if (signinData.user && signinData.user._id) {
          console.log('\n4. Testing user listings endpoint...');
          const listingsResponse = await fetch(`${PRODUCTION_API}/api/user/listings/${signinData.user._id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${signinData.token}`,
              'Content-Type': 'application/json',
              'Origin': PRODUCTION_CLIENT
            },
            credentials: 'include'
          });
          
          console.log('Listings response status:', listingsResponse.status);
          console.log('Listings response headers:', Object.fromEntries(listingsResponse.headers.entries()));
          
          const listingsData = await listingsResponse.json();
          console.log('Listings response data:', {
            success: listingsData.success,
            isArray: Array.isArray(listingsData),
            length: Array.isArray(listingsData) ? listingsData.length : 'Not an array',
            error: listingsData.message || listingsData.error
          });
        }
      }
    } else {
      const errorData = await signinResponse.json();
      console.log('Signin error:', errorData);
    }
    
  } catch (error) {
    console.error('Debug error:', error);
  }
  
  console.log('\n=== DEBUG COMPLETE ===');
}

// Run the debug function
debugProductionAuth(); 