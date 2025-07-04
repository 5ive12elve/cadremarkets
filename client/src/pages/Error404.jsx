import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../locales/translations';

const Error404 = () => {
  const { isArabic, currentLang } = useLanguage();

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300 overflow-hidden" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Subtle background decoration */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img 
          src="/mediassets/Filter01.png" 
          alt="" 
          className="w-96 h-96 object-contain opacity-[0.03] dark:opacity-[0.05] select-none"
        />
      </div>
      
      <div className="relative z-10 text-center px-4">
        <h1 className={`text-9xl font-bold text-gray-800 dark:text-gray-200 ${
          isArabic ? 'font-amiri' : 'font-nt-bold'
        }`}>404</h1>
        <h2 className={`text-2xl md:text-3xl font-medium text-gray-700 dark:text-gray-300 mb-4 ${
          isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
        }`}>
          {useTranslation('error404', 'title', currentLang)}
        </h2>
        <p className={`text-gray-600 dark:text-gray-400 mb-8 ${
          isArabic ? 'font-noto' : 'font-nt'
        }`}>
          {useTranslation('error404', 'message', currentLang)}
        </p>
        <Link
          to="/"
          className={`inline-block px-6 py-3 bg-[#db2b2e] text-white rounded-lg hover:bg-[#c41e22] transition-colors ${
            isArabic ? 'font-noto' : 'font-nt'
          }`}
        >
          {useTranslation('error404', 'goHome', currentLang)}
        </Link>
      </div>
    </div>
  );
};

export default Error404; 