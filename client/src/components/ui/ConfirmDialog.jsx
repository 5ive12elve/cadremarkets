import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import PropTypes from 'prop-types';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning' // 'warning', 'danger', 'success'
}) => {
  const typeConfig = {
    warning: {
      icon: FiAlertTriangle,
      iconColor: 'text-yellow-500',
      confirmButton: 'bg-yellow-500 hover:bg-yellow-600 text-white'
    },
    danger: {
      icon: FiXCircle,
      iconColor: 'text-red-500',
      confirmButton: 'bg-red-500 hover:bg-red-600 text-white'
    },
    success: {
      icon: FiCheckCircle,
      iconColor: 'text-green-500',
      confirmButton: 'bg-green-500 hover:bg-green-600 text-white'
    }
  };

  const config = typeConfig[type];
  const IconComponent = config.icon;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          
          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl"
          >
            <div className="p-6">
              {/* Icon and Title */}
              <div className="flex items-center mb-4">
                <IconComponent className={`w-6 h-6 mr-3 ${config.iconColor}`} />
                <h3 className="text-lg font-nt-bold text-black dark:text-white">
                  {title}
                </h3>
              </div>
              
              {/* Message */}
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {message}
              </p>
              
              {/* Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded font-nt transition-colors"
                >
                  {cancelText}
                </button>
                <button
                  onClick={handleConfirm}
                  className={`px-4 py-2 rounded font-nt transition-colors ${config.confirmButton}`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

ConfirmDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  type: PropTypes.oneOf(['warning', 'danger', 'success'])
};

export default ConfirmDialog; 