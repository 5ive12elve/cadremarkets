import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, clearCart, updateCartQuantity } from '../redux/cart/cartSlice';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrash, FaShoppingCart, FaTruck } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../locales/translations';

export default function Cart() {
  const { cartItems } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showClearModal, setShowClearModal] = useState(false);
  const { currentLang, isArabic } = useLanguage();

  // Get all translations at component level
  const yourCartText = useTranslation('cart', 'yourCart', currentLang);
  const clearCartText = useTranslation('cart', 'clearCart', currentLang);
  const cartEmptyText = useTranslation('cart', 'cartEmpty', currentLang);
  const addAmazingItemsText = useTranslation('cart', 'addAmazingItems', currentLang);
  const startShoppingText = useTranslation('cart', 'startShopping', currentLang);
  const sizeText = useTranslation('cart', 'size', currentLang);
  const availableText = useTranslation('cart', 'available', currentLang);
  const orderSummaryText = useTranslation('cart', 'orderSummary', currentLang);
  const subtotalText = useTranslation('cart', 'subtotal', currentLang);
  const shippingText = useTranslation('cart', 'shipping', currentLang);
  const totalText = useTranslation('cart', 'total', currentLang);
  const proceedToCheckoutText = useTranslation('cart', 'proceedToCheckout', currentLang);
  const continueShoppingText = useTranslation('cart', 'continueShopping', currentLang);
  const confirmClearCartText = useTranslation('cart', 'clearCartConfirm', currentLang);
  const confirmClearCartMessageText = useTranslation('cart', 'confirmClearCartMessage', currentLang);
  const cancelText = useTranslation('cart', 'cancel', currentLang);

  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipmentFees = cartItems.length > 0 ? (subtotal >= 1500 ? 0 : 85) : 0;
    const total = subtotal + shipmentFees;
    const isFreeShipping = subtotal >= 1500 && cartItems.length > 0;
    return { subtotal, shipmentFees, total, isFreeShipping };
  };

  const { subtotal, shipmentFees, total, isFreeShipping } = calculateTotals();

  const handleRemove = (item) => {
    if (item.type === 'Clothing & Wearables' && item.selectedSize) {
      dispatch(removeFromCart({ itemId: item._id, selectedSize: item.selectedSize }));
    } else {
      dispatch(removeFromCart(item._id));
    }
  };

  const handleClearCart = () => {
    dispatch(clearCart());
    setShowClearModal(false);
  };

  const getItemImage = (item) => {
    if (item.imageUrls && item.imageUrls.length > 0) {
      return item.imageUrls[0];
    }
    return item.imageUrl || '/placeholder-image.jpg';
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`min-h-screen bg-white dark:bg-black text-black dark:text-white pb-20 transition-colors duration-300 ${isArabic ? 'font-noto' : 'font-nt'}`}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {/* Header Section */}
              <div className="bg-white/90 dark:bg-black/90 border-b border-gray-200 dark:border-[#db2b2e]/20 sticky top-0 z-10 backdrop-blur-sm transition-colors duration-300">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className={`text-3xl font-bold flex items-center gap-3 ${isArabic ? 'font-amiri' : 'font-nt'}`}>
                {yourCartText} <FaShoppingCart className="text-[#db2b2e]" />
              </h1>
            </div>
            {cartItems.length > 0 && (
              <button
                onClick={() => setShowClearModal(true)}
                className={`text-red-500 hover:text-red-400 transition-colors flex items-center gap-2 ${isArabic ? 'flex-row-reverse font-noto' : 'font-nt'}`}
              >
                <FaTrash /> {clearCartText}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <FaShoppingCart className="text-6xl text-[#db2b2e]/20 mx-auto mb-6" />
            <h2 className={`text-2xl font-semibold mb-4 ${isArabic ? 'font-amiri' : 'font-nt'}`}>{cartEmptyText}</h2>
            <p className={`text-gray-400 mb-8 ${isArabic ? 'font-noto' : 'font-nt'}`}>{addAmazingItemsText}</p>
            <button
              onClick={() => navigate('/search')}
              className={`bg-[#db2b2e] text-white px-8 py-3 rounded-sm hover:bg-[#db2b2e]/90 transition-colors ${isArabic ? 'font-amiri' : 'font-nt'}`}
            >
              {startShoppingText}
            </button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="md:col-span-2 space-y-4">
              <AnimatePresence>
                {cartItems.map((item) => (
                  <motion.div
                    key={item.type === 'Clothing & Wearables' && item.selectedSize ? `${item._id}-${item.selectedSize}` : item._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-white dark:bg-black border border-gray-200 dark:border-[#db2b2e]/20 p-4 rounded-sm transition-colors duration-300"
                  >
                    <div className={`flex gap-4 ${isArabic ? 'flex-row-reverse' : ''}`}>
                      {/* Item Image */}
                      <img
                        src={getItemImage(item)}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-sm"
                      />
                      
                      {/* Item Details */}
                      <div className="flex-1">
                        <div className={`flex justify-between items-start ${isArabic ? 'flex-row-reverse' : ''}`}>
                          <div className={isArabic ? 'text-right' : 'text-left'}>
                            <h3 className={`text-lg font-semibold ${isArabic ? 'font-amiri' : 'font-nt'}`}>{item.name}</h3>
                            <p className={`text-[#db2b2e] ${isArabic ? 'font-noto' : 'font-nt'}`}>{item.price.toLocaleString()} EGP</p>
                            {item.type === 'Clothing & Wearables' && item.selectedSize && (
                              <p className={`text-sm text-gray-400 ${isArabic ? 'font-noto' : 'font-nt'}`}>{sizeText}: {item.selectedSize}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemove(item)}
                            className="text-red-500 hover:text-red-400 transition-colors"
                          >
                            <FaTrash />
                          </button>
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className={`mt-4 flex items-center gap-4 ${isArabic ? 'flex-row-reverse' : ''}`}>
                          <div className="flex items-center border border-[#db2b2e]">
                            <button
                              className={`px-3 py-1 text-[#db2b2e] hover:bg-[#db2b2e] hover:text-white transition-colors ${isArabic ? 'font-noto' : 'font-nt'}`}
                              onClick={() => dispatch(updateCartQuantity({ 
                                itemId: item._id, 
                                newQuantity: Math.max(1, item.quantity - 1),
                                selectedSize: item.selectedSize 
                              }))}
                            >
                              −
                            </button>
                            <span className={`px-4 py-1 border-x border-[#db2b2e] ${isArabic ? 'font-noto' : 'font-nt'}`}>
                              {item.quantity}
                            </span>
                            <button
                              className={`px-3 py-1 text-[#db2b2e] hover:bg-[#db2b2e] hover:text-white transition-colors ${isArabic ? 'font-noto' : 'font-nt'}`}
                              onClick={() => dispatch(updateCartQuantity({ 
                                itemId: item._id, 
                                newQuantity: Math.min(item.currentQuantity, item.quantity + 1),
                                selectedSize: item.selectedSize 
                              }))}
                              disabled={item.quantity >= item.currentQuantity}
                            >
                              +
                            </button>
                          </div>
                          <span className={`text-sm text-gray-400 ${isArabic ? 'font-noto' : 'font-nt'}`}>
                            {item.currentQuantity} {availableText}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white dark:bg-black border border-gray-200 dark:border-[#db2b2e]/20 p-6 rounded-sm h-fit sticky top-28 transition-colors duration-300 ${isArabic ? 'text-right' : 'text-left'}`}
            >
              <h2 className={`text-xl font-bold mb-6 ${isArabic ? 'font-amiri' : 'font-nt'}`}>{orderSummaryText}</h2>
              
              <div className="space-y-4">
                <div className={`flex justify-between items-center ${isArabic ? 'flex-row-reverse' : ''}`}>
                  <span className={`text-gray-400 ${isArabic ? 'font-noto' : 'font-nt'}`}>{subtotalText}</span>
                  <span className={`${isArabic ? 'font-noto' : 'font-nt'}`}>{subtotal.toLocaleString()} EGP</span>
                </div>
                
                <div className={`flex justify-between items-center ${isArabic ? 'flex-row-reverse' : ''}`}>
                  <span className={`text-gray-400 flex items-center gap-2 ${isArabic ? 'flex-row-reverse font-noto' : 'font-nt'}`}>
                    <FaTruck className="text-[#db2b2e]" /> {shippingText}
                  </span>
                  {isFreeShipping ? (
                    <span className="bg-[#f3eb4b] text-red-600 px-2 py-1 text-sm font-bold">
                      {isArabic ? 'شحن مجاني' : 'FREE SHIPPING'}
                    </span>
                  ) : (
                    <span className={`${isArabic ? 'font-noto' : 'font-nt'}`}>{shipmentFees} EGP</span>
                  )}
                </div>
                
                <div className="border-t border-[#db2b2e]/20 pt-4 mt-4">
                  <div className={`flex justify-between items-center text-xl font-bold ${isArabic ? 'flex-row-reverse' : ''}`}>
                    <span className={`${isArabic ? 'font-amiri' : 'font-nt'}`}>{totalText}</span>
                    <span className={`text-[#db2b2e] ${isArabic ? 'font-noto' : 'font-nt'}`}>{total.toLocaleString()} EGP</span>
                  </div>
                </div>
                
                <button
                  onClick={() => navigate('/checkout')}
                  className={`w-full bg-[#db2b2e] text-white py-3 mt-6 hover:bg-[#db2b2e]/90 transition-colors ${isArabic ? 'font-amiri' : 'font-nt'}`}
                >
                  {proceedToCheckoutText}
                </button>
                
                <button
                  onClick={() => navigate('/search')}
                  className={`w-full border border-[#db2b2e] text-[#db2b2e] py-3 hover:bg-[#db2b2e] hover:text-white transition-colors ${isArabic ? 'font-amiri' : 'font-nt'}`}
                >
                  {continueShoppingText}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Clear Cart Modal */}
      <AnimatePresence>
        {showClearModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`bg-white dark:bg-black border border-gray-200 dark:border-[#db2b2e]/20 p-6 rounded-sm max-w-md w-full mx-4 transition-colors duration-300 ${isArabic ? 'text-right' : 'text-left'}`}
              dir={isArabic ? 'rtl' : 'ltr'}
            >
              <h3 className={`text-xl font-bold mb-4 ${isArabic ? 'font-amiri' : 'font-nt'}`}>{confirmClearCartText}</h3>
              <p className={`text-gray-400 mb-6 ${isArabic ? 'font-noto' : 'font-nt'}`}>
                {confirmClearCartMessageText}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleClearCart}
                  className={`flex-1 bg-red-500 text-white py-2 hover:bg-red-600 transition-colors ${isArabic ? 'font-amiri' : 'font-nt'}`}
                >
                  {clearCartText}
                </button>
                <button
                  onClick={() => setShowClearModal(false)}
                  className={`flex-1 border border-[#db2b2e] text-[#db2b2e] py-2 hover:bg-[#db2b2e] hover:text-white transition-colors ${isArabic ? 'font-amiri' : 'font-nt'}`}
                >
                  {cancelText}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}