import { useState, useCallback } from 'react';

const useConfirmDialog = () => {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'warning'
  });

  const confirm = useCallback((message, title = 'Confirm Action', type = 'warning') => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        title,
        message,
        type,
        onConfirm: () => {
          setDialogState(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        }
      });
    });
  }, []);

  const closeDialog = useCallback(() => {
    setDialogState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (dialogState.onConfirm) {
      dialogState.onConfirm();
    }
  }, [dialogState]);

  return {
    confirm,
    closeDialog,
    dialogProps: {
      isOpen: dialogState.isOpen,
      onClose: closeDialog,
      onConfirm: handleConfirm,
      title: dialogState.title,
      message: dialogState.message,
      type: dialogState.type
    }
  };
};

export default useConfirmDialog; 