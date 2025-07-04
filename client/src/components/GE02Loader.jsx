import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import PropTypes from 'prop-types';

export default function GE02Loader({ 
  size = 'medium', 
  overlay = false, 
  fullScreen = false,
  message = null 
}) {
  const { isDarkMode } = useTheme();

  const rotateVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 3,
        ease: "linear",
        repeat: Infinity
      }
    }
  };

  const fadeVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  const getSizes = () => {
    switch (size) {
      case 'small':
        return {
          container: 'w-8 h-8',
          image: 'w-6 h-6',
          text: 'text-xs'
        };
      case 'large':
        return {
          container: 'w-16 h-16',
          image: 'w-12 h-12',
          text: 'text-base'
        };
      case 'xlarge':
        return {
          container: 'w-24 h-24',
          image: 'w-20 h-20',
          text: 'text-lg'
        };
      default: // medium
        return {
          container: 'w-12 h-12',
          image: 'w-8 h-8',
          text: 'text-sm'
        };
    }
  };

  const sizes = getSizes();

  const loaderContent = (
    <motion.div
      variants={fadeVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col items-center justify-center gap-3"
    >
      {/* Revolving GE02 Image */}
      <div className={`${sizes.container} flex items-center justify-center`}>
        <motion.img
          src="/mediassets/GE02.png"
          alt="Loading"
          variants={rotateVariants}
          initial="initial"
          animate="animate"
          className={`${sizes.image} object-contain ${
            isDarkMode ? 'opacity-80' : 'opacity-70'
          }`}
        />
      </div>

      {/* Optional Loading Message */}
      {message && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className={`${sizes.text} font-nt ${
            isDarkMode ? 'text-white/80' : 'text-black/80'
          } text-center`}
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  );

  // Full screen loader
  if (fullScreen) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${
        isDarkMode ? 'bg-black/90' : 'bg-white/90'
      } backdrop-blur-sm transition-colors duration-300`}>
        {loaderContent}
      </div>
    );
  }

  // Overlay loader (for covering specific components)
  if (overlay) {
    return (
      <div className={`absolute inset-0 z-10 flex items-center justify-center ${
        isDarkMode ? 'bg-black/50' : 'bg-white/50'
      } backdrop-blur-sm rounded-lg`}>
        {loaderContent}
      </div>
    );
  }

  // Inline loader
  return (
    <div className="flex items-center justify-center p-4">
      {loaderContent}
    </div>
  );
}

GE02Loader.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large', 'xlarge']),
  overlay: PropTypes.bool,
  fullScreen: PropTypes.bool,
  message: PropTypes.string,
}; 