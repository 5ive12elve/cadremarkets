import { motion } from 'framer-motion';
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

export default function PrivacyPolicy() {
  const { isArabic, currentLang } = useLanguage();

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
      <div className="max-w-4xl mx-auto px-4 py-20">
        <motion.div variants={itemVariants} className="mb-16">
          <h1 className={`text-5xl mb-6 text-[#db2b2e] ${
            isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
          }`}>
            {useTranslation('privacyPolicy', 'title', currentLang)}
          </h1>
          <p className={`text-lg text-gray-600 dark:text-gray-300 ${
            isArabic ? 'font-noto' : 'font-nt'
          }`}>
            {useTranslation('privacyPolicy', 'lastUpdated', currentLang)}: {new Date().toLocaleDateString()}
          </p>
        </motion.div>

        <div className="space-y-8">
          <motion.section variants={itemVariants}>
            <h2 className={`text-2xl mb-4 text-[#db2b2e] ${
              isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
            }`}>
              1. {useTranslation('privacyPolicy', 'informationWeCollect', currentLang)}
            </h2>
            <div className={`space-y-4 text-gray-700 dark:text-gray-300 ${
              isArabic ? 'font-noto' : 'font-nt'
            }`}>
              <p>
                <strong>{useTranslation('privacyPolicy', 'personalInfo', currentLang)}:</strong> {useTranslation('privacyPolicy', 'personalInfoDescription', currentLang)}
              </p>
              <p>
                <strong>{useTranslation('privacyPolicy', 'listingInfo', currentLang)}:</strong> {useTranslation('privacyPolicy', 'listingInfoDescription', currentLang)}
              </p>
              <p>
                <strong>{useTranslation('privacyPolicy', 'transactionInfo', currentLang)}:</strong> {useTranslation('privacyPolicy', 'transactionInfoDescription', currentLang)}
              </p>
              <p>
                <strong>{useTranslation('privacyPolicy', 'usageInfo', currentLang)}:</strong> {useTranslation('privacyPolicy', 'usageInfoDescription', currentLang)}
              </p>
            </div>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className={`text-2xl mb-4 text-[#db2b2e] ${
              isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
            }`}>
              2. {useTranslation('privacyPolicy', 'howWeUseInfo', currentLang)}
            </h2>
            <div className={`space-y-4 text-gray-700 dark:text-gray-300 ${
              isArabic ? 'font-noto' : 'font-nt'
            }`}>
              <p>{useTranslation('privacyPolicy', 'weUseYourInformation', currentLang)}</p>
              <ul className={`list-disc list-inside space-y-2 ml-4 ${
                isArabic ? 'font-noto' : 'font-nt'
              }`}>
                <li>{useTranslation('privacyPolicy', 'provideAndMaintainPlatform', currentLang)}</li>
                <li>{useTranslation('privacyPolicy', 'processTransactions', currentLang)}</li>
                <li>{useTranslation('privacyPolicy', 'sendUpdates', currentLang)}</li>
                <li>{useTranslation('privacyPolicy', 'improvePlatform', currentLang)}</li>
                <li>{useTranslation('privacyPolicy', 'preventFraud', currentLang)}</li>
                <li>{useTranslation('privacyPolicy', 'complyWithLegalObligations', currentLang)}</li>
              </ul>
            </div>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className={`text-2xl mb-4 text-[#db2b2e] ${
              isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
            }`}>
              3. {useTranslation('privacyPolicy', 'informationSharing', currentLang)}
            </h2>
            <div className={`space-y-4 text-gray-700 dark:text-gray-300 ${
              isArabic ? 'font-noto' : 'font-nt'
            }`}>
              <p>
                <strong>{useTranslation('privacyPolicy', 'withOtherUsers', currentLang)}:</strong> {useTranslation('privacyPolicy', 'otherUsersDescription', currentLang)}
              </p>
              <p>
                <strong>{useTranslation('privacyPolicy', 'serviceProviders', currentLang)}:</strong> {useTranslation('privacyPolicy', 'serviceProvidersDescription', currentLang)}
              </p>
              <p>
                <strong>{useTranslation('privacyPolicy', 'legalRequirements', currentLang)}:</strong> {useTranslation('privacyPolicy', 'legalRequirementsDescription', currentLang)}
              </p>
              <p>
                <strong>{useTranslation('privacyPolicy', 'businessTransfers', currentLang)}:</strong> {useTranslation('privacyPolicy', 'businessTransfersDescription', currentLang)}
              </p>
            </div>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className={`text-2xl mb-4 text-[#db2b2e] ${
              isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
            }`}>
              4. {useTranslation('privacyPolicy', 'dataSecurity', currentLang)}
            </h2>
            <div className={`space-y-4 text-gray-700 dark:text-gray-300 ${
              isArabic ? 'font-noto' : 'font-nt'
            }`}>
              <p>
                {useTranslation('privacyPolicy', 'weImplementAppropriateMeasures', currentLang)}
              </p>
              <p>
                {useTranslation('privacyPolicy', 'noInternetTransmissionIsCompletelySecure', currentLang)}
              </p>
            </div>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className={`text-2xl mb-4 text-[#db2b2e] ${
              isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
            }`}>
              5. {useTranslation('privacyPolicy', 'yourRights', currentLang)}
            </h2>
            <div className={`space-y-4 text-gray-700 dark:text-gray-300 ${
              isArabic ? 'font-noto' : 'font-nt'
            }`}>
              <p>{useTranslation('privacyPolicy', 'youHaveTheRightTo', currentLang)}</p>
              <ul className={`list-disc list-inside space-y-2 ml-4 ${
                isArabic ? 'font-noto' : 'font-nt'
              }`}>
                <li>{useTranslation('privacyPolicy', 'accessAndUpdatePersonalInfo', currentLang)}</li>
                <li>{useTranslation('privacyPolicy', 'deleteAccount', currentLang)}</li>
                <li>{useTranslation('privacyPolicy', 'optOutMarketingCommunications', currentLang)}</li>
                <li>{useTranslation('privacyPolicy', 'requestDataPortability', currentLang)}</li>
                <li>{useTranslation('privacyPolicy', 'lodgeComplaints', currentLang)}</li>
              </ul>
            </div>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className={`text-2xl mb-4 text-[#db2b2e] ${
              isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
            }`}>
              6. {useTranslation('privacyPolicy', 'cookiesTracking', currentLang)}
            </h2>
            <div className={`space-y-4 text-gray-700 dark:text-gray-300 ${
              isArabic ? 'font-noto' : 'font-nt'
            }`}>
              <p>
                {useTranslation('privacyPolicy', 'cookiesDescription', currentLang)}
              </p>
            </div>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className={`text-2xl mb-4 text-[#db2b2e] ${
              isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
            }`}>
              7. {useTranslation('privacyPolicy', 'internationalTransfers', currentLang)}
            </h2>
            <div className={`space-y-4 text-gray-700 dark:text-gray-300 ${
              isArabic ? 'font-noto' : 'font-nt'
            }`}>
              <p>
                {useTranslation('privacyPolicy', 'internationalTransfersDescription', currentLang)}
              </p>
            </div>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className={`text-2xl mb-4 text-[#db2b2e] ${
              isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
            }`}>
              8. {useTranslation('privacyPolicy', 'contactUs', currentLang)}
            </h2>
            <div className={`space-y-4 text-gray-700 dark:text-gray-300 ${
              isArabic ? 'font-noto' : 'font-nt'
            }`}>
              <p>
                {useTranslation('privacyPolicy', 'contactDescription', currentLang)}
              </p>
              <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded border border-[#db2b2e]/20">
                <p><strong>{useTranslation('privacyPolicy', 'email', currentLang)}:</strong> {useTranslation('privacyPolicy', 'privacyEmailAddress', currentLang)}</p>
                <p><strong>{useTranslation('privacyPolicy', 'phone', currentLang)}:</strong> {useTranslation('privacyPolicy', 'privacyPhoneNumber', currentLang)}</p>
                <p><strong>{useTranslation('privacyPolicy', 'address', currentLang)}:</strong> {useTranslation('privacyPolicy', 'privacyAddress', currentLang)}</p>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </motion.div>
  );
} 