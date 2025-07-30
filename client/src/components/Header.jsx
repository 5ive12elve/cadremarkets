import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaSearch, FaShoppingBag } from 'react-icons/fa';
import { motion } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';
import { useLanguage } from '../contexts/LanguageContext';
import { getPageTranslations } from '../locales/translations';
import { AnimatePresence } from 'framer-motion';

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const { cartItems } = useSelector((state) => state.cart);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const mobileMenuRef = useRef(null);
  
  // Language context
  const { currentLang, isArabic } = useLanguage();
  const t = getPageTranslations('header', currentLang);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }
  }, [location.search]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('searchTerm', searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  return (
    <header className="fixed top-[24px] sm:top-[32px] left-0 right-0 z-40">
      <div className={`bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-[#db2b2e]/20 transition-all duration-300 ${isScrolled ? 'py-1.5 sm:py-2' : 'py-2 sm:py-2.5'}`}
        style={{ position: 'relative', zIndex: 40 }}>
        {/* MOBILE HEADER (lg:hidden) */}
        <div className="lg:hidden relative w-full h-[56px] sm:h-[64px] md:h-[72px]">
          {/* Menu button and profile icon, RTL/LTR swap */}
          {isArabic ? (
            <>
              {/* Menu button on the left */}
              <button
                className="absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center ml-2 sm:ml-3 focus:outline-none transition-transform duration-200 hover:scale-105"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Open menu"
                type="button"
              >
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="8" width="20" height="2.2" rx="1.1" fill="#db2b2e" />
                  <rect x="4" y="13.9" width="20" height="2.2" rx="1.1" fill="#db2b2e" />
                  <rect x="4" y="19.8" width="20" height="2.2" rx="1.1" fill="#db2b2e" />
                </svg>
              </button>
              {/* Cart icon between logo and sign-in */}
              <Link to="/cart" className="absolute right-16 sm:right-20 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center transition-transform duration-200 hover:scale-105 pointer-events-auto">
                <div className="relative">
                  <FaShoppingBag className="h-6 w-6 sm:h-7 sm:w-7 text-black dark:text-white hover:text-primary transition-colors duration-200" />
                  {cartItems?.length > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-primary rounded-full flex items-center justify-center"
                    >
                      <span className="text-black text-xs font-bold leading-none">
                        {cartItems.length > 9 ? '9+' : cartItems.length}
                      </span>
                    </motion.div>
                  )}
                </div>
              </Link>
              {/* Profile icon on the right */}
              <Link to={currentUser ? '/profile' : '/sign-in'} className="absolute right-0 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center transition-transform duration-200 hover:scale-105 pointer-events-auto mr-2 sm:mr-3">
                {currentUser ? (
                  <img
                    className="rounded-full h-7 w-7 sm:h-8 sm:w-8 object-cover border-2 border-primary"
                    src={currentUser.avatar}
                    alt="profile"
                  />
                ) : (
                  <span className="text-sm font-normal text-black dark:text-white hover:text-primary transition-colors duration-200 underline underline-offset-4 decoration-1 hover:decoration-2 font-primary">
                    {t.signin || 'Sign in'}
                  </span>
                )}
              </Link>
            </>
          ) : (
            <>
              {/* Menu button on the left */}
              <button
                className="absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center ml-2 sm:ml-3 focus:outline-none transition-transform duration-200 hover:scale-105"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Open menu"
                type="button"
              >
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="8" width="20" height="2.2" rx="1.1" fill="#db2b2e" />
                  <rect x="4" y="13.9" width="20" height="2.2" rx="1.1" fill="#db2b2e" />
                  <rect x="4" y="19.8" width="20" height="2.2" rx="1.1" fill="#db2b2e" />
                </svg>
              </button>
              {/* Cart icon between logo and sign-in */}
              <Link to="/cart" className="absolute right-16 sm:right-20 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center transition-transform duration-200 hover:scale-105 pointer-events-auto">
                <div className="relative">
                  <FaShoppingBag className="h-6 w-6 sm:h-7 sm:w-7 text-black dark:text-white hover:text-primary transition-colors duration-200" />
                  {cartItems?.length > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-primary rounded-full flex items-center justify-center"
                    >
                      <span className="text-black text-xs font-bold leading-none">
                        {cartItems.length > 9 ? '9+' : cartItems.length}
                      </span>
                    </motion.div>
                  )}
                </div>
              </Link>
              {/* Profile icon on the right */}
              <Link to={currentUser ? '/profile' : '/sign-in'} className="absolute right-0 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center transition-transform duration-200 hover:scale-105 pointer-events-auto mr-2 sm:mr-3">
                {currentUser ? (
                  <img
                    className="rounded-full h-7 w-7 sm:h-8 sm:w-8 object-cover border-2 border-primary"
                    src={currentUser.avatar}
                    alt="profile"
                  />
                ) : (
                  <span className="text-sm font-normal text-black dark:text-white hover:text-primary transition-colors duration-200 underline underline-offset-4 decoration-1 hover:decoration-2 font-primary">
                    {t.signin || 'Sign in'}
                  </span>
                )}
              </Link>
            </>
          )}
          {/* Centered logo with home navigation */}
          <Link to="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center pointer-events-auto transition-transform duration-300 hover:scale-105">
            <img
              src="/mediassets/Cadre-su.png"
              alt="Cadre Markets Logo"
              className="h-12 sm:h-14 md:h-16 w-auto object-contain"
            />
          </Link>
        </div>
        {/* MOBILE MENU DRAWER */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, y: -24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="lg:hidden absolute top-full left-0 right-0 bg-white dark:bg-black p-2 sm:p-3 border-t border-primary/10 shadow-lg z-50"
              ref={mobileMenuRef}
            >
              <nav>
                <ul className="flex flex-col gap-2 mt-2">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <li className={`text-base sm:text-lg font-normal font-primary ${
                    isActive('/') ? 'text-primary font-bold' : 'text-black dark:text-white'
                  }`}>
                    {t.home || 'Home'}
                  </li>
                </Link>
                <Link to="/search" onClick={() => setIsMobileMenuOpen(false)}>
                  <li className={`text-base sm:text-lg font-normal font-primary ${
                    isActive('/search') ? 'text-primary font-bold' : 'text-black dark:text-white'
                  }`}>
                    {t.marketplace || 'Marketplace'}
                  </li>
                </Link>
                <Link to="/projects" onClick={() => setIsMobileMenuOpen(false)}>
                  <li className={`text-base sm:text-lg font-normal font-primary ${
                    isActive('/projects') ? 'text-primary font-bold' : 'text-black dark:text-white'
                  }`}>
                    {t.projects || 'Projects'}
                  </li>
                </Link>
                <Link to="/services" onClick={() => setIsMobileMenuOpen(false)}>
                  <li className={`text-base sm:text-lg font-normal font-primary ${
                    isActive('/services') ? 'text-primary font-bold' : 'text-black dark:text-white'
                  }`}>
                    {t.services || 'Services'}
                  </li>
                </Link>
                <Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>
                  <li className={`text-base sm:text-lg font-normal font-primary ${
                    isActive('/about') ? 'text-primary font-bold' : 'text-black dark:text-white'
                  }`}>
                    {t.about || 'About'}
                  </li>
                </Link>
                <li className="flex items-center justify-between pt-3 border-t border-gray-300 dark:border-white/20">
                  <span className="text-base sm:text-lg font-normal text-black dark:text-white font-primary">
                    {t.languageTheme || 'Language / Theme'}
                  </span>
                  <div className="flex items-center gap-3">
                    <LanguageToggle />
                    <ThemeToggle />
                  </div>
                </li>
              </ul>
            </nav>
            <form
              onSubmit={(e) => {
                handleSubmit(e);
                setIsMobileMenuOpen(false);
              }}
              className="mt-2 flex items-center border border-transparent hover:border-primary focus-within:border-primary transition-colors duration-200 p-2 bg-white/50 dark:bg-black/50"
              dir={isArabic ? 'rtl' : 'ltr'}
            >
              <input
                type="text"
                placeholder={t.search || 'Search...'}
                className={`bg-transparent focus:outline-none w-full py-2 text-black dark:text-white placeholder-gray-500 dark:placeholder-white/70 text-base font-primary ${
                  isArabic ? 'text-right' : 'text-left'
                }`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                dir={isArabic ? 'rtl' : 'ltr'}
              />
              <button className={`hover:text-primary transition-colors duration-200 ${
                isArabic ? 'mr-2' : 'ml-2'
              }`}>
                <FaSearch className="text-black dark:text-white hover:text-primary transition-colors duration-200 w-5 h-5" />
              </button>
            </form>
          </motion.div>
        )}
        </AnimatePresence>
        {/* DESKTOP HEADER (hidden on mobile) */}
        <div className={`hidden lg:flex justify-between items-center max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 ${isArabic ? 'flex-row-reverse' : 'flex-row'}`}> 
          <motion.button 
            className="lg:hidden order-first relative w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 flex flex-col justify-center items-center bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-all duration-300"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="w-4 sm:w-5 h-0.5 bg-primary mb-0.5 sm:mb-1 origin-center"
              animate={isMobileMenuOpen ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
            <motion.div
              className="w-4 sm:w-5 h-0.5 bg-primary mb-0.5 sm:mb-1"
              animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
            <motion.div
              className="w-4 sm:w-5 h-0.5 bg-primary origin-center"
              animate={isMobileMenuOpen ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
            {cartItems?.length > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-primary rounded-full flex items-center justify-center"
              >
                <span className="text-black text-[8px] sm:text-xs font-bold leading-none">
                  {cartItems.length > 9 ? '9+' : cartItems.length}
                </span>
              </motion.div>
            )}
          </motion.button>

          {/* Desktop: logo on the left/right before Marketplace, mobile: logo centered */}
          <div className="relative flex items-center w-full">
            {/* Desktop logo (left/right) */}
            <div className={`hidden lg:flex items-center flex-shrink-0 ${isArabic ? 'lg:ml-0 lg:mr-0' : ''}`}> {/* Remove extra margin */}
              <Link to="/" className="flex-shrink-0 transition-transform duration-300 hover:scale-105">
                <img 
                  src="/mediassets/CadreBigUse2.png"
                  alt="Cadre Markets Logo"
                  className="h-12 sm:h-14 md:h-16 lg:h-18 xl:h-20 w-auto object-contain"
                />
              </Link>
            </div>
            {/* Desktop nav (after logo) */}
            <nav className={`hidden lg:flex items-center flex-shrink-0 ${isArabic ? 'mr-6 xl:mr-8' : 'ml-6 xl:ml-8'}`}> {/* Mirror margin for RTL */}
              <ul className="flex gap-4 xl:gap-6">
                <Link to="/search">
                  <li className={`relative text-sm xl:text-base font-normal transition-colors duration-200 ${
                    isActive('/search') ? 'text-primary font-bold' : 'hover:text-primary text-black dark:text-white'
                  } underline underline-offset-4 decoration-1 hover:decoration-2 font-primary`}>
                    {t.marketplace || 'Marketplace'}
                  </li>
                </Link>
                <Link to="/projects">
                  <li className={`relative text-sm xl:text-base font-normal transition-colors duration-200 ${
                    isActive('/projects') ? 'text-primary font-bold' : 'hover:text-primary text-black dark:text-white'
                  } underline underline-offset-4 decoration-1 hover:decoration-2 font-primary`}>
                    {t.projects || 'Projects'}
                  </li>
                </Link>
                <Link to="/services">
                  <li className={`relative text-sm xl:text-base font-normal transition-colors duration-200 ${
                    isActive('/services') ? 'text-primary font-bold' : 'hover:text-primary text-black dark:text-white'
                  } underline underline-offset-4 decoration-1 hover:decoration-2 font-primary`}>
                    {t.services || 'Services'}
                  </li>
                </Link>
                <Link to="/about">
                  <li className={`relative text-sm xl:text-base font-normal transition-colors duration-200 ${
                    isActive('/about') ? 'text-primary font-bold' : 'hover:text-primary text-black dark:text-white'
                  } underline underline-offset-4 decoration-1 hover:decoration-2 font-primary`}>
                    {t.about || 'About'}
                  </li>
                </Link>
              </ul>
            </nav>
            {/* Search Bar - Center, takes remaining space */}
            <div className={`hidden lg:flex flex-1 ${isArabic ? 'px-3 xl:px-4' : 'px-6 xl:px-8'}`}> {/* Already handles RTL */}
              <form
                onSubmit={handleSubmit}
                className="w-full max-w-lg px-3 py-1.5 xl:px-4 xl:py-2 flex items-center border border-transparent hover:border-primary focus-within:border-primary transition-colors duration-200 bg-white/50 dark:bg-black/50 backdrop-blur-sm"
                dir={isArabic ? 'rtl' : 'ltr'}
              >
                <input
                  type="text"
                  placeholder={t.search || 'Search...'}
                  className={`bg-transparent focus:outline-none w-full text-black dark:text-white placeholder-gray-500 dark:placeholder-white/70 text-sm xl:text-base font-primary ${
                    isArabic ? 'text-right' : 'text-left'
                  }`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  dir={isArabic ? 'rtl' : 'ltr'}
                />
                <button className={`hover:text-primary transition-colors duration-200 flex-shrink-0 ${
                  isArabic ? 'mr-2' : 'ml-2'
                }`}>
                  <FaSearch className="text-black dark:text-white hover:text-primary transition-colors duration-200 w-3.5 h-3.5 xl:w-4 xl:h-4" />
                </button>
              </form>
            </div>
            {/* Right side - Language Toggle, Theme Toggle and Cart */}
            <div className={`hidden lg:flex items-center gap-3 xl:gap-4 flex-shrink-0 ${isArabic ? 'flex-row-reverse' : ''}`}> {/* Mirror for RTL */}
              <LanguageToggle />
              <ThemeToggle />
              <Link to="/cart">
                <span className={`relative text-sm xl:text-base font-normal flex items-center transition-colors duration-200 ${
                  isActive('/cart') ? 'text-primary font-bold' : 'hover:text-primary text-black dark:text-white'
                } underline underline-offset-4 decoration-1 hover:decoration-2 font-primary`}>
                  {t.cart || 'Cart'}
                  {cartItems?.length > 0 && (
                    <span className="ml-1 bg-primary text-black text-xs rounded-full px-1.5 py-0.5 transition-transform duration-200 hover:scale-105">
                      {cartItems.length}
                    </span>
                  )}
                </span>
              </Link>
            </div>
            <Link to={currentUser ? '/profile' : '/sign-in'} className={`transition-transform duration-200 hover:scale-105 ${isArabic ? 'lg:mr-4 xl:mr-4' : 'lg:ml-3 xl:ml-4'}`}> {/* Mirror margin for RTL */}
              {currentUser ? (
                <img
                  className="rounded-full h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 object-cover border-2 border-primary"
                  src={currentUser.avatar}
                  alt="profile"
                />
              ) : (
                <span className="relative text-sm xl:text-base font-normal text-black dark:text-white hover:text-primary transition-colors duration-200 underline underline-offset-4 decoration-1 hover:decoration-2 font-primary">
                  {t.signin || 'Sign in'}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}