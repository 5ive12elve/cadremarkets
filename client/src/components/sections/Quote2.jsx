import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslation } from '../../locales/translations';
import MovingParticles from '../MovingParticles';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
    },
  },
};

const textVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

function Quote2({ text, author, image }) {
  const { isArabic, currentLang } = useLanguage();
  const t = useTranslation('home', 'creativeDirector', currentLang);
  
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ margin: "-50px" }}
      variants={containerVariants}
      className={`bg-white dark:bg-black transition-colors duration-300 py-6 md:py-12 relative overflow-hidden`}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <MovingParticles count={10} />
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border border-primary rotate-45"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 border border-primary rotate-12"></div>
        <div className="absolute top-1/2 left-1/2 w-16 h-16 border border-primary -rotate-45 transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="relative">
          {/* Large Quote Mark */}
          <div className={`absolute ${isArabic ? 'right-0 top-0' : 'left-0 top-0'} text-primary text-[120px] md:text-[180px] leading-none opacity-20 ${isArabic ? 'font-amiri' : 'font-nt'} select-none pointer-events-none`}>
            &ldquo;
          </div>
          
          {/* Content Container */}
          <div className="relative pt-16 md:pt-24 pb-8">
            <div className={`flex flex-col lg:flex-row items-center gap-8 lg:gap-16 ${isArabic ? 'lg:flex-row-reverse' : ''}`}>
              
              {/* Image Section */}
              <motion.div 
                variants={imageVariants}
                className="flex-shrink-0 relative group"
              >
                <div className="relative">
                  <motion.img
                    src={image}
                    alt={author}
                    className="w-[280px] h-[280px] md:w-[320px] md:h-[320px] object-cover rounded-full border-4 border-gray-800 dark:border-white shadow-2xl"
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                  {/* Floating accent */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full animate-pulse"></div>
                  <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-yellow-400 rounded-full"></div>
                </div>
              </motion.div>
              
              {/* Text Section */}
              <motion.div 
                variants={textVariants}
                className="flex-1 max-w-2xl"
              >
                <motion.blockquote 
                  variants={textVariants}
                  className={`${isArabic ? 'text-[22px] md:text-[32px] lg:text-[38px] leading-[1.4] font-amiri text-right' : 'text-[26px] md:text-[36px] lg:text-[42px] leading-[1.3] font-nt text-left'} font-light text-gray-800 dark:text-white transition-colors duration-300 mb-8`}
                  dangerouslySetInnerHTML={{ __html: text }} 
                />
                
                {/* Author Section */}
                <motion.div 
                  variants={textVariants}
                  className={`flex items-center gap-6 ${isArabic ? 'justify-end flex-row-reverse' : 'justify-start'}`}
                >
                  <div className="flex flex-col">
                    <cite className={`text-primary text-xl md:text-2xl font-bold not-italic ${isArabic ? 'font-amiri text-right' : 'font-nt text-left'}`}>
                      {author}
                    </cite>
                    <span className={`text-gray-600 dark:text-white/70 text-sm ${isArabic ? 'font-noto text-right' : 'font-nt text-left'}`}>
                      {t}
                    </span>
                  </div>
                  <div className="w-px h-12 bg-primary opacity-30"></div>
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-primary rounded-full mb-1"></div>
                    <div className="w-1 h-8 bg-gradient-to-b from-primary to-transparent"></div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

Quote2.propTypes = {
  text: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
};

export default Quote2; 