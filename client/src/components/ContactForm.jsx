import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../locales/translations';

const ContactForm = () => {
  const { currentLang, isArabic } = useLanguage();
  
  // Get all translations
  const nameLabel = useTranslation('home', 'name', currentLang);
  const emailLabel = useTranslation('home', 'email', currentLang);
  const phoneLabel = useTranslation('home', 'phoneNumber', currentLang);
  const phoneOptional = useTranslation('home', 'phoneOptional', currentLang);
  const reasonLabel = useTranslation('home', 'reasonForContact', currentLang);
  const selectReason = useTranslation('home', 'selectReason', currentLang);
  const messageLabel = useTranslation('home', 'message', currentLang);
  const messagePlaceholder = useTranslation('home', 'messagePlaceholder', currentLang);
  const sendMessage = useTranslation('home', 'sendMessage', currentLang);
  const sending = useTranslation('home', 'sending', currentLang);
  const thankYou = useTranslation('home', 'thankYou', currentLang);
  const successMessage = useTranslation('home', 'successMessage', currentLang);
  const sendAnotherMessage = useTranslation('home', 'sendAnotherMessage', currentLang);
  
  // Contact reasons translations
  const generalInquiry = useTranslation('home', 'generalInquiry', currentLang);
  const businessOpportunity = useTranslation('home', 'businessOpportunity', currentLang);
  const support = useTranslation('home', 'support', currentLang);
  const pressMedia = useTranslation('home', 'pressMedia', currentLang);
  const joinTeam = useTranslation('home', 'joinTeam', currentLang);
  const other = useTranslation('home', 'other', currentLang);
  
  const contactReasons = [
    { value: 'general', label: generalInquiry },
    { value: 'business', label: businessOpportunity },
    { value: 'support', label: support },
    { value: 'press', label: pressMedia },
    { value: 'join', label: joinTeam },
    { value: 'other', label: other }
  ];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    reason: '',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.reason) newErrors.reason = 'Please select a reason for contact';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    if (formData.phone && !/^[+\d\s-()]{7,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          type: 'contact',
          priority: 'normal',
          status: 'new'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        reason: '',
        message: '',
      });
    } catch {
      setSubmitError('Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {submitSuccess ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-primary/10 p-6 sm:p-8 rounded-lg"
        >
          <h3 className={`text-xl sm:text-2xl md:text-3xl font-bold mb-4 ${isArabic ? 'font-amiri' : 'font-nt-bold'}`}>{thankYou}</h3>
          <p className={`text-gray-300 text-base sm:text-lg ${isArabic ? 'font-noto' : 'font-nt'}`}>
            {successMessage}
          </p>
          <motion.button
            onClick={() => setSubmitSuccess(false)}
            className={`mt-6 bg-primary text-[#f3eb4b] font-bold px-6 py-3 text-base sm:text-lg hover:bg-primary/90 ${isArabic ? 'font-amiri' : 'font-nt-bold'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {sendAnotherMessage}
          </motion.button>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div>
            <label htmlFor="name" className={`block mb-2 text-base sm:text-lg ${isArabic ? 'font-noto' : 'font-nt'}`}>
              {nameLabel} <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full bg-transparent border-b ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-white'} p-3 text-base sm:text-lg outline-none text-black dark:text-white focus:border-primary transition-colors`}
              required
              aria-invalid={errors.name ? "true" : "false"}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="email" className={`block mb-2 text-base sm:text-lg ${isArabic ? 'font-noto' : 'font-nt'}`}>
              {emailLabel} <span className="text-primary">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full bg-transparent border-b ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-white'} p-3 text-base sm:text-lg outline-none text-black dark:text-white focus:border-primary transition-colors`}
              required
              aria-invalid={errors.email ? "true" : "false"}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className={`block mb-2 text-base sm:text-lg ${isArabic ? 'font-noto' : 'font-nt'}`}>
              {phoneLabel} <span className="text-gray-400">{phoneOptional}</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full bg-transparent border-b ${errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-white'} p-3 text-base sm:text-lg outline-none text-black dark:text-white focus:border-primary transition-colors`}
              aria-invalid={errors.phone ? "true" : "false"}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <label htmlFor="reason" className={`block mb-2 text-base sm:text-lg ${isArabic ? 'font-noto' : 'font-nt'}`}>
              {reasonLabel} <span className="text-primary">*</span>
            </label>
            <select
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className={`w-full bg-transparent border-b ${errors.reason ? 'border-red-500' : 'border-gray-300 dark:border-white'} p-3 text-base sm:text-lg outline-none text-black dark:text-white focus:border-primary transition-colors ${isArabic ? 'font-noto' : 'font-nt'}`}
              required
              aria-invalid={errors.reason ? "true" : "false"}
            >
              <option value="" className="text-black">{selectReason}</option>
              {contactReasons.map(reason => (
                <option key={reason.value} value={reason.value} className="text-black">{reason.label}</option>
              ))}
            </select>
            {errors.reason && (
              <p className="text-red-500 text-sm mt-1">{errors.reason}</p>
            )}
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="message" className={`block mb-2 text-base sm:text-lg ${isArabic ? 'font-noto' : 'font-nt'}`}>
              {messageLabel} <span className="text-primary">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="4"
              className={`w-full bg-transparent border-b ${errors.message ? 'border-red-500' : 'border-gray-300 dark:border-white'} p-3 text-base sm:text-lg outline-none text-black dark:text-white focus:border-primary transition-colors resize-none ${isArabic ? 'font-noto' : 'font-nt'}`}
              required
              aria-invalid={errors.message ? "true" : "false"}
              placeholder={messagePlaceholder}
              dir={isArabic ? 'rtl' : 'ltr'}
            />
            {errors.message && (
              <p className="text-red-500 text-sm mt-1">{errors.message}</p>
            )}
          </div>
          
          <div className="md:col-span-2">
            {submitError && (
              <p className="text-red-500 text-base mb-4">{submitError}</p>
            )}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className={`bg-primary text-[#f3eb4b] font-bold px-6 py-3 text-base sm:text-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto ${isArabic ? 'font-amiri' : 'font-nt-bold'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isSubmitting ? sending : sendMessage}
            </motion.button>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}

export default ContactForm; 