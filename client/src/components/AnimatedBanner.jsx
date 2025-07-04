import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { resetBannerMessage } from '../redux/banner/bannerSlice';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../locales/translations';

export default function AnimatedBanner() {
  const dispatch = useDispatch();
  const { currentLang, isArabic } = useLanguage();
  const { message } = useSelector((state) => state.banner);
  
  const defaultMessage = useTranslation('home', 'freeShipping', currentLang);
  const [displayMessage, setDisplayMessage] = useState(defaultMessage);

  useEffect(() => {
    if (message && message !== defaultMessage) {
      setDisplayMessage(message);
      const timer = setTimeout(() => {
        dispatch(resetBannerMessage());
        setDisplayMessage(defaultMessage);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [message, dispatch, defaultMessage]);

  // Update display message when language changes
  useEffect(() => {
    if (!message || message === displayMessage) {
      setDisplayMessage(defaultMessage);
    }
  }, [defaultMessage, message, displayMessage]);

  return (
    <div className="bg-[#db2b2e] text-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 py-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={displayMessage}
            initial={{ x: 1000 }}
            animate={{ x: 0 }}
            exit={{ x: -1000 }}
            transition={{ 
              type: "spring",
              stiffness: 50,
              damping: 20
            }}
            className="flex justify-center items-center text-center"
          >
            <p className={`text-sm font-medium tracking-wide ${isArabic ? 'font-noto' : 'font-nt'}`}>{displayMessage}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
} 