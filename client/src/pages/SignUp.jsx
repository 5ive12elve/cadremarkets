import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OAuth from '../components/OAuth';
import toast from 'react-hot-toast';
import { FiCheck } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';
import { getPageTranslations } from '../locales/translations';

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
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
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
    <div className="bg-white dark:bg-black font-primary transition-colors duration-300" dir={direction}>
      <div className="grid grid-cols-1 md:grid-cols-2 md:min-h-screen">
        {/* Left Graphic - Hidden on mobile, shown on desktop */}
        <div className="bg-white dark:bg-black hidden md:flex items-center justify-center transition-colors duration-300">
          <img src="/mediassets/CMSUP3.png" alt="Phone Cart" className="w-4/5" />
        </div>

        {/* Right Form */}
        <div className="bg-white dark:bg-black text-black dark:text-white flex flex-col justify-center p-6 md:p-10 lg:p-20 relative transition-colors duration-300">
          {/* Mobile Background Image */}
          <div className="md:hidden absolute inset-0 opacity-10">
            <img 
              src="/mediassets/CMSUP3.png" 
              alt="Background" 
              className="w-full h-full object-contain object-center"
            />
          </div>
          
          {/* Form Content */}
          <div className="relative z-10">
            <h1 className={`text-2xl md:text-4xl font-bold mb-2 font-primary ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
              {t.title || 'Create an account'}
            </h1>
            <p className={`mb-6 md:mb-8 text-xs md:text-sm text-gray-600 dark:text-white/80 font-secondary ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
              {t.enterDetailsBelow || 'Enter your details below'}
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:gap-4">
              <input
                type="text"
                placeholder={t.name || "Name"}
                className={`border-b border-gray-300 dark:border-white bg-transparent text-black dark:text-white placeholder-gray-500 dark:placeholder-white p-2 md:p-3 text-sm md:text-base focus:outline-none transition-colors duration-300 font-secondary ${direction === 'rtl' ? 'text-right' : 'text-left'}`}
                id="username"
                onChange={handleChange}
                required
                dir="auto"
              />
              <input
                type="email"
                placeholder={t.email || "Email"}
                className={`border-b border-gray-300 dark:border-white bg-transparent text-black dark:text-white placeholder-gray-500 dark:placeholder-white p-2 md:p-3 text-sm md:text-base focus:outline-none transition-colors duration-300 font-secondary ${direction === 'rtl' ? 'text-right' : 'text-left'}`}
                id="email"
                onChange={handleChange}
                required
                dir="auto"
              />
              <input
                type="password"
                placeholder={t.password || "Password"}
                className={`border-b border-gray-300 dark:border-white bg-transparent text-black dark:text-white placeholder-gray-500 dark:placeholder-white p-2 md:p-3 text-sm md:text-base focus:outline-none transition-colors duration-300 font-secondary ${direction === 'rtl' ? 'text-right' : 'text-left'}`}
                id="password"
                onChange={handleChange}
                required
                dir="auto"
              />
              
              {/* Terms Acceptance Checkbox */}
              <div className="flex items-start gap-3 mt-4">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 text-[#db2b2e] bg-transparent border-2 border-red-500 dark:border-red-500 rounded focus:ring-red-500 focus:ring-2"
                />
                <label htmlFor="terms" className={`text-xs md:text-sm text-gray-600 dark:text-white/80 leading-relaxed font-secondary ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                  {direction === 'rtl' ? (
                    <>
                      {t.agreeToTerms || 'أوافق على شروط كادر ماركتس'}{' '}
                      <Link to="/terms-of-service" className="text-[#db2b2e] hover:underline font-medium" target="_blank">
                        {t.termsOfService || 'شروط الخدمة'}
                      </Link>
                      {' '}و{' '}
                      <Link to="/privacy-policy" className="text-[#db2b2e] hover:underline font-medium" target="_blank">
                        {t.privacyPolicy || 'سياسة الخصوصية'}
                      </Link>
                      ، {t.includingCommission || 'بما في ذلك عمولة السوق و مسؤوليات البائع.'}
                    </>
                  ) : (
                    <>
                  {t.agreeToTerms || 'I agree to Cadre Markets\''}{' '}
                  <Link to="/terms-of-service" className="text-[#db2b2e] hover:underline font-medium" target="_blank">
                    {t.termsOfService || 'Terms of Service'}
                  </Link>
                  {' '}and{' '}
                  <Link to="/privacy-policy" className="text-[#db2b2e] hover:underline font-medium" target="_blank">
                    {t.privacyPolicy || 'Privacy Policy'}
                  </Link>
                  , {t.includingCommission || 'including marketplace commission and seller responsibilities.'}
                    </>
                  )}
                </label>
              </div>
              
              <button
                disabled={loading}
                className="bg-primary text-white font-bold py-2 md:py-3 text-sm md:text-base hover:opacity-90 disabled:opacity-80 mt-2 font-primary"
              >
                {loading ? (common?.loading || 'Loading...') : (t.createAccountButton || 'Create Account')}
              </button>
              <OAuth />
            </form>
            <div className={`flex gap-2 mt-6 md:mt-8 text-xs md:text-sm font-secondary ${direction === 'rtl' ? 'justify-end' : 'justify-start'}`}>
              <p>{t.haveAccount || 'Already have an account?'}</p>
              <Link to={'/sign-in'}>
                <span className="text-primary hover:underline">{t.logIn || 'Log in'}</span>
              </Link>
            </div>
            {error && <p className="text-primary mt-5 text-sm font-secondary">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
