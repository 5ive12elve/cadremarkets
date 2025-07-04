import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

export default function LanguageToggle() {
  const { isArabic, toggleLanguage } = useLanguage();

  return (
    <motion.button
      onClick={toggleLanguage}
      className="relative p-2 bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-all duration-300 group"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isArabic ? 'Switch to English' : 'Switch to Arabic'}
    >
      <motion.div
        initial={false}
        animate={{
          scale: 1,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="w-5 h-5 text-primary group-hover:text-primary/80 transition-colors duration-200 flex items-center justify-center"
      >
        <span className="font-bold text-xs">
          {isArabic ? 'EN' : 'ع'}
        </span>
      </motion.div>
    </motion.button>
  );
} 