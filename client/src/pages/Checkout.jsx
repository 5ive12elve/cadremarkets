import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import { clearCart } from '../redux/cart/cartSlice';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShoppingBag, FaTruck, FaMobileAlt, FaMoneyBill } from 'react-icons/fa';
import AlertDialog from '../components/ui/AlertDialog';
import OrderSuccessPopup from '../components/ui/OrderSuccessPopup';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../locales/translations';
import PhoneInput from '../components/shared/PhoneInput';


const cairoDistricts = [
  'Maadi',
  'Heliopolis',
  'Nasr City',
  'New Cairo',
  'Zamalek',
  'Garden City',
  'Downtown Cairo',
  'Dokki',
  'Mohandessin',
  '6th of October',
  'Sheikh Zayed',
  'Giza',
  'Haram',
  'Shoubra',
  'Ain Shams',
  'El Matareya',
  'Madinaty',
  'El Rehab',
  'El Tagamoa El Khames',
  'Other'
];

export default function Checkout() {
  const { cartItems } = useSelector((state) => state.cart);
  const { currentLang, isArabic } = useLanguage();
  
  // Get key translations
  const checkoutText = useTranslation('checkout', 'checkout', currentLang);
  const contactInformationText = useTranslation('checkout', 'contactInformation', currentLang);
  const shippingAddressText = useTranslation('checkout', 'shippingAddress', currentLang);
  const paymentMethodText = useTranslation('checkout', 'paymentMethod', currentLang);
  const phoneNumberText = useTranslation('checkout', 'phoneNumber', currentLang);
  const emailText = useTranslation('checkout', 'email', currentLang);
  const enterPhoneNumberText = useTranslation('checkout', 'enterPhoneNumber', currentLang);
  const enterEmailText = useTranslation('checkout', 'enterEmail', currentLang);
  // Additional translations needed inline
  const backToContactText = useTranslation('checkout', 'backToContact', currentLang);
  const continueToPaymentText = useTranslation('checkout', 'continueToPayment', currentLang);
  const paymentMethodTranslation = useTranslation('checkout', 'paymentMethod', currentLang);
  const cashOnDeliveryTranslation = useTranslation('checkout', 'cashOnDelivery', currentLang);
  const payWhenReceiveTranslation = useTranslation('checkout', 'payWhenReceive', currentLang);
  
  const [orderDetails, setOrderDetails] = useState({
    phoneNumber: "",
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    district: "",
    city: "",
    paymentMethod: "cash",
    notes: "",
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  // Alert dialog states
  const [alertDialog, setAlertDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  // Order success popup states
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState(null);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingFee = subtotal >= 1500 ? 0 : 85;
  const total = subtotal + shippingFee;
  const isFreeShipping = subtotal >= 1500;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const showAlert = (title, message, type = 'info') => {
    setAlertDialog({
      isOpen: true,
      title,
      message,
      type
    });
  };

  const closeAlert = () => {
    setAlertDialog({
      isOpen: false,
      title: '',
      message: '',
      type: 'info'
    });
  };

  const handleOrderSuccessClose = () => {
    setShowOrderSuccess(false);
    // Clear form data when success popup is closed
    setOrderDetails({
      phoneNumber: "",
      email: "",
      firstName: "",
      lastName: "",
      address: "",
      district: "",
      city: "",
      paymentMethod: "cash",
      notes: "",
    });
    setCurrentStep(1);
    setValidationErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrderDetails((prev) => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handlePhoneChange = (value) => {
    setOrderDetails((prev) => ({
      ...prev,
      phoneNumber: value || ''
    }));
    
    // Clear validation error for phone when user starts typing
    if (validationErrors.phoneNumber) {
      setValidationErrors(prev => ({ ...prev, phoneNumber: null }));
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return orderDetails.phoneNumber && orderDetails.email;
      case 2:
        return (
          orderDetails.firstName &&
          orderDetails.lastName &&
          orderDetails.address &&
          orderDetails.city &&
          orderDetails.district
        );
      default:
        return true;
    }
  };

  const handleNextStep = (nextStep) => {
    const errors = {};
    
    if (currentStep === 1) {
      if (!orderDetails.phoneNumber.trim()) errors.phoneNumber = "Phone number is required";
      if (!orderDetails.email.trim()) errors.email = "Email is required";
      if (orderDetails.email && !/\S+@\S+\.\S+/.test(orderDetails.email)) {
        errors.email = "Please enter a valid email address";
      }
    }
    
    if (currentStep === 2) {
      if (!orderDetails.firstName.trim()) errors.firstName = "First name is required";
      if (!orderDetails.lastName.trim()) errors.lastName = "Last name is required";
      if (!orderDetails.address.trim()) errors.address = "Address is required";
      if (!orderDetails.city.trim()) errors.city = "City is required";
      if (!orderDetails.district.trim()) errors.district = "District is required";
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      const stepMessages = {
        1: "Please fill in all contact information fields (phone number and email).",
        2: "Please fill in all shipping address fields (first name, last name, address, city, and district)."
      };
      showAlert("Required Fields Missing", stepMessages[currentStep], "warning");
      return;
    }
    
    setValidationErrors({});
    setCurrentStep(nextStep);
  };

  const getItemImage = (item) => {
    if (item.imageUrls && item.imageUrls.length > 0) {
      return item.imageUrls[0];
    }
    return item.imageUrl || '/placeholder-image.jpg';
  };

  const handlePlaceOrder = async () => {
    if (!validateStep(1) || !validateStep(2)) {
      showAlert("Validation Error", "Please fill in all required fields.", "warning");
      return;
    }

    setIsSubmitting(true);
    const fullName = `${orderDetails.firstName} ${orderDetails.lastName}`;
  
    const orderData = {
      orderItems: cartItems.map((item) => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
        sellerInfo: item.sellerInfo,
        // Include selectedSize for clothing items
        ...(item.type === 'Clothing & Wearables' && item.selectedSize && {
          selectedSize: item.selectedSize
        })
      })),
      customerInfo: {
        name: fullName,
        phoneNumber: orderDetails.phoneNumber,
        email: orderDetails.email,
        address: orderDetails.address,
        city: orderDetails.city,
        district: orderDetails.district,
        paymentMethod: orderDetails.paymentMethod,
      },
      shipmentFees: shippingFee,
      totalPrice: total,
      cadreProfit: subtotal * 0.10,
      notes: orderDetails.notes,
    };
  
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create order');
  
      // Prepare order success data
      setOrderSuccessData({
        orderId: data._id || data.orderId || Date.now().toString(),
        total: total,
        itemCount: cartItems.length
      });
      
      dispatch(clearCart());
      setShowOrderSuccess(true);
    } catch (err) {
      showAlert("Order Failed", `Error creating order: ${err.message}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`min-h-screen bg-white dark:bg-black text-black dark:text-white pb-20 transition-colors duration-300 font-primary`}
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="bg-white/90 dark:bg-black/90 border-b border-gray-200 dark:border-[#db2b2e]/20 sticky top-0 z-10 backdrop-blur-sm transition-colors duration-300">
          <div className="max-w-6xl mx-auto p-6">
            <div className="flex items-center justify-center">
              <h1 className={`text-3xl font-bold flex items-center gap-3 font-primary ${isArabic ? 'flex-row-reverse' : ''}`}>
                {checkoutText} <FaShoppingBag className="text-[#db2b2e]" />
              </h1>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-6">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              {/* Progress Steps */}
              <div className={`flex justify-between mb-8`}>
                {(isArabic ? [
                  { num: 1, title: contactInformationText },
                  { num: 2, title: shippingAddressText },
                  { num: 3, title: paymentMethodText },
                ] : [
                  { num: 1, title: contactInformationText },
                  { num: 2, title: shippingAddressText },
                  { num: 3, title: paymentMethodText },
                                 ]).map((step) => (
                <div
                  key={step.num}
                  className={`flex items-center ${isArabic ? 'flex-row-reverse' : ''} ${
                    step.num < currentStep
                      ? "text-[#db2b2e]"
                      : step.num === currentStep
                      ? "text-black dark:text-white"
                      : "text-gray-600"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${isArabic ? 'ml-2' : 'mr-2'} ${
                      step.num <= currentStep ? "border-[#db2b2e]" : "border-gray-600"
                    } font-secondary`}
                  >
                    {step.num}
                  </div>
                  <span className="font-secondary">{step.title}</span>
                </div>
              ))}
            </div>

            {/* Step 1: Contact Information */}
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: isArabic ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isArabic ? 20 : -20 }}
                  className="space-y-6"
                >
                  <h2 className={`text-xl font-semibold mb-4 font-primary ${isArabic ? 'text-right' : 'text-left'}`}>{contactInformationText}</h2>
                  <div className="mb-4">
                    <label htmlFor="phoneNumber" className={`block text-sm text-gray-400 mb-1 font-secondary ${isArabic ? 'text-right' : 'text-left'}`}>
                      {phoneNumberText} <span className="text-[#db2b2e]">*</span>
                    </label>
                    <PhoneInput
                      value={orderDetails.phoneNumber}
                      onChange={handlePhoneChange}
                      placeholder={enterPhoneNumberText}
                      error={validationErrors.phoneNumber}
                      dir={isArabic ? 'rtl' : 'ltr'}
                      className={`p-3 bg-white dark:bg-black border ${validationErrors.phoneNumber ? 'border-red-500' : 'border-gray-300 dark:border-[#db2b2e]/20'} rounded-sm focus:border-[#db2b2e] transition-colors text-black dark:text-white font-secondary ${isArabic ? 'text-right' : 'text-left'}`}
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="email" className={`block text-sm text-gray-400 mb-1 font-secondary ${isArabic ? 'text-right' : 'text-left'}`}>
                      {emailText} <span className="text-[#db2b2e]">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className={`w-full p-3 bg-white dark:bg-black border ${validationErrors.email ? 'border-red-500' : 'border-gray-300 dark:border-[#db2b2e]/20'} rounded-sm focus:border-[#db2b2e] transition-colors outline-none text-black dark:text-white font-secondary ${isArabic ? 'text-right' : 'text-left'}`}
                      value={orderDetails.email}
                      onChange={handleChange}
                      required
                      placeholder={enterEmailText}
                      dir={isArabic ? 'rtl' : 'ltr'}
                    />
                    {validationErrors.email && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
                    )}
                  </div>
                  <div className={`flex ${isArabic ? 'flex-row-reverse' : ''} justify-between`}>
                    <button
                      onClick={() => navigate('/cart')}
                      className={`text-[#db2b2e] hover:text-[#db2b2e]/80 transition-colors font-primary`}
                    >
                      {useTranslation('checkout', 'backToCart', currentLang)}
                    </button>
                    <button
                      onClick={() => handleNextStep(2)}
                      className={`bg-[#db2b2e] text-white px-6 py-3 rounded-sm hover:bg-[#db2b2e]/90 transition-colors font-primary`}
                    >
                      {useTranslation('checkout', 'continueToShipping', currentLang)}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Shipping Information */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: isArabic ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isArabic ? 20 : -20 }}
                  className="space-y-6"
                >
                  <h2 className={`text-xl font-semibold mb-4 font-primary ${isArabic ? 'text-right' : 'text-left'}`}>{useTranslation('checkout', 'shippingAddress', currentLang)}</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="mb-4">
                      <label htmlFor="firstName" className={`block text-sm text-gray-400 mb-1 font-secondary ${isArabic ? 'text-right' : 'text-left'}`}>
                        {useTranslation('checkout', 'firstName', currentLang)} <span className="text-[#db2b2e]">*</span>
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        className={`w-full p-3 bg-white dark:bg-black border border-gray-300 dark:border-[#db2b2e]/20 rounded-sm focus:border-[#db2b2e] transition-colors outline-none text-black dark:text-white font-secondary ${isArabic ? 'text-right' : 'text-left'}`}
                        value={orderDetails.firstName}
                        onChange={handleChange}
                        required
                        placeholder={useTranslation('checkout', 'enterFirstName', currentLang)}
                        dir={isArabic ? 'rtl' : 'ltr'}
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="lastName" className={`block text-sm text-gray-400 mb-1 font-secondary ${isArabic ? 'text-right' : 'text-left'}`}>
                        {useTranslation('checkout', 'lastName', currentLang)} <span className="text-[#db2b2e]">*</span>
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        className={`w-full p-3 bg-white dark:bg-black border border-gray-300 dark:border-[#db2b2e]/20 rounded-sm focus:border-[#db2b2e] transition-colors outline-none text-black dark:text-white font-secondary ${isArabic ? 'text-right' : 'text-left'}`}
                        value={orderDetails.lastName}
                        onChange={handleChange}
                        required
                        placeholder={useTranslation('checkout', 'enterLastName', currentLang)}
                        dir={isArabic ? 'rtl' : 'ltr'}
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="address" className={`block text-sm text-gray-400 mb-1 font-secondary ${isArabic ? 'text-right' : 'text-left'}`}>
                      {useTranslation('checkout', 'address', currentLang)} <span className="text-[#db2b2e]">*</span>
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      className={`w-full p-3 bg-white dark:bg-black border border-gray-300 dark:border-[#db2b2e]/20 rounded-sm focus:border-[#db2b2e] transition-colors outline-none text-black dark:text-white font-secondary ${isArabic ? 'text-right' : 'text-left'}`}
                      value={orderDetails.address}
                      onChange={handleChange}
                      required
                      placeholder={useTranslation('checkout', 'enterAddress', currentLang)}
                      dir={isArabic ? 'rtl' : 'ltr'}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="mb-4">
                      <label htmlFor="city" className={`block text-sm text-gray-400 mb-1 font-secondary ${isArabic ? 'text-right' : 'text-left'}`}>
                        {useTranslation('checkout', 'city', currentLang)} <span className="text-[#db2b2e]">*</span>
                      </label>
                      <select
                        id="city"
                        name="city"
                        className={`w-full p-3 bg-white dark:bg-black border border-gray-300 dark:border-[#db2b2e]/20 rounded-sm focus:border-[#db2b2e] transition-colors outline-none text-black dark:text-white font-secondary ${isArabic ? 'text-right' : 'text-left'}`}
                        value={orderDetails.city}
                        onChange={handleChange}
                        required
                      >
                        <option value="">{useTranslation('checkout', 'selectCity', currentLang)}</option>
                        <option value="Cairo">{useTranslation('checkout', 'cairo', currentLang)}</option>
                        <option value="Other">{useTranslation('checkout', 'other', currentLang)}</option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="district" className={`block text-sm text-gray-400 mb-1 font-secondary ${isArabic ? 'text-right' : 'text-left'}`}>
                        {useTranslation('checkout', 'district', currentLang)} <span className="text-[#db2b2e]">*</span>
                      </label>
                      {orderDetails.city === 'Cairo' ? (
                        <select
                          id="district"
                          name="district"
                          className={`w-full p-3 bg-white dark:bg-black border border-gray-300 dark:border-[#db2b2e]/20 rounded-sm focus:border-[#db2b2e] transition-colors outline-none text-black dark:text-white font-secondary ${isArabic ? 'text-right' : 'text-left'}`}
                          value={orderDetails.district}
                          onChange={handleChange}
                          required
                        >
                          <option value="">{useTranslation('checkout', 'selectDistrict', currentLang)}</option>
                          {cairoDistricts.map((district) => (
                            <option key={district} value={district}>
                              {district}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          id="district"
                          name="district"
                          className={`w-full p-3 bg-white dark:bg-black border border-gray-300 dark:border-[#db2b2e]/20 rounded-sm focus:border-[#db2b2e] transition-colors outline-none text-black dark:text-white font-secondary ${isArabic ? 'text-right' : 'text-left'}`}
                          value={orderDetails.district}
                          onChange={handleChange}
                          required
                          placeholder={useTranslation('checkout', 'enterDistrict', currentLang)}
                          dir={isArabic ? 'rtl' : 'ltr'}
                        />
                      )}
                    </div>
                  </div>
                  <div className={`flex ${isArabic ? 'flex-row-reverse' : ''} justify-between`}>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className={`text-[#db2b2e] hover:text-[#db2b2e]/80 transition-colors font-primary`}
                    >
                      {backToContactText}
                    </button>
                    <button
                      onClick={() => handleNextStep(3)}
                      className={`bg-[#db2b2e] text-white px-6 py-3 rounded-sm hover:bg-[#db2b2e]/90 transition-colors font-primary`}
                    >
                      {continueToPaymentText}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Payment Method */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: isArabic ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isArabic ? 20 : -20 }}
                  className="space-y-6"
                >
                  <h2 className={`text-xl font-semibold mb-4 font-primary ${isArabic ? 'text-right' : 'text-left'}`}>{paymentMethodTranslation}</h2>
                  <div className="space-y-4">
                    <label className={`block p-4 border rounded-sm cursor-pointer transition-colors bg-white dark:bg-black ${
                      orderDetails.paymentMethod === "cash" 
                        ? "border-[#db2b2e]" 
                        : "border-gray-300 dark:border-[#db2b2e]/20 hover:border-[#db2b2e]"
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={orderDetails.paymentMethod === "cash"}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <div className={`flex items-center gap-3 ${isArabic ? 'flex-row-reverse' : ''}`}>
                        <FaMoneyBill className={orderDetails.paymentMethod === "cash" ? "text-[#db2b2e]" : "text-gray-400"} />
                        <div className={`${isArabic ? 'text-right' : 'text-left'} flex-1`}>
                          <div className={`font-semibold ${isArabic ? 'font-amiri' : 'font-primary'}`}>{cashOnDeliveryTranslation}</div>
                          <div className={`text-sm text-gray-400 ${isArabic ? 'font-noto' : 'font-secondary'}`}>{payWhenReceiveTranslation}</div>
                        </div>
                      </div>
                    </label>

                    <label className={`block p-4 border rounded-sm cursor-pointer transition-colors bg-white dark:bg-black ${
                      orderDetails.paymentMethod === "instapay" 
                        ? "border-[#db2b2e]" 
                        : "border-gray-300 dark:border-[#db2b2e]/20 hover:border-[#db2b2e]"
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="instapay"
                        checked={orderDetails.paymentMethod === "instapay"}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <div className={`flex items-center gap-3 ${isArabic ? 'flex-row-reverse' : ''}`}>
                        <FaMobileAlt className={orderDetails.paymentMethod === "instapay" ? "text-[#db2b2e]" : "text-gray-400"} />
                        <div className={`${isArabic ? 'text-right' : 'text-left'} flex-1`}>
                          <div className={`font-semibold ${isArabic ? 'font-amiri' : 'font-primary'}`}>{useTranslation('checkout', 'instaPay', currentLang)}</div>
                          <div className={`text-sm text-gray-400 ${isArabic ? 'font-noto' : 'font-secondary'}`}>{useTranslation('checkout', 'payUsingInstaPay', currentLang)}</div>
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="mt-6">
                    <label htmlFor="notes" className={`block text-sm text-gray-400 mb-2 font-secondary ${isArabic ? 'text-right' : 'text-left'}`}>
                      {useTranslation('checkout', 'notes', currentLang)}
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      className={`w-full p-3 bg-white dark:bg-black border border-gray-300 dark:border-[#db2b2e]/20 rounded-sm focus:border-[#db2b2e] transition-colors outline-none text-black dark:text-white font-secondary ${isArabic ? 'text-right' : 'text-left'}`}
                      rows="4"
                      value={orderDetails.notes}
                      onChange={handleChange}
                      placeholder={useTranslation('checkout', 'notesPlaceholder', currentLang)}
                      dir={isArabic ? 'rtl' : 'ltr'}
                    />
                  </div>

                  <div className={`flex ${isArabic ? 'flex-row-reverse' : ''} justify-between`}>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className={`text-[#db2b2e] hover:text-[#db2b2e]/80 transition-colors font-primary`}
                    >
                      {useTranslation('checkout', 'backToShipping', currentLang)}
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isSubmitting}
                      className={`bg-[#db2b2e] text-white px-8 py-3 rounded-sm hover:bg-[#db2b2e]/90 transition-colors flex items-center gap-2 ${
                        isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                      } font-primary`}
                    >
                      {isSubmitting ? useTranslation('checkout', 'processing', currentLang) : useTranslation('checkout', 'placeOrder', currentLang)}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white dark:bg-black border border-gray-200 dark:border-[#db2b2e]/20 p-6 rounded-sm h-fit sticky top-28 transition-colors duration-300 ${isArabic ? 'text-right' : 'text-left'}`}
          >
            <h2 className={`text-xl font-bold mb-6 font-primary`}>{useTranslation('checkout', 'orderSummary', currentLang)}</h2>
            
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.type === 'Clothing & Wearables' && item.selectedSize ? `${item._id}-${item.selectedSize}` : item._id} className={`flex gap-3 ${isArabic ? 'flex-row-reverse' : ''}`}>
                  <img
                    src={getItemImage(item)}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-sm"
                  />
                  <div className={isArabic ? 'text-right' : 'text-left'}>
                    <h3 className={`font-medium font-primary`}>{item.name}</h3>
                    <p className={`text-sm text-gray-400 font-secondary`}>{useTranslation('checkout', 'quantity', currentLang)}: {item.quantity}</p>
                    {item.type === 'Clothing & Wearables' && item.selectedSize && (
                      <p className={`text-sm text-gray-400 font-secondary`}>{useTranslation('checkout', 'size', currentLang)}: {item.selectedSize}</p>
                    )}
                    <p className="text-[#db2b2e] font-nt">{item.price.toLocaleString()} EGP</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-3 border-t border-[#db2b2e]/20 pt-4">
              <div className={`flex justify-between items-center ${isArabic ? 'flex-row-reverse' : ''}`}>
                <span className={`text-gray-400 font-secondary`}>{useTranslation('checkout', 'subtotal', currentLang)}</span>
                <span className="font-nt">{subtotal.toLocaleString()} EGP</span>
              </div>
              
              <div className={`flex justify-between items-center ${isArabic ? 'flex-row-reverse' : ''}`}>
                <span className={`text-gray-400 flex items-center gap-2 font-secondary ${isArabic ? 'flex-row-reverse' : ''}`}>
                  <FaTruck className="text-[#db2b2e]" /> {useTranslation('checkout', 'shipping', currentLang)}
                </span>
                                 {isFreeShipping ? (
                   <span className="bg-[#f3eb4b] text-red-600 px-2 py-1 text-sm font-bold">
                     {isArabic ? 'شحن مجاني' : 'FREE SHIPPING'}
                   </span>
                 ) : (
                  <span className="font-nt">{shippingFee} EGP</span>
                )}
              </div>
              
              <div className="border-t border-[#db2b2e]/20 pt-3 mt-3">
                <div className={`flex justify-between items-center text-xl font-bold ${isArabic ? 'flex-row-reverse' : ''}`}>
                  <span className="font-primary">{useTranslation('checkout', 'total', currentLang)}</span>
                  <span className="text-[#db2b2e] font-nt">{total.toLocaleString()} EGP</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.main>

    {/* Alert Dialog */}
    <AlertDialog
      isOpen={alertDialog.isOpen}
      onClose={closeAlert}
      title={alertDialog.title}
      message={alertDialog.message}
      type={alertDialog.type}
    />

    {/* Order Success Popup */}
    <OrderSuccessPopup
      isOpen={showOrderSuccess}
      onClose={handleOrderSuccessClose}
      orderData={orderSuccessData}
    />
  </>
  );
}
