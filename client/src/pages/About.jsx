import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../locales/translations';
import MovingParticles from '../components/MovingParticles';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

export default function About() {
  const { isArabic, currentLang, direction } = useLanguage();

  // Get all translations at component level
  const title = useTranslation('about', 'title', currentLang);
  const subtitle = useTranslation('about', 'subtitle', currentLang);
  const ourStory = useTranslation('about', 'ourStory', currentLang);
  const storyText = useTranslation('about', 'storyText', currentLang);
  const ourWork = useTranslation('about', 'ourWork', currentLang);
  const workText = useTranslation('about', 'workText', currentLang);
  const projectsCompleted = useTranslation('about', 'projectsCompleted', currentLang);
  const projectsCompletedNumber = useTranslation('about', 'projectsCompletedNumber', currentLang);
  const projectsDescription = useTranslation('about', 'projectsDescription', currentLang);
  const ourVision = useTranslation('about', 'ourVision', currentLang);
  const visionText = useTranslation('about', 'visionText', currentLang);
  const ourMission = useTranslation('about', 'ourMission', currentLang);
  const missionText = useTranslation('about', 'missionText', currentLang);
  const joinJourney = useTranslation('about', 'joinJourney', currentLang);
  const joinJourneyText = useTranslation('about', 'joinJourneyText', currentLang);
  const stayConnected = useTranslation('about', 'stayConnected', currentLang);

  // Get projects page translation
  const seeMoreProjects = useTranslation('home', 'seeMoreProjects', currentLang);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={`min-h-screen bg-transparent text-black dark:text-white transition-colors duration-300 ${
        isArabic ? 'font-noto' : 'font-nt'
      }`}
      dir={direction}
    >
      {/* Hero Section */}
      <section className="relative bg-transparent overflow-hidden">
        <MovingParticles count={6} />
        <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-32">
          <motion.div variants={itemVariants} className="text-center">
            <motion.h1 
              variants={itemVariants}
              className={`text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-primary ${
                isArabic ? 'font-amiri' : 'font-nt'
              }`}
            >
              {title}
            </motion.h1>
            <motion.p 
              variants={itemVariants}
              className={`text-lg md:text-xl lg:text-2xl leading-relaxed max-w-4xl mx-auto text-gray-700 dark:text-gray-300 ${
                isArabic ? 'font-noto' : 'font-nt'
              }`}
            >
              {subtitle}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Our Story Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
        className="py-20 bg-transparent"
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${isArabic ? 'lg:grid-cols-2' : ''}`}>
            <motion.div variants={itemVariants} className={isArabic ? 'lg:order-2' : ''}>
              <h2 className={`text-3xl md:text-4xl font-bold mb-6 text-primary ${
                isArabic ? 'font-amiri text-right' : 'font-nt text-left'
              }`}>
                {ourStory}
              </h2>
              <p className={`text-lg md:text-xl leading-relaxed text-gray-700 dark:text-gray-300 ${
                isArabic ? 'font-noto text-right' : 'font-nt text-left'
              }`}>
                {storyText}
              </p>
            </motion.div>
            <motion.div 
              variants={itemVariants} 
              className={`relative ${isArabic ? 'lg:order-1' : ''}`}
            >
              <div className="relative">
                <div className="w-full bg-transparent flex items-center justify-center overflow-hidden">
                  <img 
                    src="/mediassets/CMSUP6.png" 
                    alt="CMSUP6" 
                    className="w-full h-auto object-contain opacity-80"
                  />
                </div>
                <div className="absolute -top-4 -left-4 w-8 h-8">
                  <img src="/mediassets/GE02.png" alt="Decorative element" className="w-full h-full object-contain" />
                </div>
                <div className="absolute -bottom-4 -right-4 w-8 h-8">
                  <img src="/mediassets/GE02.png" alt="Decorative element" className="w-full h-full object-contain" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Projects Showcase Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
        className="py-20 bg-transparent"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-16 ${isArabic ? 'lg:grid-cols-2' : ''}`}>
            {/* Left side - CADT02 Image */}
            <motion.div 
              variants={itemVariants}
              className={`${isArabic ? 'lg:order-2' : 'lg:order-1'}`}
            >
              <img 
                src="/mediassets/CADT02.png" 
                alt="Cadre Work" 
                className="w-full h-auto object-contain max-w-full"
              />
            </motion.div>
            
            {/* Right side - Our Work Content */}
            <motion.div 
              variants={itemVariants} 
              className={`${isArabic ? 'lg:order-1 text-right' : 'lg:order-2 text-left'}`}
            >
              <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-6 ${
              isArabic ? 'font-amiri' : 'font-nt'
            }`}>
              {ourWork}
            </h2>
              <p className={`text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed ${
              isArabic ? 'font-noto' : 'font-nt'
            }`}>
              {workText}
            </p>
          </motion.div>
          </div>

          {/* Project Stats */}
          <motion.div 
            variants={itemVariants}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-8 bg-transparent border border-primary/20 px-8 py-6">
              <div className="text-center">
                <div className={`text-4xl md:text-6xl font-bold text-primary mb-2 ${isArabic ? 'font-amiri' : 'font-nt'}`}>
                  {projectsCompletedNumber}
                </div>
                <div className={`text-sm md:text-base text-gray-600 dark:text-gray-400 ${isArabic ? 'font-noto' : 'font-nt'}`}>
                  {projectsCompleted}
                </div>
              </div>
              <div className="w-px h-16 bg-primary/30"></div>
              <div className={`text-sm md:text-base text-gray-700 dark:text-gray-300 max-w-sm ${isArabic ? 'font-noto text-right' : 'font-nt text-left'}`}>
                {projectsDescription}
              </div>
            </div>
          </motion.div>

          {/* Project Images Grid */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          >
            <div className="aspect-square bg-transparent border border-primary/20 flex items-center justify-center overflow-hidden group hover:scale-105 transition-transform duration-300">
              <img 
                src="/mediassets/CDIS.png" 
                alt="CDIS" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="aspect-square bg-transparent border border-primary/20 flex items-center justify-center overflow-hidden group hover:scale-105 transition-transform duration-300">
              <img 
                src="/mediassets/DUR.png" 
                alt="DUR" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="aspect-square bg-transparent border border-primary/20 flex items-center justify-center overflow-hidden group hover:scale-105 transition-transform duration-300">
              <img 
                src="/mediassets/DOP.png" 
                alt="DOP" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="aspect-square bg-transparent border border-primary/20 flex items-center justify-center overflow-hidden group hover:scale-105 transition-transform duration-300">
              <img 
                src="/mediassets/DEP.png" 
                alt="DEP" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
          </motion.div>

          {/* CTA Button to Projects Page */}
          <motion.div 
            variants={itemVariants}
            className="text-center"
          >
            <a 
              href="/projects"
              className={`inline-block px-8 py-4 bg-primary text-white font-bold hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 ${
                isArabic ? 'font-amiri' : 'font-nt'
              }`}
            >
              {seeMoreProjects}
            </a>
          </motion.div>
        </div>
      </motion.section>

      {/* Vision & Mission Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
        className="py-20 bg-transparent"
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div 
              variants={itemVariants}
              className="relative"
            >
              <div className="bg-transparent p-8 border border-primary/20 h-full">
                <div className="absolute top-4 right-4 w-6 h-6">
                  <img src="/mediassets/GE02.png" alt="Decorative element" className="w-full h-full object-contain opacity-50" />
                </div>
                <h3 className={`text-2xl font-bold mb-6 text-primary ${
                  isArabic ? 'font-amiri text-right' : 'font-nt text-left'
                }`}>
                  {ourVision}
                </h3>
                <p className={`text-lg text-gray-700 dark:text-gray-300 leading-relaxed ${
                  isArabic ? 'font-noto text-right' : 'font-nt text-left'
                }`}>
                  {visionText}
                </p>
              </div>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="relative"
            >
              <div className="bg-transparent p-8 border border-primary/20 h-full">
                <div className="absolute top-4 right-4 w-6 h-6">
                  <img src="/mediassets/GE02.png" alt="Decorative element" className="w-full h-full object-contain opacity-50" />
                </div>
                <h3 className={`text-2xl font-bold mb-6 text-primary ${
                  isArabic ? 'font-amiri text-right' : 'font-nt text-left'
                }`}>
                  {ourMission}
                </h3>
                <p className={`text-lg text-gray-700 dark:text-gray-300 leading-relaxed ${
                  isArabic ? 'font-noto text-right' : 'font-nt text-left'
                }`}>
                  {missionText}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
        className="py-20 bg-gradient-to-r from-primary to-primary/90 text-white relative overflow-hidden"
      >
        <MovingParticles count={4} />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div
            variants={itemVariants}
            className="mb-8 flex justify-center"
          >
            <img 
              src="/mediassets/Cadre-Favicon01.png" 
              alt="Cadre Logo" 
              className="w-16 h-16 object-contain"
            />
          </motion.div>
          <motion.h2 
            variants={itemVariants}
            className={`text-3xl md:text-5xl font-bold mb-6 ${
              isArabic ? 'font-amiri' : 'font-nt'
            }`}
          >
            {joinJourney}
          </motion.h2>
          <motion.p 
            variants={itemVariants}
            className={`text-lg md:text-xl mb-8 opacity-90 ${
              isArabic ? 'font-noto' : 'font-nt'
            }`}
          >
            {joinJourneyText}
          </motion.p>
          <motion.div variants={itemVariants}>
            <a 
              href="/sign-up" 
              className={`inline-block px-8 py-4 bg-white text-primary font-bold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 ${
                isArabic ? 'font-amiri' : 'font-nt'
              }`}
            >
              {stayConnected}
            </a>
          </motion.div>
        </div>
      </motion.section>
    </motion.div>
  );
}
