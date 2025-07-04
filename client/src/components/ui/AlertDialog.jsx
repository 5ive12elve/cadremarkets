import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertCircle, FiCheckCircle, FiXCircle, FiInfo } from 'react-icons/fi';
import PropTypes from 'prop-types';

const AlertDialog = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  buttonText = 'OK',
  type = 'info' // 'info', 'success', 'warning', 'error'
}) => {
  const typeConfig = {
    info: {
      icon: FiInfo,
      iconColor: 'text-blue-500',
      button: 'bg-blue-500 hover:bg-blue-600 text-white'
    },
    success: {
      icon: FiCheckCircle,
      iconColor: 'text-green-500',
      button: 'bg-green-500 hover:bg-green-600 text-white'
    },
    warning: {
      icon: FiAlertCircle,
      iconColor: 'text-yellow-500',
      button: 'bg-yellow-500 hover:bg-yellow-600 text-white'
    },
    error: {
      icon: FiXCircle,
      iconColor: 'text-red-500',
      button: 'bg-red-500 hover:bg-red-600 text-white'
    }
  };

  const config = typeConfig[type];
  const IconComponent = config.icon;

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
              
              {/* Button */}
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className={`px-6 py-2 rounded font-nt transition-colors ${config.button}`}
                >
                  {buttonText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

AlertDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  buttonText: PropTypes.string,
  type: PropTypes.oneOf(['info', 'success', 'warning', 'error'])
};

export default AlertDialog; 