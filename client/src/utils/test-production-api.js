// Comprehensive test for production API with proper URL construction
export const testProductionApi = async () => {
  console.log('=== PRODUCTION API TEST ===');
  
  // Get the stored token
  const authToken = localStorage.getItem('auth_token');
  if (!authToken) {
    console.log('❌ No token found in localStorage');
    return;
  }
  
  console.log('✅ Token found, length:', authToken.length);
  console.log('Token preview:', authToken.substring(0, 20) + '...');
  
  // Get current user ID from token
  let currentUserId = null;
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
  
  if (!currentUserId) {
    console.log('❌ No user ID found in token, cannot test listings endpoint');
    return;
  }
  
  // Construct the proper API URL
  const apiUrl = 'https://api.cadremarkets.com';
  const endpoint = `/api/user/listings/${currentUserId}`;
  const fullUrl = `${apiUrl}${endpoint}`;
  
  console.log('API URL:', apiUrl);
  console.log('Endpoint:', endpoint);
  console.log('Full URL:', fullUrl);
  
  try {
    console.log('Making API request...');
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API request successful!');
      console.log('Response data:', data);
    } else {
      console.log('❌ API request failed');
      const errorText = await response.text();
      console.log('Error response:', errorText);
      
      // Try to parse as JSON if possible
      try {
        const errorData = JSON.parse(errorText);
        console.log('Parsed error data:', errorData);
      } catch {
        console.log('Could not parse error response as JSON');
      }
    }
  } catch (error) {
    console.error('❌ API request error:', error);
  }
};

// Test with different URL construction methods
export const testUrlConstructionMethods = async () => {
  console.log('=== URL CONSTRUCTION METHODS TEST ===');
  
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
  const endpoint = `/api/user/listings/${testUserId}`;
  
  // Method 1: Direct construction
  const method1 = `https://api.cadremarkets.com${endpoint}`;
  console.log('Method 1 (Direct):', method1);
  
  // Method 2: Using VITE_API_URL
  const viteApiUrl = import.meta.env.VITE_API_URL || 'https://api.cadremarkets.com';
  const method2 = `${viteApiUrl}${endpoint}`;
  console.log('Method 2 (VITE_API_URL):', method2);
  
  // Method 3: Using the getApiUrl function from apiConfig
  const { getApiUrl } = await import('./apiConfig.js');
  const method3 = getApiUrl(endpoint);
  console.log('Method 3 (getApiUrl):', method3);
  
  console.log('All methods should produce the same URL');
  console.log('Method 1 === Method 2:', method1 === method2);
  console.log('Method 2 === Method 3:', method2 === method3);
  console.log('Method 1 === Method 3:', method1 === method3);
};

// Make available globally
if (typeof window !== 'undefined') {
  window.testProductionApi = testProductionApi;
  window.testUrlConstructionMethods = testUrlConstructionMethods;
} 