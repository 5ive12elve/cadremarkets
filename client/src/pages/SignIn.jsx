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
      console.log('Signin response:', data);
      console.log('Token in response:', !!data.token);
      
      if (data.success === false) {
        dispatch(signInFailure(data.message));
        toast.error(data.message);
        return;
      }
      
      // Store token in localStorage as fallback for cross-origin cookie issues
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        console.log('Token stored in localStorage for cross-origin fallback');
        console.log('Stored token length:', data.token.length);
        
        // Verify token was stored correctly
        const storedToken = localStorage.getItem('auth_token');
        console.log('Token verification - stored token exists:', !!storedToken);
        console.log('Token verification - stored token length:', storedToken ? storedToken.length : 0);
        console.log('Token verification - tokens match:', storedToken === data.token);
        
        // Test if we can access the token immediately
        console.log('=== TOKEN ACCESS TEST ===');
        console.log('localStorage.getItem("auth_token"):', !!localStorage.getItem('auth_token'));
        console.log('localStorage keys:', Object.keys(localStorage));
        
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
          const authTestResponse = await apiCall('/api/user/test-auth');
          console.log('Authenticated API test successful:', authTestResponse);
        } catch (testError) {
          console.error('Immediate API test failed:', testError);
        }
      } else {
        console.log('No token received in signin response');
      }
      
      dispatch(signInSuccess(data.user));
      
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

      navigate('/');
    } catch (error) {
      console.error('Sign in error:', error);
      dispatch(signInFailure(error.message || 'Sign in failed'));
      toast.error(common.signInError || 'Sign in failed. Please try again.');
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
