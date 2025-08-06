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
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
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
            className="relative bg-white dark:bg-black border border-primary dark:border-[#db2b2e] w-full max-w-2xl mx-4"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className={`absolute top-4 ${isArabic ? 'left-4' : 'right-4'} text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors`}
            >
              <FiX size={24} />
            </button>

            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary/20 dark:bg-[#db2b2e]/20">
              <div
                className="h-full bg-primary dark:bg-[#db2b2e] transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              ></div>
            </div>

            <div className="p-8 pt-12">
              {/* Step 1: Basic Information */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className={isArabic ? 'text-right' : 'text-left'}>
                    <h2 className={`text-2xl font-bold mb-2 text-gray-900 dark:text-white ${isArabic ? 'font-amiri' : 'font-nt'}`}>{t?.tellUsAboutYourself || 'Tell us about yourself'}</h2>
                    <p className={`text-gray-600 dark:text-white/80 ${isArabic ? 'font-noto' : 'font-nt'}`}>{t?.basicInformation || 'Let\'s start with some basic information'}</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className={`block mb-1 text-gray-900 dark:text-white ${isArabic ? 'font-noto text-right' : 'font-nt text-left'}`}>{t?.fullName || 'Full Name'} *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className={`w-full bg-white dark:bg-black border border-gray-300 dark:border-[#db2b2e]/20 p-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/50 focus:outline-none focus:border-primary dark:focus:border-[#db2b2e] ${isArabic ? 'text-right font-noto' : 'text-left font-nt'}`}
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
                        className={`bg-white dark:bg-black border border-gray-300 dark:border-[#db2b2e]/20 p-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/50 focus:outline-none focus:border-primary dark:focus:border-[#db2b2e] ${isArabic ? 'text-right font-noto' : 'text-left font-nt'}`}
                      />
                    </div>

                    <div>
                      <label className={`block mb-1 text-gray-900 dark:text-white ${isArabic ? 'font-noto text-right' : 'font-nt text-left'}`}>{t?.email || 'Email'} *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full bg-white dark:bg-black border border-gray-300 dark:border-[#db2b2e]/20 p-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/50 focus:outline-none focus:border-primary dark:focus:border-[#db2b2e] ${isArabic ? 'text-right font-noto' : 'text-left font-nt'}`}
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
                        className={`w-full bg-white dark:bg-black border border-gray-300 dark:border-[#db2b2e]/20 p-3 text-gray-900 dark:text-white focus:outline-none focus:border-primary dark:focus:border-[#db2b2e] [&>option]:text-black dark:[&>option]:text-white [&>option]:bg-white dark:[&>option]:bg-black ${isArabic ? 'text-right font-noto' : 'text-left font-nt'}`}
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
                <div className="space-y-6">
                  <div className={isArabic ? 'text-right' : 'text-left'}>
                    <h2 className={`text-2xl font-bold mb-2 text-gray-900 dark:text-white ${isArabic ? 'font-amiri' : 'font-nt'}`}>{t?.serviceDetails || 'Service Details'}</h2>
                    <p className={`text-gray-600 dark:text-white/80 ${isArabic ? 'font-noto' : 'font-nt'}`}>{t?.serviceDetailsDescription || 'Tell us more about the service you need'}</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className={`block mb-1 text-gray-900 dark:text-white ${isArabic ? 'font-noto text-right' : 'font-nt text-left'}`}>
                        {t?.whatKindOf || 'What kind of'} {serviceTypes[formData.serviceType]?.labelKey ? (t?.[serviceTypes[formData.serviceType].labelKey]?.toLowerCase() || serviceTypes[formData.serviceType].labelKey) : ''} {t?.servicesQuestion || 'services?'} *
                      </label>
                      <select
                        name="subType"
                        value={formData.subType}
                        onChange={handleChange}
                        className={`w-full bg-white dark:bg-black border border-gray-300 dark:border-[#db2b2e]/20 p-3 text-gray-900 dark:text-white focus:outline-none focus:border-primary dark:focus:border-[#db2b2e] [&>option]:text-black dark:[&>option]:text-white [&>option]:bg-white dark:[&>option]:bg-black ${isArabic ? 'text-right font-noto' : 'text-left font-nt'}`}
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
                        className={`w-full bg-white dark:bg-black border border-gray-300 dark:border-[#db2b2e]/20 p-3 text-gray-900 dark:text-white focus:outline-none focus:border-primary dark:focus:border-[#db2b2e] [&>option]:text-black dark:[&>option]:text-white [&>option]:bg-white dark:[&>option]:bg-black ${isArabic ? 'text-right font-noto' : 'text-left font-nt'}`}
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
                <div className="space-y-6">
                  <div className={isArabic ? 'text-right' : 'text-left'}>
                    <h2 className={`text-2xl font-bold mb-2 text-gray-900 dark:text-white ${isArabic ? 'font-amiri' : 'font-nt'}`}>{t?.projectDetails || 'Project Details'}</h2>
                    <p className={`text-gray-600 dark:text-white/80 ${isArabic ? 'font-noto' : 'font-nt'}`}>{t?.projectDetailsDescription || 'Tell us about your project requirements'}</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className={`block mb-1 text-gray-900 dark:text-white ${isArabic ? 'font-noto text-right' : 'font-nt text-left'}`}>{t?.designStage || 'What\'s your design stage?'} *</label>
                      <select
                        name="designStage"
                        value={formData.designStage}
                        onChange={handleChange}
                        className={`w-full bg-white dark:bg-black border border-gray-300 dark:border-[#db2b2e]/20 p-3 text-gray-900 dark:text-white focus:outline-none focus:border-primary dark:focus:border-[#db2b2e] [&>option]:text-black dark:[&>option]:text-white [&>option]:bg-white dark:[&>option]:bg-black ${isArabic ? 'text-right font-noto' : 'text-left font-nt'}`}
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
                        className={`w-full bg-white dark:bg-black border border-gray-300 dark:border-[#db2b2e]/20 p-3 text-gray-900 dark:text-white focus:outline-none focus:border-primary dark:focus:border-[#db2b2e] [&>option]:text-black dark:[&>option]:text-white [&>option]:bg-white dark:[&>option]:bg-black ${isArabic ? 'text-right font-noto' : 'text-left font-nt'}`}
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
                <div className="space-y-6">
                  <div className={isArabic ? 'text-right' : 'text-left'}>
                    <h2 className={`text-2xl font-bold mb-2 text-gray-900 dark:text-white ${isArabic ? 'font-amiri' : 'font-nt'}`}>{t?.additionalDetails || 'Additional Details'}</h2>
                    <p className={`text-gray-600 dark:text-white/80 ${isArabic ? 'font-noto' : 'font-nt'}`}>{t?.additionalDetailsDescription || 'Tell us more about your project'}</p>
                  </div>

                  <div>
                    <label className={`block mb-1 text-gray-900 dark:text-white ${isArabic ? 'font-noto text-right' : 'font-nt text-left'}`}>{t?.projectDetailsField || 'Project Details'}</label>
                    <textarea
                      name="details"
                      value={formData.details}
                      onChange={handleChange}
                      rows="6"
                      className={`w-full bg-white dark:bg-black border border-gray-300 dark:border-[#db2b2e]/20 p-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/50 focus:outline-none focus:border-primary dark:focus:border-[#db2b2e] resize-none ${isArabic ? 'text-right font-noto' : 'text-left font-nt'}`}
                      placeholder={t?.projectDetailsPlaceholder || 'Please provide any additional details about your project...'}
                    ></textarea>
                  </div>

                  {errors.submit && (
                    <p className={`text-red-500 dark:text-[#db2b2e] text-sm ${isArabic ? 'text-right font-noto' : 'text-left font-nt'}`}>{errors.submit}</p>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className={`flex justify-between mt-8 ${isArabic ? 'flex-row-reverse' : ''}`}>
                {step > 1 && (
                                      <button
                      onClick={handleBack}
                      className={`px-6 py-2 border border-primary dark:border-[#db2b2e] text-gray-900 dark:text-white hover:bg-primary/10 dark:hover:bg-[#db2b2e]/10 transition-colors ${isArabic ? 'font-noto' : 'font-nt'}`}
                    >
                      {t?.back || 'Back'}
                    </button>
                )}
                <div className={isArabic ? 'mr-auto' : 'ml-auto'}>
                  {step < 4 ? (
                                          <button
                        onClick={handleNext}
                        className={`px-6 py-2 bg-primary dark:bg-[#db2b2e] text-white hover:bg-primary/90 dark:hover:bg-[#db2b2e]/90 transition-colors ${isArabic ? 'font-noto' : 'font-nt'}`}
                      >
                        {t?.next || 'Next'}
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        className={`px-6 py-2 bg-primary dark:bg-[#db2b2e] text-white hover:bg-primary/90 dark:hover:bg-[#db2b2e]/90 transition-colors ${isArabic ? 'font-noto' : 'font-nt'}`}
                      >
                        {t?.submitRequest || 'Submit Request'}
                      </button>
                  )}
                </div>
              </div>
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