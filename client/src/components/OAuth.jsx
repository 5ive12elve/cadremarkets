import { GoogleAuthProvider, getAuth, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { app } from '../firebase';
import { useDispatch, useSelector } from 'react-redux';
import { signInSuccess, signInStart, signInFailure } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getPageTranslations } from '../locales/translations';
import toast from 'react-hot-toast';
import { apiCall } from '../utils/apiConfig';

export default function OAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { currentLang } = useLanguage();
  const t = getPageTranslations('common', currentLang);
  const { currentUser } = useSelector((state) => state.user);

  // Check for redirect result on component mount
  useEffect(() => {
    const checkRedirectResult = async () => {
      const auth = getAuth(app);
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          await handleAuthResult(result);
        }
      } catch (error) {
        console.error('Redirect result error:', error);
        handleAuthError(error);
      }
    };

    checkRedirectResult();
  }, []);

  const handleAuthResult = async (result) => {
    try {
      setIsLoading(true);
      dispatch(signInStart());

      // Get the Firebase ID token for server verification
      const idToken = await result.user.getIdToken();
      
      const data = await apiCall('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify({
          name: result.user.displayName,
          email: result.user.email,
          photo: result.user.photoURL,
          tokenId: idToken, // Send the Firebase ID token for server verification
        }),
      });
      
      console.log('=== GOOGLE AUTH RESPONSE DEBUG ===');
      console.log('Google auth response:', data);
      console.log('Token in response:', !!data.token);
      
      if (data.success) {
        // Store token in all locations (localStorage, sessionStorage, user object)
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
          sessionStorage.setItem('auth_token', data.token);
          const userWithToken = { ...data.user, token: data.token };
          localStorage.setItem('user', JSON.stringify(userWithToken));
          console.log('Token stored in localStorage, sessionStorage, and user object for cross-origin fallback');
          console.log('Stored token length:', data.token.length);
          console.log('Token preview:', data.token.substring(0, 20) + '...');
          
          // Immediate verification
          const storedToken = localStorage.getItem('auth_token');
          const sessionToken = sessionStorage.getItem('auth_token');
          const userToken = JSON.parse(localStorage.getItem('user') || '{}').token;
          
          console.log('=== OAUTH STORAGE VERIFICATION ===');
          console.log('localStorage token exists:', !!storedToken);
          console.log('sessionStorage token exists:', !!sessionToken);
          console.log('user object token exists:', !!userToken);
          console.log('All tokens match:', storedToken === sessionToken && sessionToken === userToken);
        } else {
          console.log('No token received in Google auth response');
        }
        // Dispatch with both user and token (fix)
        console.log('=== OAUTH REDUX DISPATCH ===');
        console.log('Dispatching signInSuccess with user and token');
        console.log('User object:', !!data.user);
        console.log('Token object:', !!data.token);
        dispatch(signInSuccess({ user: data.user, token: data.token }));
        
        // CRITICAL FIX: Wait for Redux state to update before navigation
        console.log('=== WAITING FOR REDUX UPDATE (OAUTH) ===');
        await new Promise(resolve => setTimeout(resolve, 200)); // Wait 200ms for Redux to update
        
        // Verify Redux state before navigation
        if (typeof window !== 'undefined' && window.__REDUX_STORE__) {
          const state = window.__REDUX_STORE__.getState();
          console.log('Redux state before OAuth navigation:', {
            hasUser: !!state.user?.currentUser,
            hasToken: !!state.user?.token,
            tokenLength: state.user?.token ? state.user.token.length : 0
          });
        }
        
        // Add delay before navigation to ensure Redux state is updated
        setTimeout(() => {
          console.log('=== OAUTH PRE-NAVIGATION CHECK ===');
          console.log('Token before OAuth navigation:', !!localStorage.getItem('auth_token'));
          console.log('Token length before OAuth navigation:', localStorage.getItem('auth_token')?.length || 0);
          
          // Check Redux state before navigation
          if (typeof window !== 'undefined' && window.__REDUX_STORE__) {
            const state = window.__REDUX_STORE__.getState();
            console.log('Redux token before OAuth navigation:', !!state.user?.token);
            console.log('Redux token length before OAuth navigation:', state.user?.token ? state.user.token.length : 0);
          }
          
          console.log('About to navigate to homepage from OAuth...');
          navigate('/');
        }, 300); // Increased delay to 300ms
      } else {
        throw new Error(data.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('Auth result handling failed:', error);
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthError = (error) => {
    dispatch(signInFailure(error.message || 'Google sign in failed'));
    setIsLoading(false);
  };

  const handleGoogleClick = async () => {
    if (isLoading) return;

    // Check if user is already signed in
    if (currentUser) {
      toast.error(t.alreadySignedIn || 'You are already signed in. Please sign out first to use a different account.');
      return;
    }

    try {
      setIsLoading(true);
      dispatch(signInStart());

      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      // Configure provider settings
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const auth = getAuth(app);

      try {
        // Try popup first (most user-friendly)
        const result = await signInWithPopup(auth, provider);
        await handleAuthResult(result);
      } catch (popupError) {
        console.log('Popup failed, trying redirect method:', popupError);
        
        // If popup fails due to COOP or other issues, try redirect
        if (popupError.code === 'auth/popup-blocked' || 
            popupError.code === 'auth/popup-closed-by-user' ||
            popupError.message?.includes('Cross-Origin-Opener-Policy')) {
          
          // Use redirect as fallback
          await signInWithRedirect(auth, provider);
          // Note: redirect will reload the page, result handled in useEffect
        } else {
          throw popupError;
        }
      }
    } catch (error) {
      console.error('Google authentication error:', error);
      handleAuthError(error);
      }
  };

  return (
    <button
      onClick={handleGoogleClick}
      disabled={isLoading}
      type='button'
      className='bg-[#f3eb4b] flex items-center justify-center gap-2 w-full p-3 hover:opacity-95 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200'
    >
      {isLoading ? (
        <>
          <div className="w-5 h-5 border-t-2 border-r-2 border-[#db2b2e] animate-spin rounded-full"></div>
          <span className="text-[#db2b2e] font-bold">
            {t.loading || 'Loading...'}
          </span>
        </>
      ) : (
        <>
      <FaGoogle className="text-[#db2b2e] text-xl" />
          <span className="text-[#db2b2e] font-bold">
            {t.continueWithGoogle || 'Continue with Google'}
          </span>
        </>
      )}
    </button>
  );
}
