import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslation } from '../../locales/translations';
import { useState, useEffect } from 'react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export default function Hero() {
  const { currentLang, isArabic } = useLanguage();
  const [isMobile, setIsMobile] = useState(false);
  
  // Get translations - but always display in English as requested
  const heroDescription1 = useTranslation('home', 'heroDescription1', currentLang);
  const heroDescription2 = useTranslation('home', 'heroDescription2', currentLang);
  const scrollToExplore = useTranslation('home', 'scrollToExplore', currentLang);

  // Check if screen is mobile
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <section className="relative flex justify-center items-start h-[50vh] min-h-[300px] md:h-[calc(100vh-420px)] ipad:h-[calc(100vh-460px)] md:min-h-[320px] bg-white dark:bg-black transition-colors duration-300 mt-2 md:mt-3">
        <motion.img
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: isMobile ? 0.6 : 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          src="/mediassets/GE01.png"
          alt="Hero"
          className="w-[280px] md:w-[340px] ipad:w-[360px] h-[278px] md:h-[338px] ipad:h-[358px] object-contain absolute top-[60px] md:top-[60px] ipad:top-[60px] z-0"
        />
        <div className={`relative z-10 w-full max-w-7xl mx-auto flex flex-col ${isArabic ? 'md:flex-row-reverse' : 'md:flex-row'} justify-between items-center md:items-center px-3 gap-[24px] md:gap-[24px]`} dir={isArabic ? 'rtl' : 'ltr'}>
          {/* Image Block */}
          <motion.div 
            variants={itemVariants}
            className={`text-left md:text-left text-black dark:text-white flex items-center justify-center md:justify-start w-full md:w-auto transition-colors duration-300 ${isArabic ? 'order-1' : 'order-1'}`}
          >
            <motion.img
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              src="/mediassets/HeroTextLight.png"
              alt="Hero Text"
              className="w-full max-w-[655px] md:max-w-[680px] ipad:max-w-[695px] h-auto object-contain px-4 md:px-0 block dark:hidden"
            />
            <motion.img
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              src="/mediassets/HeroText.png"
              alt="Hero Text"
              className="w-full max-w-[655px] md:max-w-[680px] ipad:max-w-[695px] h-auto object-contain px-4 md:px-0 hidden dark:block"
            />
          </motion.div>

          {/* Text Block */}
          <motion.div 
            variants={itemVariants}
            className={`text-black dark:text-white ${isArabic ? 'font-noto' : 'font-nt'} text-[18px] md:text-[20px] font-light max-w-[360px] ${isArabic ? 'text-right md:text-right order-2' : 'text-left md:text-left order-2'} leading-relaxed mt-2 md:mt-4 px-4 md:px-0 transition-colors duration-300`}
          >
            <motion.p
              variants={itemVariants}
              className="w-full"
            >
              {heroDescription1.split('**').map((part, index) => 
                index % 2 === 1 ? <strong key={index}>{part}</strong> : part
              )}
            </motion.p>
            <motion.p 
              variants={itemVariants}
              className="mt-3 w-full"
            >
              {heroDescription2}
              <br />
              <strong>{scrollToExplore}</strong>
            </motion.p>
          </motion.div>
        </div>
      </section>
      <motion.section 
        variants={itemVariants}
        className="w-full max-w-7xl mx-auto px-3 flex justify-between items-start mt-2 md:mt-3"
      >
        <motion.img
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.5 }}
          src="/mediassets/GE02.png"
          alt="Graphic Left"
          className="w-[35px] md:w-[40px] ipad:w-[43px] h-[37px] md:h-[42px] ipad:h-[45px] object-contain"
        />
        <motion.img
          whileHover={{ rotate: -180 }}
          transition={{ duration: 0.5 }}
          src="/mediassets/GE02.png"
          alt="Graphic Right"
          className="w-[35px] md:w-[40px] ipad:w-[43px] h-[37px] md:h-[42px] ipad:h-[45px] object-contain"
        />
      </motion.section>
    </motion.div>
  );
} 