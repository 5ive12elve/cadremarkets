import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiBook, FiMessageSquare, FiPhone } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../locales/translations';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

export default function Support() {
  const { isArabic, currentLang } = useLanguage();

  // Get all translations at component level
  const title = useTranslation('support', 'title', currentLang);
  const subtitle = useTranslation('support', 'subtitle', currentLang);
  const gettingStarted = useTranslation('support', 'gettingStarted', currentLang);
  const gettingStartedDesc = useTranslation('support', 'gettingStartedDesc', currentLang);
  const forArtists = useTranslation('support', 'forArtists', currentLang);
  const forArtistsDesc = useTranslation('support', 'forArtistsDesc', currentLang);
  const forBuyers = useTranslation('support', 'forBuyers', currentLang);
  const forBuyersDesc = useTranslation('support', 'forBuyersDesc', currentLang);
  const submitRequest = useTranslation('support', 'submitRequest', currentLang);
  const fullName = useTranslation('support', 'fullName', currentLang);
  const email = useTranslation('support', 'email', currentLang);
  const phone = useTranslation('support', 'phone', currentLang);
  const orderNumber = useTranslation('support', 'orderNumber', currentLang);
  const issueCategory = useTranslation('support', 'issueCategory', currentLang);
  const specificIssue = useTranslation('support', 'specificIssue', currentLang);
  const priority = useTranslation('support', 'priority', currentLang);
  const message = useTranslation('support', 'message', currentLang);
  const submitBtn = useTranslation('support', 'submit', currentLang);
  const accountIssues = useTranslation('support', 'accountIssues', currentLang);
  const orderIssues = useTranslation('support', 'orderIssues', currentLang);
  const technicalIssues = useTranslation('support', 'technicalIssues', currentLang);
  const billingPayments = useTranslation('support', 'billingPayments', currentLang);
  const marketplace = useTranslation('support', 'marketplace', currentLang);
  const other = useTranslation('support', 'other', currentLang);
  const low = useTranslation('support', 'low', currentLang);
  const medium = useTranslation('support', 'medium', currentLang);
  const high = useTranslation('support', 'high', currentLang);
  const urgent = useTranslation('support', 'urgent', currentLang);
  const thankYou = useTranslation('support', 'thankYou', currentLang);
  const successMessage = useTranslation('support', 'successMessage', currentLang);
  const submitAnother = useTranslation('support', 'submitAnother', currentLang);
  const beforeSubmitting = useTranslation('support', 'beforeSubmitting', currentLang);
  const userGuideTitle = useTranslation('support', 'userGuideTitle', currentLang);
  
  // Get step arrays
  const gettingStartedSteps = useTranslation('support', 'gettingStartedSteps', currentLang);
  const forArtistsSteps = useTranslation('support', 'forArtistsSteps', currentLang);
  const forBuyersSteps = useTranslation('support', 'forBuyersSteps', currentLang);
  
  // Get issue type arrays
  const accountIssuesList = useTranslation('support', 'accountIssuesList', currentLang);
  const orderIssuesList = useTranslation('support', 'orderIssuesList', currentLang);
  const technicalIssuesList = useTranslation('support', 'technicalIssuesList', currentLang);
  const billingPaymentsList = useTranslation('support', 'billingPaymentsList', currentLang);
  const marketplaceList = useTranslation('support', 'marketplaceList', currentLang);
  const otherList = useTranslation('support', 'otherList', currentLang);
  
  // Form and tips text
  const selectCategory = useTranslation('support', 'selectCategory', currentLang);
  const selectIssue = useTranslation('support', 'selectIssue', currentLang);
  const messagePlaceholder = useTranslation('support', 'messagePlaceholder', currentLang);
  const submitting = useTranslation('support', 'submitting', currentLang);
  const checkGuide = useTranslation('support', 'checkGuide', currentLang);
  const haveOrderNumber = useTranslation('support', 'haveOrderNumber', currentLang);
  const beSpecific = useTranslation('support', 'beSpecific', currentLang);
  const needImmediateHelp = useTranslation('support', 'needImmediateHelp', currentLang);
  const urgentMatters = useTranslation('support', 'urgentMatters', currentLang);
  const responseTime = useTranslation('support', 'responseTime', currentLang);

  const [activeGuide, setActiveGuide] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    orderNumber: '',
    category: '',
    specificIssue: '',
    message: '',
    priority: 'medium'
  });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    setFormData(prev => ({
      ...prev,
      category,
      specificIssue: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          type: 'support'
        }),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          orderNumber: '',
          category: '',
          specificIssue: '',
          message: '',
          priority: 'medium'
        });
        setSelectedCategory('');
      } else {
        throw new Error('Failed to submit request');
      }
    } catch (error) {
      console.error('Error submitting support request:', error);
              toast.error(useTranslation('common', 'failedToSubmitRequest', currentLang));
    } finally {
      setIsSubmitting(false);
    }
  };

  const guides = [
    {
      title: gettingStarted,
      description: gettingStartedDesc,
      steps: gettingStartedSteps
    },
    {
      title: forArtists,
      description: forArtistsDesc,
      steps: forArtistsSteps
    },
    {
      title: forBuyers,
      description: forBuyersDesc,
      steps: forBuyersSteps
    }
  ];

  const issueTypes = {
    [accountIssues]: accountIssuesList,
    [orderIssues]: orderIssuesList,
    [technicalIssues]: technicalIssuesList,
    [billingPayments]: billingPaymentsList,
    [marketplace]: marketplaceList,
    [other]: otherList
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={`min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-300 ${
        isArabic ? 'font-noto' : 'font-nt'
      }`}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Section */}
        <motion.div variants={itemVariants} className="text-center mb-12 sm:mb-16">
          <div className="w-24 sm:w-32 h-1 bg-[#db2b2e] mx-auto mb-6 sm:mb-8"></div>
          <h1 className={`text-3xl sm:text-4xl md:text-5xl mb-4 text-[#db2b2e] ${
            isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
          }`}>
            {title}
          </h1>
          <p className={`text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto transition-colors duration-300 px-4 ${
            isArabic ? 'font-noto' : 'font-nt'
          }`}>
            {subtitle}
          </p>
          
          {/* Support Image */}
          <motion.div 
            variants={itemVariants}
            className="mt-8 sm:mt-12 flex justify-center"
          >
            <img 
              src="/mediassets/CADT03.png" 
              alt="Cadre Support" 
              className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg w-full h-auto object-contain"
            />
          </motion.div>
        </motion.div>

        {/* User Guide Section */}
        <motion.section variants={itemVariants} className="mb-16 sm:mb-20">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-6 sm:mb-8">
            <FiBook className="text-2xl sm:text-3xl text-[#db2b2e]" />
            <h2 className={`text-2xl sm:text-3xl ${
              isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
            }`}>
              {userGuideTitle}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {guides.map((guide, index) => (
              <motion.div
                key={guide.title}
                variants={itemVariants}
                className={`bg-white dark:bg-black border ${
                  activeGuide === index ? 'border-[#db2b2e]' : 'border-[#db2b2e]/20'
                } p-4 sm:p-6 transition-all hover:border-[#db2b2e] cursor-pointer`}
                onClick={() => setActiveGuide(activeGuide === index ? null : index)}
              >
                <h3 className={`text-lg sm:text-xl mb-3 ${
                  isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
                }`}>
                  {guide.title}
                </h3>
                <p className={`text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 transition-colors duration-300 ${
                  isArabic ? 'font-noto' : 'font-nt'
                }`}>
                  {guide.description}
                </p>
                {activeGuide === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-[#db2b2e]/20 pt-4 mt-4"
                  >
                    <ol className="list-decimal list-inside space-y-2">
                      {guide.steps && guide.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className={`text-sm sm:text-base text-gray-600 dark:text-gray-300 transition-colors duration-300 ${
                          isArabic ? 'font-noto' : 'font-nt'
                        }`}>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Support Request Section */}
        <motion.section variants={itemVariants} className="mb-16 sm:mb-20">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-6 sm:mb-8">
            <FiMessageSquare className="text-2xl sm:text-3xl text-[#db2b2e]" />
            <h2 className={`text-2xl sm:text-3xl ${
              isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
            }`}>
              {submitRequest}
            </h2>
          </div>

          {submitSuccess ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-[#db2b2e]/10 border border-[#db2b2e] p-6 sm:p-8 max-w-2xl mx-auto text-center"
            >
              <h3 className={`text-xl sm:text-2xl mb-4 ${
                isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
              }`}>
                {thankYou}
              </h3>
              <p className={`text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-6 transition-colors duration-300 ${
                isArabic ? 'font-noto' : 'font-nt'
              }`}>
                {successMessage}
              </p>
              <button
                onClick={() => setSubmitSuccess(false)}
                className={`bg-[#db2b2e] text-white px-4 sm:px-6 py-2 hover:bg-[#db2b2e]/90 text-sm sm:text-base ${
                  isArabic ? 'font-noto font-bold' : 'font-nt-bold'
                }`}
              >
                {submitAnother}
              </button>
            </motion.div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white dark:bg-black border border-[#db2b2e]/20 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 transition-colors duration-300">
                <h3 className={`text-lg sm:text-xl mb-4 ${
                  isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
                }`}>
                  {beforeSubmitting}
                </h3>
                <ul className={`space-y-2 text-sm sm:text-base text-gray-600 dark:text-gray-300 transition-colors duration-300 ${
                  isArabic ? 'font-noto' : 'font-nt'
                }`}>
                  <li className="flex items-start gap-2">
                    <span className="text-[#db2b2e] mt-1">•</span>
                    <span>{checkGuide}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#db2b2e] mt-1">•</span>
                    <span>{haveOrderNumber}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#db2b2e] mt-1">•</span>
                    <span>{beSpecific}</span>
                  </li>
                </ul>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isArabic ? 'font-noto' : 'font-nt'
                    }`}>
                      {fullName} *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className={`w-full px-3 py-2 border border-[#db2b2e] dark:border-[#db2b2e] bg-white dark:bg-black text-black dark:text-white focus:border-[#db2b2e] focus:ring-1 focus:ring-[#db2b2e] outline-none transition-colors duration-300 ${
                        isArabic ? 'font-noto' : 'font-nt'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isArabic ? 'font-noto' : 'font-nt'
                    }`}>
                      {email} *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={`w-full px-3 py-2 border border-[#db2b2e] dark:border-[#db2b2e] bg-white dark:bg-black text-black dark:text-white focus:border-[#db2b2e] focus:ring-1 focus:ring-[#db2b2e] outline-none transition-colors duration-300 ${
                        isArabic ? 'font-noto' : 'font-nt'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isArabic ? 'font-noto' : 'font-nt'
                    }`}>
                      {phone}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white focus:border-[#db2b2e] outline-none transition-colors duration-300 ${
                        isArabic ? 'font-noto' : 'font-nt'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isArabic ? 'font-noto' : 'font-nt'
                    }`}>
                      {orderNumber}
                    </label>
                    <input
                      type="text"
                      name="orderNumber"
                      value={formData.orderNumber}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white focus:border-[#db2b2e] outline-none transition-colors duration-300 ${
                        isArabic ? 'font-noto' : 'font-nt'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isArabic ? 'font-noto' : 'font-nt'
                    }`}>
                      {issueCategory} *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleCategoryChange}
                      required
                      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white focus:border-[#db2b2e] outline-none transition-colors duration-300 ${
                        isArabic ? 'font-noto' : 'font-nt'
                      }`}
                    >
                      <option value="">{selectCategory}</option>
                      {Object.keys(issueTypes).map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isArabic ? 'font-noto' : 'font-nt'
                    }`}>
                      {priority} *
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      required
                      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white focus:border-[#db2b2e] outline-none transition-colors duration-300 ${
                        isArabic ? 'font-noto' : 'font-nt'
                      }`}
                    >
                      <option value="low">{low}</option>
                      <option value="medium">{medium}</option>
                      <option value="high">{high}</option>
                      <option value="urgent">{urgent}</option>
                    </select>
                  </div>
                </div>

                {selectedCategory && issueTypes[selectedCategory] && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isArabic ? 'font-noto' : 'font-nt'
                    }`}>
                      {specificIssue}
                    </label>
                    <select
                      name="specificIssue"
                      value={formData.specificIssue}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white focus:border-[#db2b2e] outline-none transition-colors duration-300 ${
                        isArabic ? 'font-noto' : 'font-nt'
                      }`}
                    >
                      <option value="">{selectIssue}</option>
                      {issueTypes[selectedCategory].map(issue => (
                        <option key={issue} value={issue}>
                          {issue}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isArabic ? 'font-noto' : 'font-nt'
                  }`}>
                    {message} *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    className={`w-full px-3 py-2 border border-[#db2b2e] dark:border-[#db2b2e] bg-white dark:bg-black text-black dark:text-white focus:border-[#db2b2e] focus:ring-1 focus:ring-[#db2b2e] outline-none transition-colors duration-300 resize-vertical ${
                      isArabic ? 'font-noto' : 'font-nt'
                    }`}
                    placeholder={messagePlaceholder}
                  />
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`bg-[#db2b2e] text-white px-6 sm:px-8 py-3 hover:bg-[#db2b2e]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 ${
                      isArabic ? 'font-noto font-bold' : 'font-nt-bold'
                    }`}
                  >
                    {isSubmitting ? submitting : submitBtn}
                  </button>
                </div>
              </form>
            </div>
          )}
        </motion.section>

        {/* Contact Info Section */}
        <motion.section variants={itemVariants} className="text-center">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-6 sm:mb-8 justify-center">
            <FiPhone className="text-2xl sm:text-3xl text-[#db2b2e] mx-auto sm:mx-0" />
            <h2 className={`text-2xl sm:text-3xl ${
              isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
            }`}>
              {needImmediateHelp}
            </h2>
          </div>
          <p className={`text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-6 transition-colors duration-300 ${
            isArabic ? 'font-noto' : 'font-nt'
          }`}>
            {urgentMatters}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="mailto:support@cadremarkets.com"
              className={`text-[#db2b2e] hover:underline ${
                isArabic ? 'font-noto' : 'font-nt'
              }`}
            >
              support@cadremarkets.com
            </a>
            <span className="hidden sm:inline text-gray-400">|</span>
            <span className={`text-gray-600 dark:text-gray-300 transition-colors duration-300 ${
              isArabic ? 'font-noto' : 'font-nt'
            }`}>
              {responseTime}
            </span>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
} 