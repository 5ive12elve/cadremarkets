import { motion } from 'framer-motion';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative p-2 bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-all duration-300 group"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <motion.div
        initial={false}
        animate={{
          rotate: isDarkMode ? 0 : 180,
          scale: isDarkMode ? 1 : 0.8,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="w-5 h-5 text-primary group-hover:text-primary/80 transition-colors duration-200"
      >
        {isDarkMode ? (
          <FiMoon className="w-full h-full" />
        ) : (
          <FiSun className="w-full h-full" />
        )}
      </motion.div>
    </motion.button>
  );
} 