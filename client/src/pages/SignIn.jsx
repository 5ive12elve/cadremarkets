import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from '../redux/user/userSlice';
import OAuth from '../components/OAuth';
import GE02Loader from '../components/GE02Loader';
import toast from 'react-hot-toast';
import { FiCheck } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';
import { getPageTranslations } from '../locales/translations';
import { apiCall } from '../utils/apiConfig';

export default function SignIn() {
  const [formData, setFormData] = useState({});
  const { loading, error, currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Language context
  const { currentLang, direction } = useLanguage();
  const t = getPageTranslations('signin', currentLang);
  const common = getPageTranslations('common', currentLang);

  // Clear any stuck loading state on component mount
  useEffect(() => {
    if (loading && !formData.email && !formData.password) {
      // If we're in loading state but no form data, likely stuck from previous session
      dispatch(signInFailure(''));
    }
  }, [loading, formData.email, formData.password, dispatch]);

  // Redirect if user is already signed in
  useEffect(() => {
    if (currentUser) {
      toast.success(common.alreadySignedInSuccess || 'You are already signed in!');
      navigate('/');
    }
  }, [currentUser, navigate, common.alreadySignedInSuccess]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic form validation
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      dispatch(signInStart());
      
      const data = await apiCall('/api/auth/signin', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      
      console.log('=== SIGNIN RESPONSE DEBUG ===');
      console.log('Full signin response:', data);
      console.log('Response type:', typeof data);
      console.log('Response keys:', Object.keys(data));
      console.log('Token in response:', !!data.token);
      console.log('Token value:', data.token);
      console.log('User in response:', !!data.user);
      console.log('User value:', data.user);
      console.log('Success flag:', data.success);
      
      if (data.success === false) {
        // Handle specific error cases with user-friendly messages
        let translatedError = '';
        
        if (data.message === 'User not found') {
          translatedError = t.emailNotFound || 'Email not found. Please check your email or sign up.';
        } else if (data.message === 'Invalid credentials') {
          translatedError = t.incorrectPassword || 'Incorrect password. Please try again.';
        } else {
          translatedError = t.signInFailed || 'Sign in failed. Please try again.';
        }
        
        dispatch(signInFailure(translatedError));
        toast.error(translatedError);
        return;
      }
      
      if (data.token) {
        console.log('=== ENHANCED TOKEN STORAGE (FIXED ORDER) ===');
        console.log('About to store token in multiple locations');
        console.log('Token length:', data.token.length);
        console.log('Token preview:', data.token.substring(0, 20) + '...');
        
        // Store in localStorage (primary)
        localStorage.setItem('auth_token', data.token);
        console.log('✓ Token stored in localStorage');
        
        // Store in sessionStorage (backup)
        sessionStorage.setItem('auth_token', data.token);
        console.log('✓ Token stored in sessionStorage');
        
        // Store in user object (legacy support)
        const userWithToken = { ...data.user, token: data.token };
        localStorage.setItem('user', JSON.stringify(userWithToken));
        console.log('✓ Token stored in user object');
        
        // IMMEDIATE VERIFICATION - Check if token was actually stored
        const immediateAuthToken = localStorage.getItem('auth_token');
        const immediateSessionToken = sessionStorage.getItem('auth_token');
        const immediateUserToken = JSON.parse(localStorage.getItem('user') || '{}').token;
        
        console.log('=== IMMEDIATE STORAGE VERIFICATION ===');
        console.log('localStorage token exists:', !!immediateAuthToken);
        console.log('localStorage token length:', immediateAuthToken ? immediateAuthToken.length : 0);
        console.log('sessionStorage token exists:', !!immediateSessionToken);
        console.log('sessionStorage token length:', immediateSessionToken ? immediateSessionToken.length : 0);
        console.log('user object token exists:', !!immediateUserToken);
        console.log('user object token length:', immediateUserToken ? immediateUserToken.length : 0);
        console.log('All tokens match:', immediateAuthToken === immediateSessionToken && immediateSessionToken === immediateUserToken);
        
        // CRITICAL: Verify token is actually accessible
        if (!immediateAuthToken) {
          console.error('❌ CRITICAL ERROR: Token not found in localStorage after storage attempt!');
          throw new Error('Token storage failed');
        }
        
        console.log('✅ Token storage verification passed');
        
        // Test if we can access the token immediately
        console.log('=== TOKEN ACCESS TEST ===');
        console.log('localStorage.getItem("auth_token"):', !!localStorage.getItem('auth_token'));
        console.log('localStorage keys:', Object.keys(localStorage));
        console.log('sessionStorage keys:', Object.keys(sessionStorage));
        
        // Additional verification - test the token format
        console.log('=== TOKEN FORMAT TEST ===');
        console.log('Token starts with "eyJ":', data.token.startsWith('eyJ'));
        console.log('Token contains dots:', (data.token.match(/\./g) || []).length === 2);
        
        // Test immediate API call to verify token works
        try {
          console.log('=== IMMEDIATE API TEST ===');
          const testResponse = await apiCall('/api/user/test');
          console.log('Immediate API test successful:', testResponse);
          
          // Test authenticated endpoint
          const authTestResponse = await apiCall('/api/user/auth-test');
          console.log('Authenticated API test successful:', authTestResponse);
        } catch (testError) {
          console.error('Immediate API test failed:', testError);
        }
        
        // Additional verification after a small delay
        setTimeout(() => {
          console.log('=== DELAYED TOKEN VERIFICATION ===');
          const delayedToken = localStorage.getItem('auth_token');
          const delayedSessionToken = sessionStorage.getItem('auth_token');
          console.log('Delayed localStorage token exists:', !!delayedToken);
          console.log('Delayed sessionStorage token exists:', !!delayedSessionToken);
          console.log('Delayed tokens match:', delayedToken === data.token);
          console.log('All localStorage keys:', Object.keys(localStorage));
          console.log('All sessionStorage keys:', Object.keys(sessionStorage));
        }, 50);
      } else {
        console.log('No token received in signin response');
      }
      
      dispatch(signInSuccess({
        user: data.user,
        token: data.token
      }));
      
      // Custom success toast
      toast.custom((toastData) => (
        <div
          className={`${
            toastData.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-[#f3eb4b] shadow-lg rounded-none pointer-events-auto flex items-center justify-between`}
          dir={direction}
        >
          <div className="flex items-center gap-2 p-4">
            <div className="bg-[#db2b2e] p-2">
              <FiCheck className="text-white text-xl" />
            </div>
            <div className="flex flex-col gap-1">
                <h3 className={`text-[#db2b2e] font-bold ${direction === 'rtl' ? 'font-noto' : 'font-primary'}`}>
                  {t.welcomeBack || 'Welcome back!'}
                </h3>
                <p className={`text-[#db2b2e] text-sm ${direction === 'rtl' ? 'font-noto' : 'font-secondary'}`}>
                  {t.signedInSuccessfully || 'You have successfully signed in'}
                </p>
            </div>
          </div>
        </div>
      ), {
        duration: 3000,
        position: 'top-center',
      });

      // CRITICAL FIX: Wait for Redux state to update before navigation
      console.log('=== WAITING FOR REDUX UPDATE ===');
      await new Promise(resolve => setTimeout(resolve, 200)); // Wait 200ms for Redux to update
      
      // Verify Redux state before navigation
      if (typeof window !== 'undefined' && window.__REDUX_STORE__) {
        const state = window.__REDUX_STORE__.getState();
        console.log('Redux state before navigation:', {
          hasUser: !!state.user?.currentUser,
          hasToken: !!state.user?.token,
          tokenLength: state.user?.token ? state.user.token.length : 0
        });
      }
      
      // Add a small delay to ensure token is properly stored before navigation
      setTimeout(() => {
        console.log('=== PRE-NAVIGATION TOKEN CHECK (FIXED ORDER) ===');
        console.log('Token before navigation:', !!localStorage.getItem('auth_token'));
        console.log('Token length before navigation:', localStorage.getItem('auth_token')?.length || 0);
        console.log('Token preview before navigation:', localStorage.getItem('auth_token') ? localStorage.getItem('auth_token').substring(0, 20) + '...' : 'N/A');
        
        // Check all storage locations before navigation
        const finalAuthToken = localStorage.getItem('auth_token');
        const finalSessionToken = sessionStorage.getItem('auth_token');
        const finalUserString = localStorage.getItem('user');
        
        console.log('=== FINAL STORAGE CHECK BEFORE NAVIGATION ===');
        console.log('localStorage auth_token exists:', !!finalAuthToken);
        console.log('sessionStorage auth_token exists:', !!finalSessionToken);
        console.log('localStorage user object exists:', !!finalUserString);
        
        if (finalUserString) {
          try {
            const finalUser = JSON.parse(finalUserString);
            console.log('User object token exists:', !!finalUser.token);
            console.log('User object token length:', finalUser.token ? finalUser.token.length : 0);
          } catch (e) {
            console.log('Error parsing user object before navigation:', e);
          }
        }
        
        // Check Redux state before navigation
        if (typeof window !== 'undefined' && window.__REDUX_STORE__) {
          const state = window.__REDUX_STORE__.getState();
          console.log('Redux token before navigation:', !!state.user?.token);
          console.log('Redux token length before navigation:', state.user?.token ? state.user.token.length : 0);
        }
        
        console.log('About to navigate to homepage...');
        navigate('/');
      }, 300); // Increased delay to 300ms
      
    } catch (error) {
      console.error('Signin error:', error);
      
      // Handle network or unexpected errors
      let translatedError = '';
      if (error.message.includes('Failed to fetch') || error.message.includes('Network Error')) {
        translatedError = common.networkError || 'Network error. Please check your connection and try again.';
      } else {
        translatedError = t.signInFailed || 'Sign in failed. Please try again.';
      }
      
      dispatch(signInFailure(translatedError));
      toast.error(translatedError);
    }
  };
  return (
    <div className="bg-[#f3eb4b] font-primary transition-colors duration-300 min-h-screen overflow-x-hidden" dir={direction}>
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
        {/* Left Graphic - Hidden on mobile, shown on desktop */}
        <div className="bg-white dark:bg-black hidden md:flex items-center justify-center transition-colors duration-300 relative overflow-hidden">
          <img src="/mediassets/CMSUP55.png" alt="Phone Cart" className={`h-full w-auto max-h-full object-contain relative z-10 ${direction === 'rtl' ? 'mr-8 lg:mr-16' : 'ml-8 lg:ml-16'}`} style={{ maxWidth: '80%' }} />
          
          {/* Cheerful Cadre elements overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <div className="text-center">
              <div className="text-8xl mb-4">🎨</div>
              <div className="text-6xl mb-2">✨</div>
              <div className="text-7xl">🚀</div>
            </div>
          </div>
          
          {/* Floating Cadre branding elements */}
          <div className={`absolute text-[#db2b2e] opacity-20 ${direction === 'rtl' ? 'top-10 right-10' : 'top-10 left-10'}`}>
            <div className="text-4xl font-bold font-primary">CADRE</div>
          </div>
          <div className={`absolute text-[#db2b2e] opacity-20 ${direction === 'rtl' ? 'bottom-10 left-10' : 'bottom-10 right-10'}`}>
            <div className="text-2xl font-secondary">2025</div>
          </div>
        </div>

        {/* Right Form */}
        <div className="bg-white dark:bg-black text-black dark:text-white flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 lg:p-20 relative transition-colors duration-300 overflow-hidden">
          {/* Form Content */}
          <div className={`relative z-10 w-full md:w-[80%] mx-auto md:mx-0 bg-white/90 dark:bg-black/90 border-2 border-[#db2b2e] shadow-none md:shadow-lg p-4 md:p-8 h-auto flex flex-col justify-center ${direction === 'rtl' ? 'ml-0 md:ml-8 lg:ml-16' : 'mr-0 md:mr-8 lg:mr-16'}`}>
            <div className="flex items-center justify-between w-full mb-3 md:mb-2">
              <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold font-primary text-[#db2b2e] ${direction === 'rtl' ? 'text-right' : 'text-left'} ${direction === 'rtl' ? 'font-amiri' : 'font-primary'}`}>{t.title || 'Sign In'}</h1>
              <img src="/mediassets/cm2025red.png" alt="CM2025 Red" className={`h-8 w-auto ${direction === 'rtl' ? 'mr-2' : 'ml-2'}`} />
            </div>
            <p className={`mb-8 md:mb-8 text-sm sm:text-base text-gray-600 dark:text-gray-300 font-secondary ${direction === 'rtl' ? 'text-right' : 'text-left'} ${direction === 'rtl' ? 'font-noto' : 'font-secondary'}`}>
              {common.pleaseEnterDetails || 'Please enter your details'}
            </p>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:gap-4 space-y-4">
              <div className="space-y-1">
                <input
                  type="email"
                  placeholder={t.email || 'Email'}
                  className={`w-full border-b-2 border-gray-300 dark:border-gray-600 bg-transparent text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 p-3 md:p-3 text-base focus:outline-none focus:border-primary transition-all duration-300 font-secondary ${direction === 'rtl' ? 'text-right' : 'text-left'} ${direction === 'rtl' ? 'font-noto' : 'font-secondary'}`}
                  id="email"
                  onChange={handleChange}
                  dir="auto"
                />
              </div>
              
              <div className="space-y-1">
                <input
                  type="password"
                  placeholder={t.password || 'Password'}
                  className={`w-full border-b-2 border-gray-300 dark:border-gray-600 bg-transparent text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 p-3 md:p-3 text-base focus:outline-none focus:border-primary transition-all duration-300 font-secondary ${direction === 'rtl' ? 'text-right' : 'text-left'} ${direction === 'rtl' ? 'font-noto' : 'font-secondary'}`}
                  id="password"
                  onChange={handleChange}
                  dir="auto"
                />
              </div>
              
              <button
                disabled={loading}
                className="w-full bg-primary text-white font-bold py-4 md:py-3 text-base md:text-base hover:bg-red-700 disabled:opacity-80 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-primary transition-all duration-300 rounded-sm shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <GE02Loader size="small" />
                    <span className="font-secondary">{common.loading || 'Loading...'}</span>
                  </>
                ) : (
                  t.signInButton || 'Sign In'
                )}
              </button>
              
              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-black text-gray-500 dark:text-gray-400 font-secondary">
                    {t.or || 'or'}
                  </span>
                </div>
              </div>
              
              <OAuth />
            </form>
            
            <div className={`flex flex-row items-center gap-2 mt-8 md:mt-8 text-sm font-secondary ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
              <p className="text-gray-600 dark:text-gray-300">{t.noAccount || "Don't have an account?"}</p>
              <Link to={'/sign-up'} className="text-primary hover:text-red-700 transition-colors duration-300 font-medium">
                {t.signUp || 'Sign up'}
              </Link>
            </div>
            
            <div className="mt-4">
              <button
                type="button"
                onClick={() => navigate('/cadreBack')}
                className={`text-sm text-primary hover:text-red-700 transition-colors duration-300 font-secondary ${direction === 'rtl' ? 'text-right' : 'text-left'}`}
              >
                {t.cadreInternalLogin || 'Cadre Internal Login'}
              </button>
            </div>
            
            {error && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-sm">
                <p className="text-primary text-sm font-secondary">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
