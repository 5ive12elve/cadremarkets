import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { apiCall } from '../utils/apiConfig';

export default function AuthDebug() {
  const [testResults, setTestResults] = useState({
    basicTest: null,
    authTest: null,
    localStorage: null,
    cookies: null
  });
  const [loading, setLoading] = useState(false);
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    // Check localStorage on component mount
    checkLocalStorage();
    checkCookies();
  }, []);

  const checkLocalStorage = () => {
    const authToken = localStorage.getItem('auth_token');
    setTestResults(prev => ({
      ...prev,
      localStorage: {
        hasToken: !!authToken,
        tokenLength: authToken ? authToken.length : 0,
        tokenPreview: authToken ? authToken.substring(0, 20) + '...' : 'None',
        allKeys: Object.keys(localStorage)
      }
    }));
  };

  const checkCookies = () => {
    const cookies = document.cookie;
    setTestResults(prev => ({
      ...prev,
      cookies: {
        hasCookies: !!cookies,
        cookieString: cookies || 'No cookies found',
        cookieEnabled: navigator.cookieEnabled
      }
    }));
  };

  const testBasicApiCall = async () => {
    try {
      setLoading(true);
      console.log('Testing basic API call...');
      const response = await apiCall('/api/user/test');
      console.log('Basic API test successful:', response);
      setTestResults(prev => ({ ...prev, basicTest: response }));
    } catch (error) {
      console.error('Basic API test failed:', error);
      setTestResults(prev => ({ ...prev, basicTest: { error: error.message } }));
    } finally {
      setLoading(false);
    }
  };

  const testAuthApiCall = async () => {
    try {
      setLoading(true);
      console.log('Testing authenticated API call...');
      const response = await apiCall('/api/user/auth-test');
      console.log('Auth API test successful:', response);
      setTestResults(prev => ({ ...prev, authTest: response }));
    } catch (error) {
      console.error('Auth API test failed:', error);
      setTestResults(prev => ({ ...prev, authTest: { error: error.message } }));
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    checkLocalStorage();
    checkCookies();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
      
      {/* Current User State */}
      <div className="bg-gray-100 p-4 rounded mb-6">
        <h2 className="text-lg font-semibold mb-2">Current User State</h2>
        <pre className="text-sm bg-white p-2 rounded">
          {JSON.stringify({ currentUser }, null, 2)}
        </pre>
      </div>

      {/* Local Storage */}
      <div className="bg-blue-50 p-4 rounded mb-6">
        <h2 className="text-lg font-semibold mb-2">Local Storage</h2>
        <pre className="text-sm bg-white p-2 rounded">
          {JSON.stringify(testResults.localStorage, null, 2)}
        </pre>
      </div>

      {/* Cookies */}
      <div className="bg-green-50 p-4 rounded mb-6">
        <h2 className="text-lg font-semibold mb-2">Cookies</h2>
        <pre className="text-sm bg-white p-2 rounded">
          {JSON.stringify(testResults.cookies, null, 2)}
        </pre>
      </div>

      {/* Test Results */}
      <div className="bg-yellow-50 p-4 rounded mb-6">
        <h2 className="text-lg font-semibold mb-2">API Test Results</h2>
        
        <div className="mb-4">
          <h3 className="font-semibold">Basic API Test</h3>
          <pre className="text-sm bg-white p-2 rounded">
            {JSON.stringify(testResults.basicTest, null, 2)}
          </pre>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold">Auth API Test</h3>
          <pre className="text-sm bg-white p-2 rounded">
            {JSON.stringify(testResults.authTest, null, 2)}
          </pre>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={testBasicApiCall}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Basic API'}
        </button>
        
        <button
          onClick={testAuthApiCall}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Auth API'}
        </button>
        
        <button
          onClick={refreshData}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Refresh Data
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Debug Instructions</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Check if there&apos;s a token in localStorage (should be stored as &apos;auth_token&apos;)</li>
          <li>Check if cookies are enabled and accessible</li>
          <li>Test the basic API endpoint to ensure connectivity</li>
          <li>Test the auth API endpoint to check authentication</li>
          <li>If auth fails, the user may need to log in again</li>
        </ol>
      </div>
    </div>
  );
} 