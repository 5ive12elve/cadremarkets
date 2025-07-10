import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiVolume2, FiVolumeX, FiChevronLeft, FiChevronRight, FiPlay, FiPause, FiMaximize, FiMinimize } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../locales/translations';
import GE02Loader from './GE02Loader';

const media = [
  {
    type: 'video',
    src: 'https://drive.google.com/uc?export=download&id=122QpS2AeYMWO0twSN41zSSmI-ypV0XRb',
    alt: 'Depletion Screening Final'
  },
  {
    type: 'video',
    src: 'https://drive.google.com/uc?export=download&id=1mGGGSt5VR419iLtu8zf7iorAH9YmXSHR',
    alt: 'Screening Announcement'
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
  const { isDarkMode } = useTheme();
  
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
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef(null);
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

    // Ensure videos autoplay when they become current
    if (currentMedia && currentMedia.type === 'video' && videoRef.current) {
      videoRef.current.play().catch(e => console.log('Autoplay prevented:', e));
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

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPaused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
      setIsPaused(!isPaused);
    }
  };

  const handleVideoEnd = () => {
    paginate(1);
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
      {/* Text Overlay */}
      <div className="absolute inset-0 z-20 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none">
        <div className={`absolute bottom-4 md:bottom-8 ${isArabic ? 'right-3 md:right-6 left-3 md:left-auto' : 'left-3 md:left-6 right-3 md:right-auto'} md:max-w-md`}>
          <h1 className={`text-primary text-xl md:text-3xl font-bold mb-1 md:mb-2 ${
            isArabic ? 'font-amiri text-right' : 'font-nt-bold text-left'
          }`}>
            {depletionTitle}
          </h1>
          <div className={`space-y-1 md:space-y-1.5 text-white/90 ${
            isArabic ? 'text-right' : 'text-left'
          }`}>
            <p className={`text-[10px] md:text-xs leading-relaxed ${
              isArabic ? 'font-noto' : 'font-nt'
            }`}>
              {depletionDesc1}
            </p>
            <p className={`text-[10px] md:text-xs leading-relaxed hidden md:block ${
              isArabic ? 'font-noto' : 'font-nt'
            }`}>
              {depletionDesc2}
            </p>
            <div className={`flex flex-col md:flex-row gap-2 md:gap-3 mt-2 md:mt-3 ${
              isArabic ? 'text-right' : 'text-left'
            }`}>
              <div>
                <span className={`text-primary text-[8px] md:text-[10px] font-medium block mb-0.5 ${
                  isArabic ? 'font-noto' : 'font-nt'
                }`}>
                  {typeLabel}
                </span>
                <span className={`text-white text-[10px] md:text-xs ${
                  isArabic ? 'font-noto' : 'font-nt'
                }`}>
                  {typeValue}
                </span>
              </div>
              <div>
                <span className={`text-primary text-[8px] md:text-[10px] font-medium block mb-0.5 ${
                  isArabic ? 'font-noto' : 'font-nt'
                }`}>
                  {venueLabel}
                </span>
                <span className={`text-white text-[10px] md:text-xs ${
                  isArabic ? 'font-noto' : 'font-nt'
                }`}>
                  {venueValue}
                </span>
              </div>
              <div>
                <span className={`text-primary text-[8px] md:text-[10px] font-medium block mb-0.5 ${
                  isArabic ? 'font-noto' : 'font-nt'
                }`}>
                  {categoryLabel}
                </span>
                <span className={`text-white text-[10px] md:text-xs ${
                  isArabic ? 'font-noto' : 'font-nt'
                }`}>
                  {categoryValue}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/80 to-transparent p-2 md:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 md:gap-2">
            {currentMedia && currentMedia.type === 'video' && (
              <>
                <button
                  onClick={togglePlay}
                  className="p-1.5 md:p-2 text-white hover:text-primary transition-colors"
                >
                  {isPaused ? <FiPlay size={16} className="md:w-5 md:h-5" /> : <FiPause size={16} className="md:w-5 md:h-5" />}
                </button>
                <button
                  onClick={toggleMute}
                  className="p-1.5 md:p-2 text-white hover:text-primary transition-colors"
                >
                  {isMuted ? <FiVolumeX size={16} className="md:w-5 md:h-5" /> : <FiVolume2 size={16} className="md:w-5 md:h-5" />}
                </button>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex gap-1 md:gap-2">
              {validMedia.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setPage([index, index > currentIndex ? 1 : -1]);
                    if (autoplayTimeoutRef.current) {
                      clearTimeout(autoplayTimeoutRef.current);
                    }
                  }}
                  className={`w-1 h-1 md:w-1.5 md:h-1.5 transition-all ${
                    index === currentIndex ? 'bg-primary w-2 md:w-3' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={toggleFullscreen}
              className="p-1.5 md:p-2 text-white hover:text-primary transition-colors"
            >
              {isFullscreen ? <FiMinimize size={16} className="md:w-5 md:h-5" /> : <FiMaximize size={16} className="md:w-5 md:h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative h-[60vh] md:h-[80vh] overflow-hidden">
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
                <video
                  ref={videoRef}
                  src={currentMedia.src}
                  className="w-full h-full object-contain"
                  muted={isMuted}
                  playsInline
                  autoPlay
                  loop
                  onEnded={handleVideoEnd}
                  onLoadedData={() => {
                    if (videoRef.current) {
                      videoRef.current.play().catch(e => console.log('Autoplay prevented:', e));
                    }
                  }}
                />
              ) : (
                <img
                  src={currentMedia.src}
                  alt={currentMedia.alt}
                  className="w-full h-full object-contain"
                />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <GE02Loader size="large" message="Loading media..." />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => paginate(-1)}
        className={`absolute ${isArabic ? 'right-2 md:right-4' : 'left-2 md:left-4'} top-1/2 -translate-y-1/2 group p-2 md:p-4 ${isDarkMode ? 'text-white/50 hover:text-white' : 'text-white/70 hover:text-white'} transition-colors transform hover:scale-110 flex items-center z-30`}
      >
        {isArabic ? <FiChevronRight size={24} className="md:w-8 md:h-8" /> : <FiChevronLeft size={24} className="md:w-8 md:h-8" />}
        <span className={`opacity-0 group-hover:opacity-100 transition-opacity ${isArabic ? 'mr-2' : 'ml-2'} text-xs md:text-sm bg-black/50 px-2 py-1 hidden md:block ${
          isArabic ? 'font-noto' : 'font-nt'
        } text-white`}>
          {previous}
        </span>
      </button>
      <button
        onClick={() => paginate(1)}
        className={`absolute ${isArabic ? 'left-2 md:left-4' : 'right-2 md:right-4'} top-1/2 -translate-y-1/2 group p-2 md:p-4 ${isDarkMode ? 'text-white/50 hover:text-white' : 'text-white/70 hover:text-white'} transition-colors transform hover:scale-110 flex items-center z-30`}
      >
        <span className={`opacity-0 group-hover:opacity-100 transition-opacity ${isArabic ? 'ml-2' : 'mr-2'} text-xs md:text-sm bg-black/50 px-2 py-1 hidden md:block ${
          isArabic ? 'font-noto' : 'font-nt'
        } text-white`}>
          {next}
        </span>
        {isArabic ? <FiChevronLeft size={24} className="md:w-8 md:h-8" /> : <FiChevronRight size={24} className="md:w-8 md:h-8" />}
      </button>
    </div>
  );
} 