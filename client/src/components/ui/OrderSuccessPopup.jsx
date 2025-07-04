import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import html2canvas from 'html2canvas';
import PropTypes from 'prop-types';
import { useLanguage } from '../../contexts/LanguageContext';

const OrderSuccessPopup = ({ isOpen, onClose, orderData }) => {
  const navigate = useNavigate();
  const popupRef = useRef(null);
  const { isArabic } = useLanguage();

  const handleGoHome = () => {
    navigate('/');
    onClose();
  };

  const handleSaveImage = async () => {
    if (popupRef.current) {
      try {
        const canvas = await html2canvas(popupRef.current, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
        });
        
        const link = document.createElement('a');
        link.download = `cadre-order-${orderData?.orderId || 'confirmation'}.png`;
        link.href = canvas.toDataURL();
        link.click();
      } catch (error) {
        console.error('Error saving image:', error);
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          <motion.div
            ref={popupRef}
            className="bg-white dark:bg-black border-2 border-[#db2b2e] max-w-lg w-full relative font-primary"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#db2b2e] p-4 text-center">
              <div className="bg-white dark:bg-black w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiCheck className="w-6 h-6 text-[#db2b2e]" />
              </div>
              <h2 className={`text-white text-xl font-bold font-primary ${isArabic ? 'text-center' : 'text-center'}`}>
                {isArabic ? 'تم تأكيد الطلب بنجاح!' : 'Order Placed Successfully!'}
              </h2>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Order Details */}
              <div className="bg-gray-100 dark:bg-gray-800 p-3 mb-4 border border-gray-200 dark:border-gray-600 transition-colors duration-300">
                <h3 className={`text-base font-bold text-black dark:text-white mb-2 font-primary ${isArabic ? 'text-right' : 'text-left'}`}>
                  {isArabic ? 'تفاصيل الطلب' : 'Order Details'}
                </h3>
                <div className="space-y-1 text-sm">
                  <div className={`flex justify-between ${isArabic ? 'flex-row-reverse' : ''}`}>
                    <span className={`text-gray-600 dark:text-gray-300 font-secondary`}>
                      {isArabic ? 'رقم الطلب:' : 'Order ID:'}
                    </span>
                    <span className="font-bold text-[#db2b2e] font-nt">#{orderData?.orderId || 'N/A'}</span>
                  </div>
                  <div className={`flex justify-between ${isArabic ? 'flex-row-reverse' : ''}`}>
                    <span className={`text-gray-600 dark:text-gray-300 font-secondary`}>
                      {isArabic ? 'التاريخ:' : 'Date:'}
                    </span>
                    <span className="text-black dark:text-white font-secondary">{formatDate(new Date())}</span>
                  </div>
                  <div className={`flex justify-between ${isArabic ? 'flex-row-reverse' : ''}`}>
                    <span className={`text-gray-600 dark:text-gray-300 font-secondary`}>
                      {isArabic ? 'المجموع:' : 'Total:'}
                    </span>
                    <span className="font-bold text-black dark:text-white font-nt">{orderData?.total || 0} EGP</span>
                  </div>
                  <div className={`flex justify-between ${isArabic ? 'flex-row-reverse' : ''}`}>
                    <span className={`text-gray-600 dark:text-gray-300 font-secondary`}>
                      {isArabic ? 'العناصر:' : 'Items:'}
                    </span>
                    <span className="text-black dark:text-white font-secondary">
                      {orderData?.itemCount || 0} {isArabic ? 'عنصر' : 'item(s)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Confirmation Message */}
              <div className="bg-[#f3eb4b]/20 border border-[#f3eb4b]/40 p-3 mb-4">
                <p className={`text-black dark:text-white text-center text-sm font-secondary ${isArabic ? 'text-right' : 'text-center'}`}>
                  <strong className="text-[#db2b2e] font-primary">
                    {isArabic ? 'كادر ماركتس' : 'Cadre Markets'}
                  </strong>
                  {isArabic ? ' ستتواصل معك خلال ' : ' will contact you within '}
                  <strong className="text-[#db2b2e]">
                    {isArabic ? '24 ساعة' : '24 hours'}
                  </strong>
                  {isArabic ? ' لتأكيد طلبك وترتيب التسليم.' : ' to confirm your order and arrange delivery.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleSaveImage}
                  className={`w-full bg-[#f3eb4b] text-[#db2b2e] py-2 px-4 text-sm font-bold hover:bg-[#f3eb4b]/90 transition-colors font-primary`}
                >
                  {isArabic ? 'حفظ تأكيد الطلب' : 'Save Order Confirmation'}
                </button>
                <button
                  onClick={handleGoHome}
                  className={`w-full border-2 border-[#db2b2e] text-[#db2b2e] py-2 px-4 text-sm font-bold hover:bg-[#db2b2e] hover:text-white transition-colors font-primary`}
                >
                  {isArabic ? 'العودة للصفحة الرئيسية' : 'Return to Homepage'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

OrderSuccessPopup.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  orderData: PropTypes.shape({
    orderId: PropTypes.string,
    total: PropTypes.number,
    itemCount: PropTypes.number,
  }),
};

export default OrderSuccessPopup; 