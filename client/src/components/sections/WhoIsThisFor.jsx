import { useState } from 'react';
import { motion } from 'framer-motion';
import ServiceRequestModal from '../ServiceRequestModal';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslation } from '../../locales/translations';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export default function WhoIsThisFor() {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const { currentLang, isArabic } = useLanguage();

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ margin: "-50px" }}
      variants={containerVariants}
      className={`w-full max-w-7xl mx-auto px-3 flex flex-col ${isArabic ? 'md:flex-row' : 'md:flex-row'} justify-between gap-6 md:gap-10 py-6 md:py-12 items-start`}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {/* Left Column */}
      <motion.div 
        variants={itemVariants}
        className={`flex-1 text-black dark:text-white ${isArabic ? 'font-noto' : 'font-nt'}`}
      >
        <motion.p 
          variants={itemVariants}
          className="text-base text-primary mb-3"
        >
          {useTranslation('home', 'artistsBrands', currentLang)}
        </motion.p>
        <motion.h2 
          variants={itemVariants}
          className={`text-2xl sm:text-3xl md:text-4xl font-medium mb-5 ${isArabic ? 'font-amiri font-bold' : 'font-nt'}`}
        >
          {useTranslation('home', 'whoIsThisBuiltFor', currentLang)}
        </motion.h2>
        <motion.p 
          variants={itemVariants}
          className="mb-4 text-base sm:text-lg"
        >
          {useTranslation('home', 'makingOrAmplifying', currentLang)}<br />{useTranslation('home', 'eitherWayHome', currentLang)}
        </motion.p>
        <motion.p 
          variants={itemVariants}
          className="mb-4 text-base sm:text-lg"
        >
          {useTranslation('home', 'buildToolsDaily', currentLang)} <span className="bg-primary text-white px-1">{useTranslation('home', 'creativeHustle', currentLang)}</span>
        </motion.p>
        <motion.p 
          variants={itemVariants}
          className="mb-4 text-base sm:text-lg"
        >
          {useTranslation('home', 'believeInOriginal', currentLang)}
        </motion.p>
        <motion.p 
          variants={itemVariants}
          className="mb-6 text-base sm:text-lg"
        >
          {useTranslation('home', 'sayWhatWeDo', currentLang)}<br />{useTranslation('home', 'doItBoldly', currentLang)} <span className="bg-primary text-white px-1">{useTranslation('home', 'boldly', currentLang)}</span>
        </motion.p>
        <motion.img 
          variants={itemVariants}
          src="/mediassets/CSSell.png" 
          alt="Create Sign Up Sell" 
          className="w-full max-w-[400px] mt-6" 
        />
      </motion.div>

      {/* Right Column */}
      <motion.div 
        variants={itemVariants}
        className="flex flex-col gap-6 md:gap-8 flex-1"
      >
        <motion.div 
          variants={cardVariants}
          whileHover={{ scale: 1.02 }}
          className={`w-full md:w-[585px] h-auto md:h-[217px] border border-primary p-4 md:p-6 flex flex-col ${isArabic ? 'md:flex-row-reverse' : 'md:flex-row'} items-center md:items-start gap-4 md:gap-6 overflow-hidden`}
        >
          <div className="w-[80px] h-[80px] md:w-[187px] md:h-[187px] flex items-center justify-center flex-shrink-0">
            <motion.img 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              src="/mediassets/Art.png" 
              alt="Art Icon" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className={`text-center ${isArabic ? 'md:text-right' : 'md:text-left'} flex-1 min-w-0 ${isArabic ? 'font-noto' : 'font-nt'}`}>
            <motion.h3 
              variants={itemVariants}
              className={`text-primary text-[20px] sm:text-[22px] md:text-[24px] font-bold mb-1 ${isArabic ? 'font-amiri' : 'font-nt-bold'}`}
            >
              {useTranslation('home', 'forArtists', currentLang)}
            </motion.h3>
            <motion.p 
              variants={itemVariants}
              className="text-black dark:text-white text-[15px] sm:text-[16px] md:text-[15px] font-light mb-3 leading-relaxed min-h-[40px] flex items-center"
            >
              {useTranslation('home', 'artistsDescription', currentLang)}
            </motion.p>
            <Link to="/sign-up" className="inline-block">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`bg-primary text-white px-5 py-3 font-semibold hover:opacity-90 text-base whitespace-nowrap ${isArabic ? 'font-amiri' : 'font-nt'}`}
              >
                {useTranslation('home', 'joinAsArtist', currentLang)}
              </motion.button>
            </Link>
          </div>
        </motion.div>
        <motion.div 
          variants={cardVariants}
          whileHover={{ scale: 1.02 }}
          className={`w-full md:w-[585px] h-auto md:h-[217px] border border-primary p-4 md:p-6 flex flex-col ${isArabic ? 'md:flex-row-reverse' : 'md:flex-row'} items-center md:items-start gap-4 md:gap-6 overflow-hidden`}
        >
          <div className="w-[80px] h-[80px] md:w-[187px] md:h-[187px] flex items-center justify-center flex-shrink-0">
            <motion.img 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              src="/mediassets/Film.png" 
              alt="Film Icon" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className={`text-center ${isArabic ? 'md:text-right' : 'md:text-left'} flex-1 min-w-0 ${isArabic ? 'font-noto' : 'font-nt'}`}>
            <motion.h3 
              variants={itemVariants}
              className={`text-primary text-[20px] sm:text-[22px] md:text-[24px] font-bold mb-1 ${isArabic ? 'font-amiri' : 'font-nt-bold'}`}
            >
              {useTranslation('home', 'forBrandsClients', currentLang)}
            </motion.h3>
            <motion.p 
              variants={itemVariants}
              className="text-black dark:text-white text-[15px] sm:text-[16px] md:text-[15px] font-light mb-3 leading-relaxed min-h-[40px] flex items-center"
            >
              {useTranslation('home', 'brandsDescription', currentLang)}
            </motion.p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`border border-primary text-black dark:text-white px-5 py-3 font-semibold hover:bg-primary hover:text-black text-base whitespace-nowrap ${isArabic ? 'font-amiri' : 'font-nt'}`}
              onClick={() => setShowRequestModal(true)}
            >
              {useTranslation('home', 'bookAdServices', currentLang)}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      <ServiceRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
      />
    </motion.section>
  );
} 