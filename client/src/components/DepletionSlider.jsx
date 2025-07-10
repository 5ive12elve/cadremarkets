import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiMaximize, FiMinimize } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../locales/translations';
import GE02Loader from './GE02Loader';

const media = [
  {
    type: 'video',
    src: 'https://drive.google.com/file/d/1mGGGSt5VR419iLtu8zf7iorAH9YmXSHR/preview?autoplay=1&mute=1',
    alt: 'Screening Announcement',
    thumbnail: '/mediassets/THUMB1.png'
  },
  {
    type: 'video',
    src: 'https://drive.google.com/file/d/122QpS2AeYMWO0twSN41zSSmI-ypV0XRb/preview?autoplay=1&mute=1',
    alt: 'Depletion Screening Final',
    thumbnail: '/mediassets/THUMB2.png'
  },
  {
    type: 'image',
    src: '/mediassets/InstagramPost1.jpg',
    alt: 'Depletion Instagram Post 1'
  },
  {
    type: 'image',
    src: '/mediassets/InstagramPost2.jpg',
    alt: 'Depletion Instagram Post 2'
  },
  {
    type: 'image',
    src: '/mediassets/InstagramPost3.jpg',
    alt: 'Depletion Instagram Post 3'
  },
  {
    type: 'image',
    src: '/mediassets/InstagramPost4.jpg',
    alt: 'Depletion Instagram Post 4'
  },
  {
    type: 'image',
    src: '/mediassets/InstagramPost5.jpg',
    alt: 'Depletion Instagram Post 5'
  },
  {
    type: 'image',
    src: '/mediassets/InstagramPost6.jpg',
    alt: 'Depletion Instagram Post 6'
  },
  {
    type: 'image',
    src: '/mediassets/InstagramPost7.jpg',
    alt: 'Depletion Instagram Post 7'
  }
];

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset, velocity) => {
  return Math.abs(offset) * velocity;
};

export default function DepletionSlider() {
  const { isArabic, currentLang } = useLanguage();
  
  // Get translations
  const depletionTitle = useTranslation('projects', 'depletionTitle', currentLang);
  const depletionDesc1 = useTranslation('projects', 'depletionDesc1', currentLang);
  const depletionDesc2 = useTranslation('projects', 'depletionDesc2', currentLang);
  const typeLabel = useTranslation('projects', 'typeLabel', currentLang);
  const typeValue = useTranslation('projects', 'typeValue', currentLang);
  const venueLabel = useTranslation('projects', 'venueLabel', currentLang);
  const venueValue = useTranslation('projects', 'venueValue', currentLang);
  const categoryLabel = useTranslation('projects', 'categoryLabel', currentLang);
  const categoryValue = useTranslation('projects', 'categoryValue', currentLang);
  const previous = useTranslation('projects', 'previous', currentLang);
  const next = useTranslation('projects', 'next', currentLang);

  const [[page, direction], setPage] = useState([0, 0]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState({});
  const sliderRef = useRef(null);
  const autoplayTimeoutRef = useRef(null);

  // Ensure we have valid media array and safe index calculation
  const validMedia = media && media.length > 0 ? media : [];
  const currentIndex = validMedia.length > 0 ? Math.abs(page) % validMedia.length : 0;
  const currentMedia = validMedia[currentIndex] || null;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      sliderRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (currentMedia && currentMedia.type === 'image') {
      autoplayTimeoutRef.current = setTimeout(() => {
        paginate(1);
      }, 5000);
    }



    return () => {
      if (autoplayTimeoutRef.current) {
        clearTimeout(autoplayTimeoutRef.current);
      }
    };
  }, [page, currentMedia?.type]);

  // Early return if no valid media - after all hooks
  if (validMedia.length === 0) {
    return (
      <div className="relative w-full bg-black h-[60vh] md:h-[80vh] flex items-center justify-center">
        <p className="text-white">No media available</p>
      </div>
    );
  }

  const paginate = (newDirection) => {
    if (autoplayTimeoutRef.current) {
      clearTimeout(autoplayTimeoutRef.current);
    }
    setPage([page + newDirection, newDirection]);
  };





  const handleDragEnd = (e, { offset, velocity }) => {
    const swipe = swipePower(offset.x, velocity.x);

    if (swipe < -swipeConfidenceThreshold) {
      paginate(1);
    } else if (swipe > swipeConfidenceThreshold) {
      paginate(-1);
    }
  };

  return (
    <div ref={sliderRef} className="relative w-full bg-black" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Desktop Text Overlay (hidden on mobile) */}
      <div className="absolute inset-0 z-20 bg-gradient-to-t from-black via-black/70 to-transparent pointer-events-none hidden md:block">
        <div className={`absolute bottom-0 left-0 right-0 p-8 ${isArabic ? 'text-right' : 'text-left'}`}>
          {/* Desktop Title */}
          <h1 className={`text-primary text-4xl font-bold mb-4 leading-tight ${
            isArabic ? 'font-amiri' : 'font-nt-bold'
          }`}>
            {depletionTitle}
          </h1>
          
          {/* Desktop Description */}
          <div className={`space-y-3 text-white/95 ${
            isArabic ? 'text-right' : 'text-left'
          }`}>
            <p className={`text-lg leading-relaxed ${
              isArabic ? 'font-noto' : 'font-nt'
            }`}>
              {depletionDesc1}
            </p>
            <p className={`text-lg leading-relaxed ${
              isArabic ? 'font-noto' : 'font-nt'
            }`}>
              {depletionDesc2}
            </p>
            
            {/* Desktop Project Details */}
            <div className={`grid grid-cols-3 gap-4 mt-6 ${
              isArabic ? 'text-right' : 'text-left'
            }`}>
              <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-primary/20">
                <span className={`text-primary text-sm font-bold block mb-1 ${
                  isArabic ? 'font-noto' : 'font-nt-bold'
                }`}>
                  {typeLabel}
                </span>
                <span className={`text-white text-base ${
                  isArabic ? 'font-noto' : 'font-nt'
                }`}>
                  {typeValue}
                </span>
              </div>
              <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-primary/20">
                <span className={`text-primary text-sm font-bold block mb-1 ${
                  isArabic ? 'font-noto' : 'font-nt-bold'
                }`}>
                  {venueLabel}
                </span>
                <span className={`text-white text-base ${
                  isArabic ? 'font-noto' : 'font-nt'
                }`}>
                  {venueValue}
                </span>
              </div>
              <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-primary/20">
                <span className={`text-primary text-sm font-bold block mb-1 ${
                  isArabic ? 'font-noto' : 'font-nt-bold'
                }`}>
                  {categoryLabel}
                </span>
                <span className={`text-white text-base ${
                  isArabic ? 'font-noto' : 'font-nt'
                }`}>
                  {categoryValue}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-Optimized Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/90 via-black/50 to-transparent p-3 md:p-4">
        <div className="flex items-center justify-between">
          {/* Mobile Slide Counter */}
          <div className="flex items-center gap-2">
            <span className={`text-white/80 text-sm md:text-base ${
              isArabic ? 'font-noto' : 'font-nt'
            }`}>
              {currentIndex + 1} / {validMedia.length}
            </span>
          </div>
          
          {/* Mobile Controls */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Mobile Slide Indicators */}
            <div className="flex gap-2 md:gap-3">
              {validMedia.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setPage([index, index > currentIndex ? 1 : -1]);
                    if (autoplayTimeoutRef.current) {
                      clearTimeout(autoplayTimeoutRef.current);
                    }
                  }}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentIndex 
                      ? 'bg-primary w-3 h-3 md:w-4 md:h-4' 
                      : 'bg-white/40 w-2 h-2 md:w-3 md:h-3 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
            
            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-2 md:p-3 text-white/80 hover:text-primary transition-colors bg-black/20 rounded-lg backdrop-blur-sm"
            >
              {isFullscreen ? 
                <FiMinimize size={18} className="md:w-5 md:h-5" /> : 
                <FiMaximize size={18} className="md:w-5 md:h-5" />
              }
            </button>
          </div>
        </div>
      </div>

      {/* Mobile-Optimized Main Content */}
      <div className="relative h-[50vh] sm:h-[60vh] md:h-[80vh] overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={handleDragEnd}
            className="absolute w-full h-full flex items-center justify-center"
          >
            {currentMedia ? (
              currentMedia.type === 'video' ? (
                <div className="relative w-full h-full">
                  <iframe
                    src={currentMedia.src}
                    className="w-full h-full rounded-lg"
                    frameBorder="0"
                    allowFullScreen
                    allow="autoplay; encrypted-media; fullscreen"
                    title={currentMedia.alt}
                    onLoad={() => {
                      setVideoLoaded(prev => ({ ...prev, [currentIndex]: true }));
                    }}
                    onError={() => {
                      setVideoLoaded(prev => ({ ...prev, [currentIndex]: false }));
                    }}
                  />
                  {/* Thumbnail fallback if video fails to load */}
                  {!videoLoaded[currentIndex] && currentMedia.thumbnail && (
                    <div 
                      className="absolute inset-0 bg-black rounded-lg flex items-center justify-center cursor-pointer"
                      onClick={() => {
                        // Force reload the iframe to retry loading
                        setVideoLoaded(prev => ({ ...prev, [currentIndex]: null }));
                        const iframe = document.querySelector('iframe');
                        if (iframe) {
                          const currentSrc = iframe.src;
                          iframe.src = '';
                          setTimeout(() => {
                            iframe.src = currentSrc;
                          }, 100);
                        }
                      }}
                    >
                      <img
                        src={currentMedia.thumbnail}
                        alt={`${currentMedia.alt} thumbnail`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                        <div className="text-white text-center">
                          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-2">
                            <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <p className="text-sm font-medium">Click to play video</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <img
                  src={currentMedia.src}
                  alt={currentMedia.alt}
                  className="w-full h-full object-cover md:object-contain rounded-lg"
                />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <GE02Loader size="large" message="Loading media..." />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        
        {/* Mobile Swipe Indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 md:hidden">
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
            <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse"></div>
            <span className={`text-white/80 text-xs ${
              isArabic ? 'font-noto' : 'font-nt'
            }`}>
              Swipe to navigate
            </span>
            <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Mobile Text Section (below content) */}
      <div className="md:hidden bg-black p-4">
        <div className={`${isArabic ? 'text-right' : 'text-left'}`}>
          {/* Mobile Title */}
          <h1 className={`text-primary text-2xl font-bold mb-3 leading-tight ${
            isArabic ? 'font-amiri' : 'font-nt-bold'
          }`}>
            {depletionTitle}
          </h1>
          
          {/* Mobile Description */}
          <div className={`space-y-2 text-white/95 ${
            isArabic ? 'text-right' : 'text-left'
          }`}>
            <p className={`text-sm leading-relaxed ${
              isArabic ? 'font-noto' : 'font-nt'
            }`}>
              {depletionDesc1}
            </p>
            <p className={`text-sm leading-relaxed ${
              isArabic ? 'font-noto' : 'font-nt'
            }`}>
              {depletionDesc2}
            </p>
            
            {/* Mobile Project Details */}
            <div className={`grid grid-cols-1 gap-3 mt-4 ${
              isArabic ? 'text-right' : 'text-left'
            }`}>
              <div className="bg-gray-900 rounded-lg p-3 border border-primary/20">
                <span className={`text-primary text-xs font-bold block mb-1 ${
                  isArabic ? 'font-noto' : 'font-nt-bold'
                }`}>
                  {typeLabel}
                </span>
                <span className={`text-white text-sm ${
                  isArabic ? 'font-noto' : 'font-nt'
                }`}>
                  {typeValue}
                </span>
              </div>
              <div className="bg-gray-900 rounded-lg p-3 border border-primary/20">
                <span className={`text-primary text-xs font-bold block mb-1 ${
                  isArabic ? 'font-noto' : 'font-nt-bold'
                }`}>
                  {venueLabel}
                </span>
                <span className={`text-white text-sm ${
                  isArabic ? 'font-noto' : 'font-nt'
                }`}>
                  {venueValue}
                </span>
              </div>
              <div className="bg-gray-900 rounded-lg p-3 border border-primary/20">
                <span className={`text-primary text-xs font-bold block mb-1 ${
                  isArabic ? 'font-noto' : 'font-nt-bold'
                }`}>
                  {categoryLabel}
                </span>
                <span className={`text-white text-sm ${
                  isArabic ? 'font-noto' : 'font-nt'
                }`}>
                  {categoryValue}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-Optimized Navigation Arrows */}
      <button
        onClick={() => paginate(-1)}
        className={`absolute ${isArabic ? 'right-3 md:right-4' : 'left-3 md:left-4'} top-1/2 -translate-y-1/2 md:top-1/2 md:-translate-y-1/2 bottom-4 md:bottom-auto group p-3 md:p-4 bg-black/30 backdrop-blur-sm rounded-full hover:bg-black/50 transition-all duration-300 transform hover:scale-110 flex items-center z-30`}
      >
        {isArabic ? 
          <FiChevronRight size={20} className="md:w-8 md:h-8 text-white/90 group-hover:text-white" /> : 
          <FiChevronLeft size={20} className="md:w-8 md:h-8 text-white/90 group-hover:text-white" />
        }
        <span className={`opacity-0 group-hover:opacity-100 transition-opacity ${isArabic ? 'mr-2' : 'ml-2'} text-xs md:text-sm bg-black/70 px-2 py-1 rounded hidden md:block ${
          isArabic ? 'font-noto' : 'font-nt'
        } text-white`}>
          {previous}
        </span>
      </button>
      <button
        onClick={() => paginate(1)}
        className={`absolute ${isArabic ? 'left-3 md:left-4' : 'right-3 md:right-4'} top-1/2 -translate-y-1/2 md:top-1/2 md:-translate-y-1/2 bottom-4 md:bottom-auto group p-3 md:p-4 bg-black/30 backdrop-blur-sm rounded-full hover:bg-black/50 transition-all duration-300 transform hover:scale-110 flex items-center z-30`}
      >
        <span className={`opacity-0 group-hover:opacity-100 transition-opacity ${isArabic ? 'ml-2' : 'mr-2'} text-xs md:text-sm bg-black/70 px-2 py-1 rounded hidden md:block ${
          isArabic ? 'font-noto' : 'font-nt'
        } text-white`}>
          {next}
        </span>
        {isArabic ? 
          <FiChevronLeft size={20} className="md:w-8 md:h-8 text-white/90 group-hover:text-white" /> : 
          <FiChevronRight size={20} className="md:w-8 md:h-8 text-white/90 group-hover:text-white" />
        }
      </button>
    </div>
  );
} 