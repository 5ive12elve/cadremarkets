import { useState, useEffect } from 'react';
import { apiCall } from '../utils/apiConfig';

export default function AuthDebug() {
  const [debugInfo, setDebugInfo] = useState({});
  const [testResults, setTestResults] = useState({});
  
  useEffect(() => {
    const info = {
      localStorage: {
        auth_token: !!localStorage.getItem('auth_token'),
        auth_token_length: localStorage.getItem('auth_token')?.length || 0,
        all_keys: Object.keys(localStorage)
      },
      cookies: {
        enabled: navigator.cookieEnabled,
        document_cookies: document.cookie,
        cookie_count: document.cookie.split(';').filter(c => c.trim()).length
      },
      domain: {
        current: window.location.hostname,
        api: import.meta.env.VITE_API_URL ? new URL(import.meta.env.VITE_API_URL).hostname : 'N/A'
      }
    };
    setDebugInfo(info);
    console.log('=== AUTH DEBUG INFO ===', info);
  }, []);
  
  const testApiCall = async () => {
    try {
      console.log('Testing API call...');
      const response = await apiCall('/api/user/test');
      console.log('API test response:', response);
      setTestResults(prev => ({ ...prev, test: response }));
    } catch (error) {
      console.error('API test error:', error);
      setTestResults(prev => ({ ...prev, test: { error: error.message } }));
    }
  };

  const testAuthApiCall = async () => {
    try {
      console.log('Testing authenticated API call...');
      const response = await apiCall('/api/user/test-auth');
      console.log('Auth API test response:', response);
      setTestResults(prev => ({ ...prev, authTest: response }));
    } catch (error) {
      console.error('Auth API test error:', error);
      setTestResults(prev => ({ ...prev, authTest: { error: error.message } }));
    }
  };

  const clearToken = () => {
    localStorage.removeItem('auth_token');
    window.location.reload();
  };

  const setTestToken = () => {
    // Set a test token (this is just for testing, not a real token)
    localStorage.setItem('auth_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NjU2MDBiZTdiMWM0ZTdkODNiNmE0MCIsImlhdCI6MTc1MTc1NTQ0NSwiZXhwIjoxNzUxODQxODQ1fQ.test');
    window.location.reload();
  };
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Authentication Debug</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button 
          onClick={testApiCall}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Test API Call
        </button>
        <button 
          onClick={testAuthApiCall}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Test Auth API Call
        </button>
        <button 
          onClick={clearToken}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Clear Token
        </button>
        <button 
          onClick={setTestToken}
          className="bg-yellow-500 text-white px-4 py-2 rounded"
        >
          Set Test Token
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Debug Info</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">Test Results</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
            {JSON.stringify(testResults, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
} 