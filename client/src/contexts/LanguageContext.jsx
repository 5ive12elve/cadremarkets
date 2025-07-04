import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [isArabic, setIsArabic] = useState(() => {
    // Check localStorage first, default to English
    const saved = localStorage.getItem('language');
    return saved === 'ar';
  });

  useEffect(() => {
    // Save language preference
    localStorage.setItem('language', isArabic ? 'ar' : 'en');
    
    // Apply language direction to document
    if (isArabic) {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', 'en');
    }
  }, [isArabic]);

  const toggleLanguage = () => {
    setIsArabic(!isArabic);
  };

  const language = {
    isArabic,
    toggleLanguage,
    currentLang: isArabic ? 'ar' : 'en',
    direction: isArabic ? 'rtl' : 'ltr',
  };

  return (
    <LanguageContext.Provider value={language}>
      {children}
    </LanguageContext.Provider>
  );
};

LanguageProvider.propTypes = {
  children: PropTypes.node.isRequired,
}; 