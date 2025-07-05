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

      const data = await apiCall('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify({
          name: result.user.displayName,
          email: result.user.email,
          photo: result.user.photoURL,
          tokenId: result.user.accessToken || 'google-oauth',
        }),
      });
      
      if (data.success) {
        dispatch(signInSuccess(data.user));
        navigate('/');
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
