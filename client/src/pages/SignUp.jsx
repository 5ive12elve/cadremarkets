import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OAuth from '../components/OAuth';
import toast from 'react-hot-toast';
import { FiCheck } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';
import { getPageTranslations } from '../locales/translations';
import { apiCall } from '../utils/apiConfig';

export default function SignUp() {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const navigate = useNavigate();
  
  // Language context
  const { currentLang, direction } = useLanguage();
  const t = getPageTranslations('signup', currentLang);
  const common = getPageTranslations('common', currentLang);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!termsAccepted) {
      setError(t.mustAcceptTerms || 'You must accept the Terms of Service and Privacy Policy to create an account.');
      return;
    }
    
    try {
      setLoading(true);
      const data = await apiCall('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      if (data.success === false) {
        setLoading(false);
        setError(data.message);
        return;
      }
      setLoading(false);
      setError(null);

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
                  {t.accountCreated || 'Account created!'}
                </h3>
                <p className={`text-[#db2b2e] text-sm ${direction === 'rtl' ? 'font-noto' : 'font-secondary'}`}>
                  {t.canNowSignIn || 'You can now sign in to your account'}
                </p>
            </div>
          </div>
        </div>
      ), {
        duration: 3000,
        position: 'top-center',
      });

      navigate('/sign-in');
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };
  
  return (
    <div className="bg-white dark:bg-black font-primary transition-colors duration-300 min-h-screen" dir={direction}>
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
        {/* Left Graphic - Hidden on mobile, shown on desktop */}
        <div className="bg-white dark:bg-black hidden md:flex items-center justify-center transition-colors duration-300">
          <img src="/mediassets/CMSUP3.png" alt="Phone Cart" className="w-4/5" />
        </div>

        {/* Right Form */}
        <div className="bg-white dark:bg-black text-black dark:text-white flex flex-col justify-center p-4 sm:p-6 md:p-10 lg:p-20 relative transition-colors duration-300">
          {/* Mobile Background Image */}
          <div className="md:hidden absolute inset-0 opacity-5">
            <img 
              src="/mediassets/CMSUP3.png" 
              alt="Background" 
              className="w-full h-full object-contain object-center"
            />
          </div>
          
          {/* Form Content */}
          <div className="relative z-10 w-full max-w-sm mx-auto md:max-w-none md:mx-0">
            {/* Mobile Logo/Header */}
            <div className="md:hidden text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-yellowAccent rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">CM</span>
              </div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white font-primary">
                Cadre Markets
              </h2>
            </div>

            <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-2 font-primary ${direction === 'rtl' ? 'text-right' : 'text-left'} ${direction === 'rtl' ? 'font-amiri' : 'font-primary'}`}>
              {t.title || 'Create an account'}
            </h1>
            <p className={`mb-8 md:mb-8 text-sm sm:text-base text-gray-600 dark:text-gray-300 font-secondary ${direction === 'rtl' ? 'text-right' : 'text-left'} ${direction === 'rtl' ? 'font-noto' : 'font-secondary'}`}>
              {t.enterDetailsBelow || 'Enter your details below'}
            </p>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:gap-4 space-y-4">
              <div className="space-y-1">
                <input
                  type="text"
                  placeholder={t.name || "Name"}
                  className={`w-full border-b-2 border-gray-300 dark:border-gray-600 bg-transparent text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 p-3 md:p-3 text-base focus:outline-none focus:border-primary transition-all duration-300 font-secondary ${direction === 'rtl' ? 'text-right' : 'text-left'} ${direction === 'rtl' ? 'font-noto' : 'font-secondary'}`}
                  id="username"
                  onChange={handleChange}
                  required
                  dir="auto"
                />
              </div>
              
              <div className="space-y-1">
                <input
                  type="email"
                  placeholder={t.email || "Email"}
                  className={`w-full border-b-2 border-gray-300 dark:border-gray-600 bg-transparent text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 p-3 md:p-3 text-base focus:outline-none focus:border-primary transition-all duration-300 font-secondary ${direction === 'rtl' ? 'text-right' : 'text-left'} ${direction === 'rtl' ? 'font-noto' : 'font-secondary'}`}
                  id="email"
                  onChange={handleChange}
                  required
                  dir="auto"
                />
              </div>
              
              <div className="space-y-1">
                <input
                  type="password"
                  placeholder={t.password || "Password"}
                  className={`w-full border-b-2 border-gray-300 dark:border-gray-600 bg-transparent text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 p-3 md:p-3 text-base focus:outline-none focus:border-primary transition-all duration-300 font-secondary ${direction === 'rtl' ? 'text-right' : 'text-left'} ${direction === 'rtl' ? 'font-noto' : 'font-secondary'}`}
                  id="password"
                  onChange={handleChange}
                  required
                  dir="auto"
                />
              </div>
              
              {/* Terms Acceptance Checkbox */}
              <div className="flex items-start gap-3 mt-6 p-4 bg-gray-50 dark:bg-gray-900/30 rounded-sm border border-gray-200 dark:border-gray-700">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 w-5 h-5 text-primary bg-transparent border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-primary focus:ring-2 focus:ring-offset-0"
                />
                <label htmlFor="terms" className={`text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-secondary ${direction === 'rtl' ? 'text-right' : 'text-left'} ${direction === 'rtl' ? 'font-noto' : 'font-secondary'}`}>
                  {direction === 'rtl' ? (
                    <>
                      {t.agreeToTerms || 'أوافق على شروط كادر ماركتس'}{' '}
                      <Link to="/terms-of-service" className="text-primary hover:text-red-700 transition-colors duration-300 font-medium" target="_blank">
                        {t.termsOfService || 'شروط الخدمة'}
                      </Link>
                      {' '}و{' '}
                      <Link to="/privacy-policy" className="text-primary hover:text-red-700 transition-colors duration-300 font-medium" target="_blank">
                        {t.privacyPolicy || 'سياسة الخصوصية'}
                      </Link>
                      ، {t.includingCommission || 'بما في ذلك عمولة السوق و مسؤوليات البائع.'}
                    </>
                  ) : (
                    <>
                  {t.agreeToTerms || 'I agree to Cadre Markets\''}{' '}
                  <Link to="/terms-of-service" className="text-primary hover:text-red-700 transition-colors duration-300 font-medium" target="_blank">
                    {t.termsOfService || 'Terms of Service'}
                  </Link>
                  {' '}and{' '}
                  <Link to="/privacy-policy" className="text-primary hover:text-red-700 transition-colors duration-300 font-medium" target="_blank">
                    {t.privacyPolicy || 'Privacy Policy'}
                  </Link>
                  , {t.includingCommission || 'including marketplace commission and seller responsibilities.'}
                    </>
                  )}
                </label>
              </div>
              
              <button
                disabled={loading}
                className="w-full bg-primary text-white font-bold py-4 md:py-3 text-base md:text-base hover:bg-red-700 disabled:opacity-80 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-primary transition-all duration-300 rounded-sm shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] mt-4"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-t-2 border-r-2 border-white animate-spin rounded-full"></div>
                    <span className="font-secondary">{common?.loading || 'Loading...'}</span>
                  </>
                ) : (
                  t.createAccountButton || 'Create Account'
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
            
            <div className={`flex flex-col sm:flex-row gap-2 mt-8 md:mt-8 text-sm font-secondary ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
              <p className="text-gray-600 dark:text-gray-300">{t.haveAccount || 'Already have an account?'}</p>
              <Link to={'/sign-in'} className="text-primary hover:text-red-700 transition-colors duration-300 font-medium">
                {t.logIn || 'Log in'}
              </Link>
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
