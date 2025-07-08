import { useState } from 'react';
import { authenticatedFetch } from '../utils/authenticatedFetch';

export default function AuthDebug() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (title, data, isError = false) => {
    setResults(prev => [...prev, {
      id: Date.now(),
      title,
      data,
      isError,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const testBasicAPI = async () => {
    try {
      setLoading(true);
      addResult('Testing Basic API', 'Making request...');
      
      const response = await fetch('https://api.cadremarkets.com/api/test');
      const data = await response.json();
      
      addResult('Basic API Response', {
        status: response.status,
        data: data
      });
    } catch (error) {
      addResult('Basic API Error', error.message, true);
    } finally {
      setLoading(false);
    }
  };

  const testAuthToken = async () => {
    try {
      setLoading(true);
      
      // Check all token sources
      const localStorageToken = localStorage.getItem('auth_token');
      const sessionStorageToken = sessionStorage.getItem('auth_token');
      const userString = localStorage.getItem('user');
      let userToken = null;
      
      if (userString) {
        try {
          const user = JSON.parse(userString);
          userToken = user.token;
        } catch (e) {
          addResult('User Object Parse Error', e.message, true);
        }
      }

      addResult('Token Sources Check', {
        localStorage: {
          exists: !!localStorageToken,
          length: localStorageToken ? localStorageToken.length : 0,
          preview: localStorageToken ? localStorageToken.substring(0, 20) + '...' : 'N/A'
        },
        sessionStorage: {
          exists: !!sessionStorageToken,
          length: sessionStorageToken ? sessionStorageToken.length : 0,
          preview: sessionStorageToken ? sessionStorageToken.substring(0, 20) + '...' : 'N/A'
        },
        userObject: {
          exists: !!userToken,
          length: userToken ? userToken.length : 0,
          preview: userToken ? userToken.substring(0, 20) + '...' : 'N/A'
        }
      });

      // Test Redux state if available
      if (typeof window !== 'undefined' && window.__REDUX_STORE__) {
        try {
          const state = window.__REDUX_STORE__.getState();
          const reduxToken = state.user?.token;
          addResult('Redux Token Check', {
            exists: !!reduxToken,
            length: reduxToken ? reduxToken.length : 0,
            preview: reduxToken ? reduxToken.substring(0, 20) + '...' : 'N/A'
          });
        } catch (e) {
          addResult('Redux State Error', e.message, true);
        }
      }

    } catch (error) {
      addResult('Token Check Error', error.message, true);
    } finally {
      setLoading(false);
    }
  };

  const testAuthEndpoint = async () => {
    try {
      setLoading(true);
      addResult('Testing Auth Endpoint', 'Making authenticated request...');
      
      const data = await authenticatedFetch('/api/user/auth-test');
      
      addResult('Auth Endpoint Response', {
        success: true,
        data: data
      });
    } catch (error) {
      addResult('Auth Endpoint Error', {
        message: error.message,
        stack: error.stack
      }, true);
    } finally {
      setLoading(false);
    }
  };

  const testUserListings = async () => {
    try {
      setLoading(true);
      
      // Get user ID from localStorage
      const userString = localStorage.getItem('user');
      if (!userString) {
        addResult('User Listings Error', 'No user data found in localStorage', true);
        return;
      }

      const user = JSON.parse(userString);
      if (!user._id) {
        addResult('User Listings Error', 'No user ID found in user data', true);
        return;
      }

      addResult('Testing User Listings', `Making request for user: ${user._id}`);
      
      const data = await authenticatedFetch(`/api/user/listings/${user._id}`);
      
      addResult('User Listings Response', {
        success: true,
        isArray: Array.isArray(data),
        length: Array.isArray(data) ? data.length : 'Not an array',
        data: Array.isArray(data) ? data.slice(0, 2) : data // Show first 2 items
      });
    } catch (error) {
      addResult('User Listings Error', {
        message: error.message,
        stack: error.stack
      }, true);
    } finally {
      setLoading(false);
    }
  };

  const testSignIn = async () => {
    try {
      setLoading(true);
      addResult('Testing Sign In', 'Making sign in request...');
      
      const response = await fetch('https://api.cadremarkets.com/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://cadremarkets.com'
        },
        credentials: 'include',
        body: JSON.stringify({
          email: 'test@example.com', // Replace with real test account
          password: 'testpassword123'
        })
      });
      
      const data = await response.json();
      
      addResult('Sign In Response', {
        status: response.status,
        success: data.success,
        hasToken: !!data.token,
        tokenLength: data.token ? data.token.length : 0,
        hasUser: !!data.user,
        message: data.message
      });

      // If successful, store the token
      if (data.success && data.token) {
        localStorage.setItem('auth_token', data.token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify({ ...data.user, token: data.token }));
        }
        addResult('Token Storage', 'Token stored in localStorage and user object');
      }
    } catch (error) {
      addResult('Sign In Error', error.message, true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Debug Tool</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <button
            onClick={testBasicAPI}
            disabled={loading}
            className="bg-blue-500 text-white p-4 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Test Basic API
          </button>
          
          <button
            onClick={testAuthToken}
            disabled={loading}
            className="bg-green-500 text-white p-4 rounded hover:bg-green-600 disabled:opacity-50"
          >
            Check Token Sources
          </button>
          
          <button
            onClick={testAuthEndpoint}
            disabled={loading}
            className="bg-purple-500 text-white p-4 rounded hover:bg-purple-600 disabled:opacity-50"
          >
            Test Auth Endpoint
          </button>
          
          <button
            onClick={testUserListings}
            disabled={loading}
            className="bg-orange-500 text-white p-4 rounded hover:bg-orange-600 disabled:opacity-50"
          >
            Test User Listings
          </button>
          
          <button
            onClick={testSignIn}
            disabled={loading}
            className="bg-red-500 text-white p-4 rounded hover:bg-red-600 disabled:opacity-50"
          >
            Test Sign In
          </button>
          
          <button
            onClick={clearResults}
            className="bg-gray-500 text-white p-4 rounded hover:bg-gray-600"
          >
            Clear Results
          </button>
        </div>

        {loading && (
          <div className="text-center mb-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2">Loading...</span>
          </div>
        )}

        <div className="space-y-4">
          {results.map((result) => (
            <div
              key={result.id}
              className={`p-4 rounded border ${
                result.isError ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className={`font-semibold ${result.isError ? 'text-red-800' : 'text-gray-800'}`}>
                  {result.title}
                </h3>
                <span className="text-sm text-gray-500">{result.timestamp}</span>
              </div>
              <pre className="text-sm overflow-x-auto bg-gray-50 p-2 rounded">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 