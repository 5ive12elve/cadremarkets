import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX } from 'react-icons/fi';
import PropTypes from 'prop-types';

const ProfileUpdateSuccessPopup = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white dark:bg-black border-2 border-[#db2b2e] max-w-md w-full relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-black dark:text-white hover:text-[#db2b2e] transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>

            {/* Header */}
            <div className="bg-[#db2b2e] p-6 text-center">
              <div className="bg-white dark:bg-black w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheck className="w-8 h-8 text-[#db2b2e]" />
              </div>
              <h2 className="text-white text-2xl font-nt-bold">Profile Updated!</h2>
            </div>

            {/* Content */}
            <div className="p-6 text-center">
              <div className="mb-6">
                <img 
                  src="/mediassets/CadreBigUse2.png" 
                  alt="Cadre Markets" 
                  className="w-32 mx-auto mb-4"
                />
                <p className="text-black dark:text-white text-lg mb-2">
                  Your profile has been successfully updated!
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  All changes have been saved to your account.
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={onClose}
                className="w-full bg-[#db2b2e] text-white py-3 px-6 font-nt-bold hover:bg-[#db2b2e]/90 transition-colors"
              >
                Continue
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

ProfileUpdateSuccessPopup.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ProfileUpdateSuccessPopup; 