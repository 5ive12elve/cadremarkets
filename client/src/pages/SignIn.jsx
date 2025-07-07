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
        dispatch(signInFailure(data.message));
        toast.error(data.message);
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
      }, 100);

    } catch (error) {
      console.error('Signin error:', error);
      dispatch(signInFailure(error.message));
      toast.error(error.message);
    }
  };
  return (
    <div className="bg-white dark:bg-black font-primary transition-colors duration-300" dir={direction}>
      <div className="grid grid-cols-1 md:grid-cols-2 md:min-h-screen">
        {/* Left Graphic - Hidden on mobile, shown on desktop */}
        <div className="bg-white dark:bg-black hidden md:flex items-center justify-center transition-colors duration-300">
          <img src="/mediassets/CMSUP55.png" alt="Phone Cart" className="w-4/5" />
        </div>

        {/* Right Form */}
        <div className="bg-white dark:bg-black text-black dark:text-white flex flex-col justify-center p-6 md:p-10 lg:p-20 relative transition-colors duration-300">
          {/* Mobile Background Image */}
          <div className="md:hidden absolute inset-0 opacity-10">
            <img 
              src="/mediassets/CMSUP5.png" 
              alt="Background" 
              className="w-full h-full object-contain object-center"
            />
          </div>
          
          {/* Form Content */}
          <div className="relative z-10">
        <h1 className={`text-2xl md:text-4xl font-bold mb-2 font-primary ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
          {t.title || 'Sign In'}
        </h1>
        <p className={`mb-6 md:mb-8 text-xs md:text-sm text-gray-600 dark:text-white/80 font-secondary ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
          {common.pleaseEnterDetails || 'Please enter your details'}
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:gap-4">
          <input
            type="email"
            placeholder={t.email || 'Email'}
            className={`border-b border-gray-300 dark:border-white bg-transparent text-black dark:text-white placeholder-gray-500 dark:placeholder-white p-2 md:p-3 text-sm md:text-base focus:outline-none transition-colors duration-300 font-secondary ${direction === 'rtl' ? 'text-right' : 'text-left'}`}
            id="email"
            onChange={handleChange}
            dir="auto"
          />
          <input
            type="password"
            placeholder={t.password || 'Password'}
            className={`border-b border-gray-300 dark:border-white bg-transparent text-black dark:text-white placeholder-gray-500 dark:placeholder-white p-2 md:p-3 text-sm md:text-base focus:outline-none transition-colors duration-300 font-secondary ${direction === 'rtl' ? 'text-right' : 'text-left'}`}
            id="password"
            onChange={handleChange}
            dir="auto"
          />
          <button
            disabled={loading}
            className="bg-primary text-white font-bold py-2 md:py-3 text-sm md:text-base hover:opacity-90 disabled:opacity-80 flex items-center justify-center gap-2 font-primary"
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
          <OAuth />
        </form>
        <div className={`flex gap-2 mt-6 md:mt-8 text-xs md:text-sm font-secondary ${direction === 'rtl' ? 'justify-end' : 'justify-start'}`}>
          <p>{t.noAccount || "Don't have an account?"}</p>
          <Link to={'/sign-up'}>
            <span className="text-primary hover:underline">{t.signUp || 'Sign up'}</span>
          </Link>
        </div>
        <div className="mt-3 md:mt-4">
          <button
            type="button"
            onClick={() => navigate('/cadreBack')}
            className={`text-xs md:text-sm text-primary hover:underline font-secondary ${direction === 'rtl' ? 'text-right' : 'text-left'}`}
          >
            {t.cadreInternalLogin || 'Cadre Internal Login'}
          </button>
          </div>
          {error && <p className="text-primary mt-5 text-sm font-secondary">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
