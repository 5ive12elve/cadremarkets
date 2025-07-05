import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import ServiceRequestModal from '../ServiceRequestModal';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslation } from '../../locales/translations';

// Services will be generated dynamically with translations

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

export default function Services() {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const { currentLang, isArabic } = useLanguage();
  
  // Get all service translations upfront
  const visualDesign = useTranslation('services', 'visualDesign', currentLang);
  const adDesign = useTranslation('services', 'adDesign', currentLang);
  const soundDesign = useTranslation('services', 'soundDesign', currentLang);
  
  // Visual design services
  const logoDesign = useTranslation('services', 'logoDesign', currentLang);
  const uxuiDesign = useTranslation('services', 'uxuiDesign', currentLang);
  const digitalProductDesign = useTranslation('services', 'digitalProductDesign', currentLang);
  const graphicDesign = useTranslation('services', 'graphicDesign', currentLang);
  const brandStrategy = useTranslation('services', 'brandStrategy', currentLang);
  const graffiti = useTranslation('services', 'graffiti', currentLang);
  const corporateIdentity = useTranslation('services', 'corporateIdentity', currentLang);
  const artDirection = useTranslation('services', 'artDirection', currentLang);
  const creativeDirection = useTranslation('services', 'creativeDirection', currentLang);
  const rebranding = useTranslation('services', 'rebranding', currentLang);
  
  // Ad design services
  const advertisements = useTranslation('services', 'advertisements', currentLang);
  const storyboarding = useTranslation('services', 'storyboarding', currentLang);
  const photosessions = useTranslation('services', 'photosessions', currentLang);
  const videoShoots = useTranslation('services', 'videoShoots', currentLang);
  const reels = useTranslation('services', 'reels', currentLang);
  const motionGraphics = useTranslation('services', 'motionGraphics', currentLang);
  const documentaries = useTranslation('services', 'documentaries', currentLang);
  const direction = useTranslation('services', 'direction', currentLang);
  const lighting = useTranslation('services', 'lighting', currentLang);
  const filmmaking = useTranslation('services', 'filmmaking', currentLang);
  const videoEditing = useTranslation('services', 'videoEditing', currentLang);
  
  // Sound design services
  const musicProduction = useTranslation('services', 'musicProduction', currentLang);
  const sonicTextures = useTranslation('services', 'sonicTextures', currentLang);
  const mixingMastering = useTranslation('services', 'mixingMastering', currentLang);
  const voiceoverDirection = useTranslation('services', 'voiceoverDirection', currentLang);
  const audioDesign = useTranslation('services', 'audioDesign', currentLang);
  const soundIdentity = useTranslation('services', 'soundIdentity', currentLang);
  
  // Generate services with translations
  const services = useMemo(() => ({
    [visualDesign]: [
      logoDesign, uxuiDesign, digitalProductDesign, graphicDesign, brandStrategy,
      graffiti, corporateIdentity, artDirection, creativeDirection, rebranding,
    ],
    [adDesign]: [
      advertisements, storyboarding, photosessions, videoShoots, reels,
      motionGraphics, documentaries, direction, lighting, filmmaking, videoEditing,
    ],
    [soundDesign]: [
      musicProduction, sonicTextures, mixingMastering, voiceoverDirection, audioDesign, soundIdentity,
    ],
  }), [
    visualDesign, adDesign, soundDesign,
    logoDesign, uxuiDesign, digitalProductDesign, graphicDesign, brandStrategy, graffiti, corporateIdentity, artDirection, creativeDirection, rebranding,
    advertisements, storyboarding, photosessions, videoShoots, reels, motionGraphics, documentaries, direction, lighting, filmmaking, videoEditing,
    musicProduction, sonicTextures, mixingMastering, voiceoverDirection, audioDesign, soundIdentity
  ]);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ margin: "-50px" }}
      variants={containerVariants}
    >
      <div id="services" className={`w-full border-t border-primary py-6 md:py-12 max-w-7xl mx-auto px-3 text-black dark:text-white transition-colors duration-300 ${isArabic ? 'font-noto' : 'font-nt'}`} dir={isArabic ? 'rtl' : 'ltr'}>
        <div className={`flex flex-col ${isArabic ? 'md:flex-row' : 'md:flex-row'} md:justify-between md:items-start md:gap-4`}>
          <motion.div 
            variants={itemVariants}
            className={`flex flex-col items-start mb-6 md:mb-8 md:flex-1`}
          >
            <div className="flex items-center gap-4 mb-4">
              <h2 className={`text-primary text-2xl sm:text-3xl md:text-4xl font-normal ${isArabic ? 'font-amiri font-bold' : 'font-nt'}`}>
            {useTranslation('home', 'services', currentLang)}
              </h2>
            </div>
            <motion.img 
              src="/mediassets/CADT01.png" 
              alt="Cadre Services" 
              className="w-full max-w-md md:max-w-lg lg:max-w-xl h-auto object-contain"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.6,
                ease: "easeOut",
                delay: 0.2 
              }}
            />
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5 md:flex-1">
            {Object.entries(services).map(([category, items], index) => (
              <motion.div 
                key={category}
                variants={itemVariants}
                custom={index}
                className="relative group"
              >
                <h3 className="text-primary text-lg sm:text-xl md:text-2xl font-medium underline underline-offset-4 mb-3 md:mb-4">
                  {category}
                </h3>
                <ul className="space-y-2 text-black dark:text-white text-base sm:text-lg md:text-xl font-light transition-colors duration-300">
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
                      className="group/item flex items-center gap-3 hover:text-red-500 transition-colors"
                    >
                      <span className="w-2 h-2 bg-primary rounded-full group-hover/item:bg-red-500 transition-colors"></span>
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <motion.div 
        variants={itemVariants}
        className="w-full max-w-7xl mx-auto px-3 mt-6 md:mt-8 flex justify-end"
      >
        <motion.button 
          className={`bg-primary text-[#f3eb4b] font-bold px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg hover:bg-primary/90 transition ${isArabic ? 'font-amiri' : 'font-nt-bold'}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowRequestModal(true)}
        >
          {useTranslation('home', 'requestService', currentLang)}
        </motion.button>
      </motion.div>

      <ServiceRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
      />
    </motion.div>
  );
} 