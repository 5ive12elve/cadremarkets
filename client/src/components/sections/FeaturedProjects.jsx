import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslation } from '../../locales/translations';


function ProjectCard({ project, isArabic }) {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Slideshow effect for Instagram posts
  useEffect(() => {
    let interval;
    if (isHovered && project.instagramPosts) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => 
          prev === project.instagramPosts.length - 1 ? 0 : prev + 1
        );
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
      setCurrentImageIndex(0);
    };
  }, [isHovered, project.instagramPosts]);

  return (
    <div 
      className="flex flex-col gap-4 group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
                      <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-black transition-colors duration-300">
        <AnimatePresence mode="wait">
          {isHovered && project.videoUrl ? (
            <motion.div
              key="video"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <iframe
                src={project.videoUrl}
                className="w-full h-full object-cover"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          ) : isHovered && project.instagramPosts ? (
            <motion.div
              key="slideshow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={project.instagramPosts[currentImageIndex]}
                  alt={`${project.alt} Instagram Post ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover filter grayscale"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                />
              </AnimatePresence>
              {/* Slideshow Progress Indicators */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                {project.instagramPosts.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                      index === currentImageIndex ? 'bg-primary w-3' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="image"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <img 
                src={project.image} 
                alt={project.alt} 
                className="w-full h-full object-cover" 
              />
            </motion.div>
          )}
        </AnimatePresence>
        <motion.img
          src="/mediassets/GE02.png"
          alt="Decorative element"
          className="absolute top-4 right-4 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity z-20"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <div className="flex gap-6">
        <div className={`flex flex-col gap-2 ${isArabic ? 'font-noto' : 'font-nt'}`}>
          <p className="text-primary text-xs font-medium">{project.category}</p>
          <p className={`text-primary text-xl font-extrabold group-hover:text-[#f3eb4b] transition-colors ${isArabic ? 'font-amiri' : 'font-nt-bold'}`}>{project.title}</p>
          <p className="text-black dark:text-white text-sm font-semibold transition-colors duration-300">{project.subtitle}</p>
          <p className="text-black dark:text-white text-sm font-light transition-colors duration-300">{project.description}</p>
        </div>
        <motion.img 
          src="/mediassets/GE02.png" 
          className="w-4 h-4" 
          alt="Decorative element"
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}

ProjectCard.propTypes = {
  project: PropTypes.shape({
    image: PropTypes.string.isRequired,
    alt: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    videoUrl: PropTypes.string,
    instagramPosts: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  isArabic: PropTypes.bool.isRequired,
};

export default function FeaturedProjects() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const { currentLang, isArabic } = useLanguage();
  
  // Get all translations upfront
  const featuredProjectsTitle = useTranslation('home', 'featuredProjects', currentLang);
  const featuredDescription = useTranslation('home', 'featuredDescription', currentLang);
  const cadreSpeaksLouder = useTranslation('home', 'cadreSpeaksLouder', currentLang);
  const seeMoreProjects = useTranslation('home', 'seeMoreProjects', currentLang);
  
  // Get project translations
  const cadreCinema = useTranslation('home', 'cadreCinema', currentLang);
  const depletion = useTranslation('home', 'depletion', currentLang);
  const depletionFilm = useTranslation('home', 'depletionFilm', currentLang);
  const depletionDescription = useTranslation('home', 'depletionDescription', currentLang);
  
  const cadreDigitalFutures = useTranslation('home', 'cadreDigitalFutures', currentLang);
  const cdis = useTranslation('home', 'cdis', currentLang);
  const cdisPromo = useTranslation('home', 'cdisPromo', currentLang);
  const cdisDescription = useTranslation('home', 'cdisDescription', currentLang);
  
  const cadrePhoto = useTranslation('home', 'cadrePhoto', currentLang);
  const doppio = useTranslation('home', 'doppio', currentLang);
  const doppioPhotoshoot = useTranslation('home', 'doppioPhotoshoot', currentLang);
  const doppioDescription = useTranslation('home', 'doppioDescription', currentLang);
  
  const cadreTheScene = useTranslation('home', 'cadreTheScene', currentLang);
  const durag = useTranslation('home', 'durag', currentLang);
  const duragMusicVideo = useTranslation('home', 'duragMusicVideo', currentLang);
  const duragDescription = useTranslation('home', 'duragDescription', currentLang);
  
  // Create projects array with translations
  const projects = useMemo(() => [
    {
      image: "/mediassets/DEP.png",
      alt: "Depletion",
      category: cadreCinema,
      title: depletion,
      subtitle: depletionFilm,
      description: depletionDescription,
      instagramPosts: [
        "/mediassets/InstagramPost1.jpg",
        "/mediassets/InstagramPost2.jpg",
        "/mediassets/InstagramPost3.jpg",
        "/mediassets/InstagramPost4.jpg",
        "/mediassets/InstagramPost5.jpg",
        "/mediassets/InstagramPost6.jpg",
        "/mediassets/InstagramPost7.jpg"
      ]
    },
    {
      image: "/mediassets/CDIS.png",
      alt: "CDIS",
      category: cadreDigitalFutures,
      title: cdis,
      subtitle: cdisPromo,
      description: cdisDescription,
      videoUrl: "https://player.vimeo.com/video/828355394?h=662e55dd58&autoplay=1&muted=1"
    },
    {
      image: "/mediassets/DOP.png",
      alt: "Doppio",
      category: cadrePhoto,
      title: doppio,
      subtitle: doppioPhotoshoot,
      description: doppioDescription
    },
    {
      image: "/mediassets/DUR.png",
      alt: "Durag",
      category: cadreTheScene,
      title: durag,
      subtitle: duragMusicVideo,
      description: duragDescription,
      videoUrl: "https://www.youtube.com/embed/8_R8RGtLJkc?autoplay=1&mute=1"
    }
  ], [cadreCinema, depletion, depletionFilm, depletionDescription, cadreDigitalFutures, cdis, cdisPromo, cdisDescription, cadrePhoto, doppio, doppioPhotoshoot, doppioDescription, cadreTheScene, durag, duragMusicVideo, duragDescription]);

  return (
            <section className="bg-white dark:bg-black text-black dark:text-white font-nt py-8 md:py-12 relative z-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className={`border-t border-primary pt-10 flex flex-col ${isArabic ? 'md:flex-row' : 'md:flex-row'} justify-between items-start mb-12 relative gap-4 md:gap-0`} dir={isArabic ? 'rtl' : 'ltr'}>
          <h2 className={`text-primary text-2xl font-medium ${isArabic ? 'font-amiri font-bold order-1' : 'font-nt order-1'}`}>
            {featuredProjectsTitle}
          </h2>
          <p className={`text-black dark:text-white max-w-full md:max-w-[480px] text-sm font-light ${isArabic ? 'text-right order-2' : 'text-left order-2'} transition-colors duration-300 ${isArabic ? 'font-noto' : 'font-nt'}`}>
            {featuredDescription}
            <span className="text-red-500"> {cadreSpeaksLouder}</span>
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-20 gap-x-8">
          {projects.map((project, index) => (
            <ProjectCard key={index} project={project} isArabic={isArabic} />
          ))}
        </div>

        {/* See More Projects Button - Only shown on Home page */}
        {isHomePage && (
          <div className="w-full flex justify-center mt-16">
            <Link to="/projects">
              <motion.button 
                className={`bg-primary text-[#f3eb4b] font-bold px-6 py-2 hover:bg-primary/90 transition text-sm tracking-wide relative group ${isArabic ? 'font-amiri' : 'font-nt-bold'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.img
                  src="/mediassets/GE02.png"
                  alt="Decorative element"
                  className="absolute -top-3 -right-3 w-[25px] h-[25px] object-contain opacity-0 group-hover:opacity-100 transition-opacity"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                {seeMoreProjects}
              </motion.button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
} 