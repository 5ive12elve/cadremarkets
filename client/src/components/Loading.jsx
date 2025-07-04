import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import PropTypes from 'prop-types';

export default function Loading({ fullScreen = true, size = 'large' }) {
  const { isDarkMode } = useTheme();

  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.2,
        repeat: Infinity,
        repeatDelay: 0.5
      }
    }
  };

  const logoVariants = {
    initial: { 
      scale: 0.8, 
      opacity: 0.7,
      rotate: 0
    },
    animate: {
      scale: [0.8, 1.1, 1],
      opacity: [0.7, 1, 0.9],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity,
        repeatDelay: 0.3
      }
    }
  };

  const backgroundVariants = {
    initial: { 
      scale: 1,
      opacity: 0.1,
      rotate: 0
    },
    animate: {
      scale: [1, 1.05, 0.95, 1],
      opacity: [0.1, 0.2, 0.15, 0.1],
      rotate: [0, -2, 2, 0],
      transition: {
        duration: 3,
        ease: "easeInOut",
        repeat: Infinity
      }
    }
  };

  const textVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: [0, 1, 0],
      transition: {
        duration: 1.5,
        ease: "easeInOut",
        repeat: Infinity,
        repeatDelay: 0.5
      }
    }
  };

  const dotVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: [0, 1, 0],
      transition: {
        duration: 1,
        ease: "easeInOut",
        repeat: Infinity,
        times: [0, 0.5, 1]
      }
    }
  };

  const getSizes = () => {
    switch (size) {
      case 'small':
        return {
          container: 'w-16 h-16',
          logo: 'w-12 h-12',
          background: 'w-20 h-20',
          text: 'text-xs',
          spacing: 'gap-2'
        };
      case 'medium':
        return {
          container: 'w-24 h-24',
          logo: 'w-16 h-16',
          background: 'w-28 h-28',
          text: 'text-sm',
          spacing: 'gap-3'
        };
      default: // large
        return {
          container: 'w-32 h-32',
          logo: 'w-20 h-20',
          background: 'w-40 h-40',
          text: 'text-base',
          spacing: 'gap-4'
        };
    }
  };

  const sizes = getSizes();

  const loadingContent = (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className={`flex flex-col items-center justify-center ${sizes.spacing}`}
    >
      {/* Background GE02 Image */}
      <div className="relative flex items-center justify-center">
        <motion.img
          src="/mediassets/GE02.png"
          alt="Background"
          variants={backgroundVariants}
          className={`${sizes.background} object-contain absolute ${
            isDarkMode ? 'opacity-20' : 'opacity-10'
          }`}
        />
        
        {/* Main Cadre Logo */}
        <motion.img
          src="/mediassets/Cadre-Favicon01.png"
          alt="Cadre Markets Loading"
          variants={logoVariants}
          className={`${sizes.logo} object-contain relative z-10`}
        />
      </div>

      {/* Loading Text */}
      <motion.div
        variants={textVariants}
        className={`${sizes.text} font-nt font-medium ${
          isDarkMode ? 'text-white' : 'text-black'
        } text-center`}
      >
        Loading
        {/* Animated Dots */}
        <span className="inline-flex ml-1">
          <motion.span
            variants={dotVariants}
            custom={0}
            animate="animate"
            style={{ animationDelay: '0s' }}
          >
            .
          </motion.span>
          <motion.span
            variants={dotVariants}
            custom={1}
            animate="animate"
            style={{ animationDelay: '0.2s' }}
          >
            .
          </motion.span>
          <motion.span
            variants={dotVariants}
            custom={2}
            animate="animate"
            style={{ animationDelay: '0.4s' }}
          >
            .
          </motion.span>
        </span>
      </motion.div>

      {/* Brand Name */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ 
          opacity: [0, 0.7, 0.5],
          y: [10, 0, 0]
        }}
        transition={{
          duration: 2,
          ease: "easeOut",
          repeat: Infinity,
          repeatDelay: 1
        }}
        className={`${sizes.text === 'text-xs' ? 'text-xs' : 'text-sm'} font-nt ${
          isDarkMode ? 'text-white/60' : 'text-black/60'
        } text-center tracking-wide`}
      >
        CADRE MARKETS
      </motion.div>
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${
        isDarkMode ? 'bg-black' : 'bg-white'
      } transition-colors duration-300`}>
        {loadingContent}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {loadingContent}
    </div>
  );
}

Loading.propTypes = {
  fullScreen: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
}; 