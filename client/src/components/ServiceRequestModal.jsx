import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck } from 'react-icons/fi';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';
import { getPageTranslations } from '../locales/translations';
import PhoneInput from './shared/PhoneInput';

// Service types with translation keys
const serviceTypes = {
  visual: {
    labelKey: 'visualDesign',
    subTypes: [
      'logoDesign',
      'uxUiDesign', 
      'digitalProductDesign',
      'graphicDesign',
      'brandStrategy',
      'graffiti',
      'corporateIdentity',
      'artDirection',
      'creativeDirection',
      'rebranding'
    ]
  },
  ad: {
    labelKey: 'advertisement',
    subTypes: [
      'advertisements',
      'storyboarding',
      'photosessions',
      'videoShoots',
      'reels',
      'motionGraphics',
      'documentaries',
      'direction',
      'lighting',
      'filmmaking',
      'videoEditing'
    ]
  },
  sound: {
    labelKey: 'soundDesign',
    subTypes: [
      'musicProduction',
      'sonicTextures',
      'mixingMastering',
      'voiceoverDirection',
      'audioDesign',
      'soundIdentity'
    ]
  }
};

const designStages = [
  'designsFromScratch',
  'revisionsExisting',
  'other'
];

const projectScopes = [
  'oneTimeProject',
  'onGoing',
  'other'
];

const budgetRanges = [
  'lessThan5000',
  'range5to10k',
  'range10to25k',
  'range25to50k',
  'range50to100k',
  'moreThan100k'
];

export default function ServiceRequestModal({ isOpen, onClose }) {
  const { isArabic, currentLang } = useLanguage();
  const t = getPageTranslations('serviceModal', currentLang);
  
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    serviceType: '',
    subType: '',
    designStage: '',
    projectScope: '',
    budget: '',
    details: ''
  });
  const [errors, setErrors] = useState({});

  // Step configuration
  const steps = [
    {
      id: 1,
      title: t?.step1Title || 'Basic Information',
      description: t?.step1Description || 'Tell us about yourself',
      icon: '👤'
    },
    {
      id: 2,
      title: t?.step2Title || 'Service Details',
      description: t?.step2Description || 'Choose your service',
      icon: '🎨'
    },
    {
      id: 3,
      title: t?.step3Title || 'Project Scope',
      description: t?.step3Description || 'Define your project',
      icon: '📋'
    },
    {
      id: 4,
      title: t?.step4Title || 'Additional Details',
      description: t?.step4Description || 'Tell us more',
      icon: '📝'
    }
  ];

  const validateStep = (currentStep) => {
    const newErrors = {};

    switch (currentStep) {
      case 1:
        if (!formData.fullName.trim()) newErrors.fullName = t?.fullNameRequired || 'Full name is required';
        if (!formData.phoneNumber.trim()) {
          newErrors.phoneNumber = t?.phoneNumberRequired || 'Phone number is required';
        } else if (!/^[+\d\s-()]{7,}$/.test(formData.phoneNumber)) {
          newErrors.phoneNumber = t?.phoneNumberInvalid || 'Please enter a valid phone number';
        }
        if (!formData.email.trim()) {
          newErrors.email = t?.emailRequired || 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = t?.emailInvalid || 'Please enter a valid email';
        }
        if (!formData.serviceType) newErrors.serviceType = t?.serviceTypeRequired || 'Please select a service type';
        break;
      case 2:
        if (!formData.subType) newErrors.subType = t?.serviceCategoryRequired || 'Please select a service category';
        if (!formData.budget) newErrors.budget = t?.budgetRangeRequired || 'Please select a budget range';
        break;
      case 3:
        if (!formData.designStage) newErrors.designStage = t?.designStageRequired || 'Please select a design stage';
        if (!formData.projectScope) newErrors.projectScope = t?.projectScopeRequired || 'Please select a project scope';
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isStepCompleted = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        return formData.fullName.trim() && 
               formData.phoneNumber.trim() && 
               /^[+\d\s-()]{7,}$/.test(formData.phoneNumber) &&
               formData.email.trim() && 
               /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
               formData.serviceType;
      case 2:
        return formData.subType && formData.budget;
      case 3:
        return formData.designStage && formData.projectScope;
      case 4:
        return true; // Step 4 is optional
      default:
        return false;
    }
  };

  const canProceedToStep = (targetStep) => {
    // Can always go back
    if (targetStep < step) return true;
    
    // Can only proceed if all previous steps are completed
    for (let i = 1; i < targetStep; i++) {
      if (!isStepCompleted(i)) return false;
    }
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Reset dependent fields when service type changes
    if (name === 'serviceType') {
      setFormData(prev => ({
        ...prev,
        subType: ''
      }));
    }
  };

  const handlePhoneChange = (value) => {
    setFormData(prev => ({
      ...prev,
      phoneNumber: value || ''
    }));
    if (errors.phoneNumber) {
      setErrors(prev => ({ ...prev, phoneNumber: '' }));
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    } else {
      // Show toast error if validation fails
      toast.error(t?.pleaseCompleteFields || 'Please complete all required fields before proceeding.');
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleStepClick = (targetStep) => {
    if (canProceedToStep(targetStep)) {
      setStep(targetStep);
    } else {
      toast.error(t?.completePreviousSteps || 'Please complete previous steps first.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(step)) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requesterName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          serviceType: formData.serviceType,
          subType: formData.subType,
          budget: formData.budget,
          designStage: formData.designStage,
          projectScope: formData.projectScope,
          details: formData.details,
          status: 'pending'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const newErrors = {};
          Object.entries(data.errors).forEach(([field, message]) => {
            const fieldMap = {
              requesterName: 'fullName',
              phoneNumber: 'phoneNumber',
              email: 'email',
              serviceType: 'serviceType',
              subType: 'subType',
              budget: 'budget',
              designStage: 'designStage',
              projectScope: 'projectScope'
            };
            newErrors[fieldMap[field] || field] = message;
          });
          setErrors(newErrors);
          throw new Error(data.message || 'Validation failed');
        }
        throw new Error(data.message || 'Failed to submit request');
      }

      setShowSuccess(true);
      
      // Clear form data after successful submission
      setFormData({
        fullName: '',
        phoneNumber: '',
        email: '',
        serviceType: '',
        subType: '',
        designStage: '',
        projectScope: '',
        budget: '',
        details: ''
      });
      setErrors({});
      setStep(1);
      
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        toast.success('Service request submitted successfully');
      }, 2000);
    } catch (error) {
      console.error('Error submitting service request:', error);
      if (!Object.keys(errors).length) {
        toast.error(error.message || 'Failed to submit request. Please try again.');
      }
    }
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const successVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1,
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      scale: 0.8,
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="absolute inset-0 bg-black/80" onClick={onClose}></div>
      
      <AnimatePresence mode="wait">
        {showSuccess ? (
          <motion.div
            key="success"
            variants={successVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative bg-white dark:bg-black border border-primary dark:border-[#db2b2e] w-full max-w-md mx-4 p-8"
          >
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-primary dark:bg-[#db2b2e] flex items-center justify-center mb-4">
                <FiCheck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 font-nt">{t?.requestSubmitted || 'Request Submitted!'}</h3>
              <p className="text-gray-600 dark:text-white/80 font-nt">{t?.getBackSoon || 'We\'ll get back to you shortly.'}</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={step}
            custom={step}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="relative bg-white dark:bg-black border border-primary dark:border-[#db2b2e] w-full max-w-sm sm:max-w-lg lg:max-w-2xl mx-2 sm:mx-4"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className={`absolute top-3 sm:top-4 ${isArabic ? 'left-3 sm:left-4' : 'right-3 sm:right-4'} text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors z-10`}
            >
              <FiX size={20} className="sm:w-6 sm:h-6" />
            </button>

            {/* Stepper Header */}
            <div className="bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
              <div className={`flex items-center justify-center ${isArabic ? 'flex-row-reverse' : ''}`}>
                <h2 className={`text-base sm:text-lg font-semibold text-gray-900 dark:text-white ${isArabic ? 'font-amiri' : 'font-nt'}`}>
                  {t?.serviceRequest || 'Service Request'}
                </h2>
              </div>
              
              {/* Stepper Indicators */}
              <div className={`flex items-center justify-between ${isArabic ? 'flex-row-reverse' : ''} mt-3 sm:mt-4`}>
                {steps.map((stepItem, index) => (
                  <div key={stepItem.id} className={`flex items-center flex-1 ${isArabic ? 'flex-row-reverse' : ''}`}>
                    <button
                      onClick={() => handleStepClick(stepItem.id)}
                      disabled={!canProceedToStep(stepItem.id)}
                      className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 transition-all duration-200 ${
                        stepItem.id === step
                          ? 'border-primary dark:border-[#db2b2e] bg-primary dark:bg-[#db2b2e] text-white'
                          : isStepCompleted(stepItem.id)
                          ? 'border-green-500 bg-green-500 text-white'
                          : canProceedToStep(stepItem.id)
                          ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-primary dark:hover:border-[#db2b2e]'
                          : 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isStepCompleted(stepItem.id) ? (
                        <FiCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                      ) : (
                        <span className="text-xs sm:text-sm font-medium">{stepItem.id}</span>
                      )}
                    </button>
                    
                    {/* Step Title - Hidden on mobile, shown on larger screens */}
                    <div className={`${isArabic ? 'mr-2' : 'ml-2'} flex-1 hidden sm:block ${isArabic ? 'text-right' : 'text-left'}`}>
                      <div className={`text-xs font-medium ${
                        stepItem.id === step
                          ? 'text-primary dark:text-[#db2b2e]'
                          : isStepCompleted(stepItem.id)
                          ? 'text-green-600 dark:text-green-400'
                          : canProceedToStep(stepItem.id)
                          ? 'text-gray-600 dark:text-gray-400'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        {stepItem.title}
                      </div>
                    </div>
                    
                    {/* Connector Line - Hidden on mobile for cleaner look */}
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 ${isArabic ? 'mr-2' : 'ml-2'} hidden sm:block ${
                        isStepCompleted(stepItem.id + 1)
                          ? 'bg-green-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Mobile Step Title - Shows current step title below stepper */}
              <div className="sm:hidden mt-2 text-center">
                <div className={`text-sm font-medium ${
                  isStepCompleted(step)
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-primary dark:text-[#db2b2e]'
                }`}>
                  {steps.find(s => s.id === step)?.title}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {steps.find(s => s.id === step)?.description}
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-8">
              {/* Step 1: Basic Information */}
              {step === 1 && (
                <div className="space-y-4 sm:space-y-6">
                  <div className={isArabic ? 'text-right' : 'text-left'}>
                    <h2 className={`text-xl sm:text-2xl font-bold mb-2 text-gray-900 dark:text-white ${isArabic ? 'font-amiri' : 'font-nt'}`}>{t?.tellUsAboutYourself || 'Tell us about yourself'}</h2>
                    <p className={`text-sm sm:text-base text-gray-600 dark:text-white/80 ${isArabic ? 'font-noto' : 'font-nt'}`}>{t?.basicInformation || 'Let\'s start with some basic information'}</p>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className={`block mb-1 text-gray-900 dark:text-white ${isArabic ? 'font-noto text-right' : 'font-nt text-left'}`}>{t?.fullName || 'Full Name'} *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className={`w-full bg-white dark:bg-black border border-gray-300 dark:border-[#db2b2e]/20 p-2.5 sm:p-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/50 focus:outline-none focus:border-primary dark:focus:border-[#db2b2e] ${isArabic ? 'text-right font-noto' : 'text-left font-nt'}`}
                        placeholder={t?.enterFullName || 'Enter your full name'}
                      />
                      {errors.fullName && (
                        <p className={`text-red-500 dark:text-[#db2b2e] text-sm mt-1 ${isArabic ? 'text-right font-noto' : 'text-left font-nt'}`}>{errors.fullName}</p>
                      )}
                    </div>

                    <div>
                      <label className={`block mb-1 text-gray-900 dark:text-white ${isArabic ? 'font-noto text-right' : 'font-nt text-left'}`}>{t?.phoneNumber || 'Phone Number'} *</label>
                      <PhoneInput
                        value={formData.phoneNumber}
                        onChange={handlePhoneChange}
                        placeholder={t?.enterPhoneNumber || 'Enter your phone number'}
                        error={errors.phoneNumber}
                        dir={isArabic ? 'rtl' : 'ltr'}
                        className={`bg-white dark:bg-black border border-gray-300 dark:border-[#db2b2e]/20 p-2.5 sm:p-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/50 focus:outline-none focus:border-primary dark:focus:border-[#db2b2e] ${isArabic ? 'text-right font-noto' : 'text-left font-nt'}`}
                      />
                    </div>

                    <div>
                      <label className={`block mb-1 text-gray-900 dark:text-white ${isArabic ? 'font-noto text-right' : 'font-nt text-left'}`}>{t?.email || 'Email'} *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full bg-white dark:bg-black border border-gray-300 dark:border-[#db2b2e]/20 p-2.5 sm:p-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/50 focus:outline-none focus:border-primary dark:focus:border-[#db2b2e] ${isArabic ? 'text-right font-noto' : 'text-left font-nt'}`}
                        placeholder={t?.enterEmail || 'Enter your email'}
                      />
                      {errors.email && (
                        <p className={`text-red-500 dark:text-[#db2b2e] text-sm mt-1 ${isArabic ? 'text-right font-noto' : 'text-left font-nt'}`}>{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className={`block mb-1 text-gray-900 dark:text-white ${isArabic ? 'font-noto text-right' : 'font-nt text-left'}`}>{t?.serviceType || 'Service Type'} *</label>
                      <select
                        name="serviceType"
                        value={formData.serviceType}
                        onChange={handleChange}
                        className={`w-full bg-white dark:bg-black border border-gray-300 dark:border-[#db2b2e]/20 p-2.5 sm:p-3 text-gray-900 dark:text-white focus:outline-none focus:border-primary dark:focus:border-[#db2b2e] [&>option]:text-black dark:[&>option]:text-white [&>option]:bg-white dark:[&>option]:bg-black ${isArabic ? 'text-right font-noto' : 'text-left font-nt'}`}
                      >
                        <option value="">{t?.selectServiceType || 'Select a service type'}</option>
                        {Object.entries(serviceTypes).map(([key, { labelKey }]) => (
                          <option key={key} value={key}>
                            {t?.[labelKey] || labelKey}
                          </option>
                        ))}
                      </select>
                      {errors.serviceType && (
                        <p className={`text-red-500 dark:text-[#db2b2e] text-sm mt-1 ${isArabic ? 'text-right font-noto' : 'text-left font-nt'}`}>{errors.serviceType}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Service Details */}
              {step === 2 && (
                <div className="space-y-4 sm:space-y-6">
                  <div className={isArabic ? 'text-right' : 'text-left'}>
                    <h2 className={`text-xl sm:text-2xl font-bold mb-2 text-gray-900 dark:text-white ${isArabic ? 'font-amiri' : 'font-nt'}`}>{t?.serviceDetails || 'Service Details'}</h2>
                    <p className={`text-sm sm:text-base text-gray-600 dark:text-white/80 ${isArabic ? 'font-noto' : 'font-nt'}`}>{t?.serviceDetailsDescription || 'Tell us more about the service you need'}</p>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className={`block mb-1 text-gray-900 dark:text-white ${isArabic ? 'font-noto text-right' : 'font-nt text-left'}`}>
                        {t?.whatKindOf || 'What kind of'} {serviceTypes[formData.serviceType]?.labelKey ? (t?.[serviceTypes[formData.serviceType].labelKey]?.toLowerCase() || serviceTypes[formData.serviceType].labelKey) : ''} {t?.servicesQuestion || 'services?'} *
                      </label>
                      <select
                        name="subType"
                        value={formData.subType}
                        onChange={handleChange}
                        className={`w-full bg-white dark:bg-black border border-gray-300 dark:border-[#db2b2e]/20 p-2.5 sm:p-3 text-gray-900 dark:text-white focus:outline-none focus:border-primary dark:focus:border-[#db2b2e] [&>option]:text-black dark:[&>option]:text-white [&>option]:bg-white dark:[&>option]:bg-black ${isArabic ? 'text-right font-noto' : 'text-left font-nt'}`}
                      >
                        <option value="">{t?.serviceCategory || 'Select a service category'}</option>
                        {serviceTypes[formData.serviceType]?.subTypes.map(typeKey => (
                          <option key={typeKey} value={typeKey}>
                            {t?.[typeKey] || typeKey}
                          </option>
                        ))}
                      </select>
                      {errors.subType && (
                        <p className={`text-red-500 dark:text-[#db2b2e] text-sm mt-1 ${isArabic ? 'text-right font-noto' : 'text-left font-nt'}`}>{errors.subType}</p>
                      )}
                    </div>

                    <div>
                      <label className={`block mb-1 text-gray-900 dark:text-white ${isArabic ? 'font-noto text-right' : 'font-nt text-left'}`}>{t?.budgetRange || 'Budget Range'} *</label>
                      <select
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        className={`w-full bg-white dark:bg-black border border-gray-300 dark:border-[#db2b2e]/20 p-2.5 sm:p-3 text-gray-900 dark:text-white focus:outline-none focus:border-primary dark:focus:border-[#db2b2e] [&>option]:text-black dark:[&>option]:text-white [&>option]:bg-white dark:[&>option]:bg-black ${isArabic ? 'text-right font-noto' : 'text-left font-nt'}`}
                      >
                        <option value="">{t?.selectBudgetRange || 'Select budget range'}</option>
                        {budgetRanges.map(rangeKey => (
                          <option key={rangeKey} value={rangeKey}>
                            {t?.[rangeKey] || rangeKey}
                          </option>
                        ))}
                      </select>
                      {errors.budget && (
                        <p className={`text-red-500 dark:text-[#db2b2e] text-sm mt-1 ${isArabic ? 'text-right font-noto' : 'text-left font-nt'}`}>{errors.budget}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Project Details */}
              {step === 3 && (
                <div className="space-y-4 sm:space-y-6">
                  <div className={isArabic ? 'text-right' : 'text-left'}>
                    <h2 className={`text-xl sm:text-2xl font-bold mb-2 text-gray-900 dark:text-white ${isArabic ? 'font-amiri' : 'font-nt'}`}>{t?.projectDetails || 'Project Details'}</h2>
                    <p className={`text-sm sm:text-base text-gray-600 dark:text-white/80 ${isArabic ? 'font-noto' : 'font-nt'}`}>{t?.projectDetailsDescription || 'Tell us about your project requirements'}</p>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className={`block mb-1 text-gray-900 dark:text-white ${isArabic ? 'font-noto text-right' : 'font-nt text-left'}`}>{t?.designStage || 'What\'s your design stage?'} *</label>
                      <select
                        name="designStage"
                        value={formData.designStage}
                        onChange={handleChange}
                        className={`w-full bg-white dark:bg-black border border-gray-300 dark:border-[#db2b2e]/20 p-2.5 sm:p-3 text-gray-900 dark:text-white focus:outline-none focus:border-primary dark:focus:border-[#db2b2e] [&>option]:text-black dark:[&>option]:text-white [&>option]:bg-white dark:[&>option]:bg-black ${isArabic ? 'text-right font-noto' : 'text-left font-nt'}`}
                      >
                        <option value="">{t?.selectDesignStage || 'Select design stage'}</option>
                        {designStages.map(stageKey => (
                          <option key={stageKey} value={stageKey}>
                            {t?.[stageKey] || stageKey}
                          </option>
                        ))}
                      </select>
                      {errors.designStage && (
                        <p className={`text-red-500 dark:text-[#db2b2e] text-sm mt-1 ${isArabic ? 'text-right font-noto' : 'text-left font-nt'}`}>{errors.designStage}</p>
                      )}
                    </div>

                    <div>
                      <label className={`block mb-1 text-gray-900 dark:text-white ${isArabic ? 'font-noto text-right' : 'font-nt text-left'}`}>{t?.projectScope || 'What is the scope of this project?'} *</label>
                      <select
                        name="projectScope"
                        value={formData.projectScope}
                        onChange={handleChange}
                        className={`w-full bg-white dark:bg-black border border-gray-300 dark:border-[#db2b2e]/20 p-2.5 sm:p-3 text-gray-900 dark:text-white focus:outline-none focus:border-primary dark:focus:border-[#db2b2e] [&>option]:text-black dark:[&>option]:text-white [&>option]:bg-white dark:[&>option]:bg-black ${isArabic ? 'text-right font-noto' : 'text-left font-nt'}`}
                      >
                        <option value="">{t?.selectProjectScope || 'Select project scope'}</option>
                        {projectScopes.map(scopeKey => (
                          <option key={scopeKey} value={scopeKey}>
                            {t?.[scopeKey] || scopeKey}
                          </option>
                        ))}
                      </select>
                      {errors.projectScope && (
                        <p className={`text-red-500 dark:text-[#db2b2e] text-sm mt-1 ${isArabic ? 'text-right font-noto' : 'text-left font-nt'}`}>{errors.projectScope}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Additional Details */}
              {step === 4 && (
                <div className="space-y-4 sm:space-y-6">
                  <div className={isArabic ? 'text-right' : 'text-left'}>
                    <h2 className={`text-xl sm:text-2xl font-bold mb-2 text-gray-900 dark:text-white ${isArabic ? 'font-amiri' : 'font-nt'}`}>{t?.additionalDetails || 'Additional Details'}</h2>
                    <p className={`text-sm sm:text-base text-gray-600 dark:text-white/80 ${isArabic ? 'font-noto' : 'font-nt'}`}>{t?.additionalDetailsDescription || 'Tell us more about your project'}</p>
                  </div>

                  <div>
                    <label className={`block mb-1 text-gray-900 dark:text-white ${isArabic ? 'font-noto text-right' : 'font-nt text-left'}`}>{t?.projectDetailsField || 'Project Details'}</label>
                    <textarea
                      name="details"
                      value={formData.details}
                      onChange={handleChange}
                      rows="4"
                      className={`w-full bg-white dark:bg-black border border-gray-300 dark:border-[#db2b2e]/20 p-2.5 sm:p-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/50 focus:outline-none focus:border-primary dark:focus:border-[#db2b2e] resize-none ${isArabic ? 'text-right font-noto' : 'text-left font-nt'}`}
                      placeholder={t?.projectDetailsPlaceholder || 'Please provide any additional details about your project...'}
                    ></textarea>
                  </div>

                  {errors.submit && (
                    <p className={`text-red-500 dark:text-[#db2b2e] text-sm ${isArabic ? 'text-right font-noto' : 'text-left font-nt'}`}>{errors.submit}</p>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className={`flex justify-between mt-6 sm:mt-8 ${isArabic ? 'flex-row-reverse' : ''}`}>
                {step > 1 && (
                  <button
                    onClick={handleBack}
                    className={`px-4 sm:px-6 py-2 border border-primary dark:border-[#db2b2e] text-gray-900 dark:text-white hover:bg-primary/10 dark:hover:bg-[#db2b2e]/10 transition-colors ${isArabic ? 'font-noto' : 'font-nt'}`}
                  >
                    {t?.back || 'Back'}
                  </button>
                )}
                <div className={isArabic ? 'mr-auto' : 'ml-auto'}>
                  {step < 4 ? (
                    <button
                      onClick={handleNext}
                      disabled={!isStepCompleted(step)}
                      className={`px-4 sm:px-6 py-2 transition-colors ${isArabic ? 'font-noto' : 'font-nt'} ${
                        isStepCompleted(step)
                          ? 'bg-primary dark:bg-[#db2b2e] text-white hover:bg-primary/90 dark:hover:bg-[#db2b2e]/90'
                          : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {t?.next || 'Next'}
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      className={`px-4 sm:px-6 py-2 bg-primary dark:bg-[#db2b2e] text-white hover:bg-primary/90 dark:hover:bg-[#db2b2e]/90 transition-colors ${isArabic ? 'font-noto' : 'font-nt'}`}
                    >
                      {t?.submitRequest || 'Submit Request'}
                    </button>
                  )}
                </div>
              </div>
              
              {/* Validation Summary */}
              {Object.keys(errors).length > 0 && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className={`text-red-600 dark:text-red-400 text-sm font-medium ${isArabic ? 'font-noto text-right' : 'font-nt text-left'}`}>
                    {t?.pleaseFixErrors || 'Please fix the following errors:'}
                  </p>
                  <ul className={`mt-2 space-y-1 ${isArabic ? 'text-right' : 'text-left'}`}>
                    {Object.values(errors).map((error, index) => (
                      <li key={index} className={`text-red-600 dark:text-red-400 text-sm ${isArabic ? 'font-noto' : 'font-nt'}`}>
                        • {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

ServiceRequestModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};