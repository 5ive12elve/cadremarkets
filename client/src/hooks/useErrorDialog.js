import { useState } from 'react';
import { ErrorTypes } from '../utils/errorHandler';

const useErrorDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({
    title: '',
    message: '',
    showLoginButton: false
  });

  const showError = (error) => {
    let config = {
      title: 'Error',
      message: error.message || 'An unexpected error occurred.',
      showLoginButton: false
    };

    // Configure dialog based on error type
    if (error.type === ErrorTypes.AUTH_ERROR) {
      config = {
        title: 'Authentication Error',
        message: 'Your session has expired or you are not authorized. Please log in again.',
        showLoginButton: true
      };
    }

    setDialogConfig(config);
    setIsOpen(true);
  };

  return {
    isOpen,
    setIsOpen,
    dialogConfig,
    showError
  };
};

export default useErrorDialog; 