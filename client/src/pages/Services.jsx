import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ServiceRequestModal from '../components/ServiceRequestModal';
import { FaArrowLeft, FaCheckCircle, FaClock, FaHeadset } from 'react-icons/fa';
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../locales/translations';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
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

const imageVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

export default function ServicesPage() {
  const navigate = useNavigate();
  const { isArabic, currentLang } = useLanguage();
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Get all translations at component level
  const title = useTranslation('services', 'title', currentLang);
  const subtitle = useTranslation('services', 'subtitle', currentLang);
  const requestService = useTranslation('services', 'requestService', currentLang);
  const ourServices = useTranslation('services', 'ourServices', currentLang);
  const servicesDescription = useTranslation('services', 'servicesDescription', currentLang);
  const back = useTranslation('services', 'back', currentLang);
  const visualDesign = useTranslation('services', 'visualDesign', currentLang);
  const adDesign = useTranslation('services', 'adDesign', currentLang);
  const soundDesign = useTranslation('services', 'soundDesign', currentLang);

  const services = {
    [visualDesign]: {
      icon: '/mediassets/Art.png',
      isReactIcon: false,
      items: [
        useTranslation('services', 'logoDesign', currentLang),
        useTranslation('services', 'uxuiDesign', currentLang),
        useTranslation('services', 'digitalProductDesign', currentLang),
        useTranslation('services', 'graphicDesign', currentLang),
        useTranslation('services', 'brandStrategy', currentLang),
        useTranslation('services', 'graffiti', currentLang),
        useTranslation('services', 'corporateIdentity', currentLang),
        useTranslation('services', 'artDirection', currentLang),
        useTranslation('services', 'creativeDirection', currentLang),
        useTranslation('services', 'rebranding', currentLang),
      ]
    },
    [adDesign]: {
      icon: '/mediassets/Film.png',
      isReactIcon: false,
      items: [
        useTranslation('services', 'advertisements', currentLang),
        useTranslation('services', 'storyboarding', currentLang),
        useTranslation('services', 'photosessions', currentLang),
        useTranslation('services', 'videoShoots', currentLang),
        useTranslation('services', 'reels', currentLang),
        useTranslation('services', 'motionGraphics', currentLang),
        useTranslation('services', 'documentaries', currentLang),
        useTranslation('services', 'direction', currentLang),
        useTranslation('services', 'lighting', currentLang),
        useTranslation('services', 'filmmaking', currentLang),
        useTranslation('services', 'videoEditing', currentLang),
      ]
    },
    [soundDesign]: {
      icon: '/mediassets/Vio.png',
      isReactIcon: false,
      items: [
        useTranslation('services', 'musicProduction', currentLang),
        useTranslation('services', 'sonicTextures', currentLang),
        useTranslation('services', 'mixingMastering', currentLang),
        useTranslation('services', 'voiceoverDirection', currentLang),
        useTranslation('services', 'audioDesign', currentLang),
        useTranslation('services', 'soundIdentity', currentLang),
      ]
    },
  };

    return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-300 ${
        isArabic ? 'font-noto' : 'font-nt'
      }`}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <button
          onClick={() => navigate(-1)}
          className={`text-black dark:text-white hover:text-[#db2b2e] transition-colors flex items-center gap-2 mb-6 md:mb-8 text-sm md:text-base ${
            isArabic ? 'font-amiri' : 'font-nt'
          }`}
        >
          <FaArrowLeft /> {back}
        </button>

        {/* Hero Section */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative w-full h-[50vh] md:h-[70vh] min-h-[400px] md:min-h-[600px] flex items-center justify-center overflow-hidden"
        >
          <motion.div
            variants={imageVariants}
            className="absolute inset-0 w-full h-full"
          >
            <div className="absolute inset-0 bg-black/60 z-10" />
            <img
              src="/mediassets/SERV01.jpg"
              alt="Services Hero"
              className="w-full h-full object-cover"
            />
          </motion.div>
          
          <div className="relative z-20 text-center max-w-4xl mx-auto px-4">
            <motion.h1
              variants={itemVariants}
              className={`text-3xl md:text-5xl lg:text-6xl text-white mb-4 md:mb-6 ${
                isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
              }`}
            >
              {title}
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className={`text-sm md:text-xl text-gray-200 mb-6 md:mb-8 max-w-2xl mx-auto ${
                isArabic ? 'font-noto' : 'font-nt'
              }`}
            >
              {subtitle}
            </motion.p>
            <motion.button
              variants={itemVariants}
              className={`bg-primary text-white font-bold px-6 md:px-8 py-3 md:py-4 hover:bg-primary/90 transition text-sm md:text-lg ${
                isArabic ? 'font-amiri' : 'font-nt-bold'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowRequestModal(true)}
            >
              {requestService}
            </motion.button>
          </div>
        </motion.section>

        {/* Services Grid Section */}
                <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="py-20"
        >
          <div className={`w-full max-w-7xl mx-auto px-4 text-black dark:text-white ${
            isArabic ? 'font-noto' : 'font-nt'
          }`}>
            <motion.div 
              variants={itemVariants}
              className="mb-12 md:mb-16 text-center"
            >
              <h2 className={`text-2xl md:text-4xl text-primary mb-3 md:mb-4 ${
                isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
              }`}>{ourServices}</h2>
              <div className="w-16 md:w-20 h-1 bg-primary mx-auto mb-6 md:mb-8" />
              <p className={`text-sm md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4 ${
                isArabic ? 'font-noto' : 'font-nt'
              }`}>
                {servicesDescription}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              {Object.entries(services).map(([category, { icon, isReactIcon, items }], index) => (
                                <motion.div 
                  key={category}
                  variants={itemVariants}
                  custom={index}
                  className="bg-gray-100/90 dark:bg-black/50 border border-gray-300 dark:border-[#db2b2e]/20 p-6 md:p-8 rounded-sm backdrop-blur-sm hover:border-primary transition-colors duration-300"
                >
                  <div className="flex items-center justify-center mb-3 md:mb-4">
                    {isReactIcon ? (
                      React.createElement(icon, {
                        className: "w-12 md:w-16 h-12 md:h-16 text-[#db2b2e] -rotate-45"
                      })
                    ) : (
                      <img
                        src={icon}
                        alt={`${category} Icon`}
                        className="w-12 md:w-16 h-12 md:h-16 object-contain"
                      />
                    )}
                  </div>
                  <h3 className={`text-primary text-xl md:text-2xl mb-4 md:mb-6 text-center ${
                    isArabic ? 'font-amiri font-bold' : 'font-nt-light'
                  }`}>{category}</h3>
                  <ul className={`space-y-2 md:space-y-3 text-black dark:text-white text-sm md:text-base ${
                    isArabic ? 'font-noto' : 'font-nt'
                  }`}>
                    {items.map((item, itemIndex) => (
                      <motion.li 
                        key={item}
                        variants={{
                          hidden: { opacity: 0, x: -20 },
                          visible: {
                            opacity: 1,
                            x: 0,
                            transition: {
                              delay: itemIndex * 0.1,
                              duration: 0.3,
                            },
                          },
                        }}
                        className="flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Additional Services Section with SERV02 Image */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="py-20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={itemVariants}>
              <h2 className={`text-4xl text-primary mb-6 ${
                isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
              }`}>
                {useTranslation('services', 'whyChooseOurServices', currentLang)}
              </h2>
              <p className={`text-lg text-gray-600 dark:text-gray-300 mb-6 ${
                isArabic ? 'font-noto' : 'font-nt'
              }`}>
                {useTranslation('services', 'experienceDescription', currentLang)}
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FaCheckCircle className="text-primary w-6 h-6" />
                  <span className={`text-black dark:text-white ${
                    isArabic ? 'font-noto' : 'font-nt'
                  }`}>
                    {useTranslation('services', 'qualityGuaranteed', currentLang)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <FaClock className="text-primary w-6 h-6" />
                  <span className={`text-black dark:text-white ${
                    isArabic ? 'font-noto' : 'font-nt'
                  }`}>
                    {useTranslation('services', 'onTimeDelivery', currentLang)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <FaHeadset className="text-primary w-6 h-6" />
                  <span className={`text-black dark:text-white ${
                    isArabic ? 'font-noto' : 'font-nt'
                  }`}>
                    {useTranslation('services', 'creativeSupport', currentLang)}
                  </span>
                </div>
              </div>
            </motion.div>
            <motion.div variants={imageVariants} className="relative w-full flex items-center justify-center bg-transparent">
              <img
                src="/mediassets/CADT02.png"
                alt="Creative Process"
                className="w-full max-h-[520px] object-contain rounded-sm"
              />
            </motion.div>
          </div>
        </motion.section>

        {/* LIQUID Video Showcase */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="py-20"
        >
          <motion.div variants={itemVariants} className="max-w-6xl mx-auto">
            <h2 className={`text-2xl md:text-4xl text-primary mb-4 md:mb-6 text-center ${
              isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
            }`}>LIQUID</h2>
            <p className={`text-sm md:text-base text-gray-600 dark:text-gray-300 text-center mb-6 md:mb-8 ${
              isArabic ? 'font-noto' : 'font-nt'
            }`}>
              A glimpse into our motion and visual direction.
            </p>
            <motion.div
              variants={imageVariants}
              className="relative aspect-video w-full overflow-hidden rounded-sm border border-gray-200 dark:border-[#db2b2e]/20 bg-black"
            >
              <video
                className="absolute inset-0 h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                controls
              >
                <source src="https://res.cloudinary.com/dt7c4jpgf/video/upload/sp_auto/v1755608238/vocerg1jicfuxghut2tq.m3u8" type="application/x-mpegURL" />
                <source src="https://res.cloudinary.com/dt7c4jpgf/video/upload/v1755608238/vocerg1jicfuxghut2tq.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </motion.div>
          </motion.div>
        </motion.section>
      </div>

      <ServiceRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
      />
    </motion.main>
  );
} 