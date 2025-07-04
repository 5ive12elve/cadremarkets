import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import PropTypes from 'prop-types';

export default function LoadingSpinner({ size = 'medium', showText = false }) {
  const { isDarkMode } = useTheme();

  const spinVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 2,
        ease: "linear",
        repeat: Infinity
      }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 1.5,
        ease: "easeInOut",
        repeat: Infinity
      }
    }
  };

  const getSizes = () => {
    switch (size) {
      case 'small':
        return {
          container: 'w-6 h-6',
          logo: 'w-4 h-4',
          text: 'text-xs'
        };
      case 'large':
        return {
          container: 'w-12 h-12',
          logo: 'w-8 h-8',
          text: 'text-sm'
        };
      default: // medium
        return {
          container: 'w-8 h-8',
          logo: 'w-6 h-6',
          text: 'text-xs'
        };
    }
  };

  const sizes = getSizes();

  return (
    <div className="flex items-center justify-center gap-2">
      <div className={`relative ${sizes.container} flex items-center justify-center`}>
        {/* Spinning Border */}
        <motion.div
          variants={spinVariants}
          initial="initial"
          animate="animate"
          className={`absolute inset-0 rounded-full border-2 border-transparent border-t-primary ${
            isDarkMode ? 'border-r-primary/30' : 'border-r-primary/20'
          }`}
        />
        
        {/* Pulsing Logo */}
        <motion.img
          src="/mediassets/Cadre-Favicon01.png"
          alt="Loading"
          variants={pulseVariants}
          initial="initial"
          animate="animate"
          className={`${sizes.logo} object-contain`}
        />
      </div>
      
      {showText && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            duration: 1.5,
            ease: "easeInOut",
            repeat: Infinity
          }}
          className={`${sizes.text} font-nt ${
            isDarkMode ? 'text-white/70' : 'text-black/70'
          }`}
        >
          Loading...
        </motion.span>
             )}
     </div>
   );
}

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  showText: PropTypes.bool,
}; 