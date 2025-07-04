import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first, then system preference
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Save theme preference
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    
    // Apply theme to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const theme = {
    isDarkMode,
    toggleTheme,
    colors: {
      // Background colors
      bg: {
        primary: isDarkMode ? '#000000' : '#ffffff',
        secondary: isDarkMode ? '#1a1a1a' : '#f8f9fa',
        tertiary: isDarkMode ? '#2a2a2a' : '#e9ecef',
      },
      // Text colors
      text: {
        primary: isDarkMode ? '#ffffff' : '#000000',
        secondary: isDarkMode ? '#e0e0e0' : '#333333',
        muted: isDarkMode ? '#a0a0a0' : '#666666',
      },
      // Border colors
      border: {
        primary: isDarkMode ? '#db2b2e' : '#db2b2e',
        secondary: isDarkMode ? '#333333' : '#dee2e6',
        muted: isDarkMode ? '#2a2a2a' : '#e9ecef',
      },
      // Brand colors (remain consistent)
      brand: {
        primary: '#db2b2e',
        yellow: '#f3eb4b',
      }
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
}; 