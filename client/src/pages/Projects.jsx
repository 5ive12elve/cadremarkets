import { motion } from 'framer-motion';
import DepletionSlider from '../components/DepletionSlider';
import FeaturedProjects from '../components/sections/FeaturedProjects';
import { useLanguage } from '../contexts/LanguageContext';

export default function Projects() {
  const { isArabic } = useLanguage();

  return (
    <div 
      className={`min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-300 ${
        isArabic ? 'font-noto' : 'font-nt'
      }`}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {/* Depletion Project Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <DepletionSlider />
      </motion.div>

      {/* Featured Projects Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <FeaturedProjects />
      </motion.div>
    </div>
  );
} 