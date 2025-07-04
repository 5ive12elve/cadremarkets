import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaSearch } from 'react-icons/fa';
import { motion } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';
import { useLanguage } from '../contexts/LanguageContext';
import { getPageTranslations } from '../locales/translations';

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const { cartItems } = useSelector((state) => state.cart);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  
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
    <header className="fixed top-[18px] sm:top-[24px] left-0 right-0 z-40">
      <div className={`bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-[#db2b2e]/20 transition-all duration-300 ${isScrolled ? 'py-1.5 sm:py-2' : 'py-2 sm:py-2.5'}`}>
        <div className="flex justify-between items-center max-w-7xl mx-auto px-2 sm:px-3 lg:px-4">
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

          {/* Logo */}
          <div className="flex items-center justify-center lg:justify-start flex-shrink-0">
            <Link to="/" className="flex-shrink-0 transition-transform duration-300 hover:scale-105">
              <img 
                src="/mediassets/CadreBigUse2.png" 
                alt="Cadre Markets Logo" 
                className="h-12 sm:h-14 md:h-16 lg:h-18 xl:h-20 w-auto object-contain" 
              />
            </Link>
          </div>

          {/* Desktop Navigation - Left side after logo */}
          <nav className={`hidden lg:flex items-center flex-shrink-0 ${
            isArabic ? 'mr-8 xl:mr-12' : 'ml-6 xl:ml-8'
          }`}>
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
          <div className={`hidden lg:flex flex-1 justify-center ${
            isArabic ? 'px-3 xl:px-4' : 'px-6 xl:px-8'
          }`}>
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
          <div className="hidden lg:flex items-center gap-3 xl:gap-4 flex-shrink-0">
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

          <Link to={currentUser ? '/profile' : '/sign-in'} className={`transition-transform duration-200 hover:scale-105 ${
            isArabic ? 'lg:mr-4 xl:mr-6' : 'lg:ml-3 xl:ml-4'
          }`}>
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

        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white dark:bg-black p-3 sm:p-4 border-t border-primary/10 transition-colors duration-300 shadow-lg">
            <nav>
              <ul className="flex flex-col gap-3">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <li className={`text-sm sm:text-base font-normal font-primary ${
                    isActive('/') ? 'text-primary font-bold' : 'text-black dark:text-white'
                  }`}>
                    {t.home || 'Home'}
                  </li>
                </Link>
                <Link to="/search" onClick={() => setIsMobileMenuOpen(false)}>
                  <li className={`text-sm sm:text-base font-normal font-primary ${
                    isActive('/search') ? 'text-primary font-bold' : 'text-black dark:text-white'
                  }`}>
                    {t.marketplace || 'Marketplace'}
                  </li>
                </Link>
                <Link to="/projects" onClick={() => setIsMobileMenuOpen(false)}>
                  <li className={`text-sm sm:text-base font-normal font-primary ${
                    isActive('/projects') ? 'text-primary font-bold' : 'text-black dark:text-white'
                  }`}>
                    {t.projects || 'Projects'}
                  </li>
                </Link>
                <Link to="/services" onClick={() => setIsMobileMenuOpen(false)}>
                  <li className={`text-sm sm:text-base font-normal font-primary ${
                    isActive('/services') ? 'text-primary font-bold' : 'text-black dark:text-white'
                  }`}>
                    {t.services || 'Services'}
                  </li>
                </Link>
                <Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>
                  <li className={`text-sm sm:text-base font-normal font-primary ${
                    isActive('/about') ? 'text-primary font-bold' : 'text-black dark:text-white'
                  }`}>
                    {t.about || 'About'}
                  </li>
                </Link>
                <Link to={currentUser ? '/profile' : '/sign-in'} onClick={() => setIsMobileMenuOpen(false)}>
                  <li className={`text-sm sm:text-base font-normal font-primary ${
                    isActive('/profile') || isActive('/sign-in') ? 'text-primary font-bold' : 'text-black dark:text-white'
                  }`}>
                    {currentUser ? (t.profile || 'Profile') : (t.signin || 'Sign in')}
                  </li>
                </Link>
                <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)}>
                  <li className={`text-sm sm:text-base font-normal flex items-center font-primary ${
                    isActive('/cart') ? 'text-primary font-bold' : 'text-black dark:text-white'
                  }`}>
                    {t.cart || 'Cart'}
                    {cartItems?.length > 0 && (
                      <span className="ml-1 bg-primary text-black text-xs rounded-full px-1.5 py-0.5">
                        {cartItems.length}
                      </span>
                    )}
                  </li>
                </Link>
                <li className="flex items-center justify-between pt-2 border-t border-gray-300 dark:border-white/20">
                  <span className="text-sm sm:text-base font-normal text-black dark:text-white font-primary">
                    {t.languageTheme || 'Language / Theme'}
                  </span>
                  <div className="flex items-center gap-2">
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
              className="mt-3 flex items-center border border-transparent hover:border-primary focus-within:border-primary transition-colors duration-200 p-2 bg-white/50 dark:bg-black/50"
              dir={isArabic ? 'rtl' : 'ltr'}
            >
              <input
                type="text"
                placeholder={t.search || 'Search...'}
                className={`bg-transparent focus:outline-none w-full py-1 text-black dark:text-white placeholder-gray-500 dark:placeholder-white/70 text-sm font-primary ${
                  isArabic ? 'text-right' : 'text-left'
                }`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                dir={isArabic ? 'rtl' : 'ltr'}
              />
              <button className={`hover:text-primary transition-colors duration-200 ${
                isArabic ? 'mr-2' : 'ml-2'
              }`}>
                <FaSearch className="text-black dark:text-white hover:text-primary transition-colors duration-200 w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}