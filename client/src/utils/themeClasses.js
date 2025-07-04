// Common theme-aware class combinations for consistent styling

export const themeClasses = {
  // Background classes
  bg: {
    primary: 'bg-white dark:bg-black',
    secondary: 'bg-gray-100 dark:bg-gray-900',
    tertiary: 'bg-gray-50 dark:bg-gray-800',
    card: 'bg-white dark:bg-black',
    overlay: 'bg-white/90 dark:bg-black/90',
    modal: 'bg-white dark:bg-black',
  },
  
  // Text classes
  text: {
    primary: 'text-black dark:text-white',
    secondary: 'text-gray-700 dark:text-gray-300',
    muted: 'text-gray-500 dark:text-gray-400',
    inverse: 'text-white dark:text-black',
  },
  
  // Border classes
  border: {
    primary: 'border-gray-300 dark:border-white/20',
    secondary: 'border-gray-200 dark:border-gray-700',
    muted: 'border-gray-100 dark:border-gray-800',
    accent: 'border-primary',
  },
  
  // Input classes
  input: {
    base: 'bg-white dark:bg-black border-gray-300 dark:border-white/20 text-black dark:text-white placeholder-gray-500 dark:placeholder-white/70 focus:border-primary',
    search: 'bg-transparent text-black dark:text-white placeholder-gray-500 dark:placeholder-white/70',
  },
  
  // Button classes
  button: {
    primary: 'bg-primary text-white hover:bg-primary/90',
    secondary: 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700',
    ghost: 'bg-transparent text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800',
  },
  
  // Card classes
  card: {
    base: 'bg-white dark:bg-black border border-gray-200 dark:border-white/10',
    elevated: 'bg-white dark:bg-black border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-none',
    interactive: 'bg-white dark:bg-black border border-gray-200 dark:border-white/10 hover:border-primary transition-colors',
  },
  
  // Common combinations
  page: 'bg-white dark:bg-black text-black dark:text-white transition-colors duration-300',
  section: 'bg-gray-50 dark:bg-gray-900 text-black dark:text-white',
  container: 'bg-white dark:bg-black border border-gray-200 dark:border-white/10',
};

// Helper function to combine theme classes
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

// Helper function to get theme-aware classes
export const getThemeClasses = (category, variant = 'base') => {
  return themeClasses[category]?.[variant] || '';
}; 