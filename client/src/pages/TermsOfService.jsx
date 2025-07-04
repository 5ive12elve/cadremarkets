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

export default function TermsOfService() {
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
            {useTranslation('termsOfService', 'title', currentLang)}
          </h1>
          <p className={`text-lg text-gray-600 dark:text-gray-300 ${
            isArabic ? 'font-noto' : 'font-nt'
          }`}>
            {useTranslation('termsOfService', 'lastUpdated', currentLang)}: {new Date().toLocaleDateString()}
          </p>
        </motion.div>

        <div className="space-y-8">
          <motion.section variants={itemVariants}>
            <h2 className={`text-2xl mb-4 text-[#db2b2e] ${
              isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
            }`}>
              1. {useTranslation('termsOfService', 'acceptanceOfTerms', currentLang)}
            </h2>
            <div className={`space-y-4 text-gray-700 dark:text-gray-300 ${
              isArabic ? 'font-noto' : 'font-nt'
            }`}>
              <p>
                {useTranslation('termsOfService', 'acceptanceContent', currentLang)}
              </p>
            </div>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className={`text-2xl mb-4 text-[#db2b2e] ${
              isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
            }`}>
              2. {useTranslation('termsOfService', 'platformDescription', currentLang)}
            </h2>
            <div className={`space-y-4 text-gray-700 dark:text-gray-300 ${
              isArabic ? 'font-noto' : 'font-nt'
            }`}>
              <p>
                {useTranslation('termsOfService', 'platformContent', currentLang)}
              </p>
            </div>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className={`text-2xl mb-4 text-[#db2b2e] ${
              isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
            }`}>
              3. {useTranslation('termsOfService', 'userAccounts', currentLang)}
            </h2>
            <div className={`space-y-4 text-gray-700 dark:text-gray-300 ${
              isArabic ? 'font-noto' : 'font-nt'
            }`}>
              <p><strong>{useTranslation('termsOfService', 'accountCreation', currentLang)}:</strong> {useTranslation('termsOfService', 'accountCreationContent', currentLang)}</p>
              <p><strong>{useTranslation('termsOfService', 'accountSecurity', currentLang)}:</strong> {useTranslation('termsOfService', 'accountSecurityContent', currentLang)}</p>
              <p><strong>{useTranslation('termsOfService', 'accountTermination', currentLang)}:</strong> {useTranslation('termsOfService', 'accountTerminationContent', currentLang)}</p>
            </div>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className={`text-2xl mb-4 text-[#db2b2e] ${
              isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
            }`}>
              4. {useTranslation('termsOfService', 'sellerResponsibilities', currentLang)}
            </h2>
            <div className={`space-y-4 text-gray-700 dark:text-gray-300 ${
              isArabic ? 'font-noto' : 'font-nt'
            }`}>
              <p>{useTranslation('termsOfService', 'sellerAgreement', currentLang)}</p>
              <ul className={`list-disc list-inside space-y-2 ml-4 ${
                isArabic ? 'font-noto' : 'font-nt'
              }`}>
                <li>{useTranslation('termsOfService', 'sellerProvideAccurate', currentLang)}</li>
                <li>{useTranslation('termsOfService', 'sellerHonorSales', currentLang)}</li>
                <li>{useTranslation('termsOfService', 'sellerRespondPromptly', currentLang)}</li>
                <li>{useTranslation('termsOfService', 'sellerComplyLaws', currentLang)}</li>
                <li>{useTranslation('termsOfService', 'sellerPayFees', currentLang)}</li>
              </ul>
            </div>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className={`text-2xl mb-4 text-[#db2b2e] ${
              isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
            }`}>
              5. {useTranslation('termsOfService', 'buyerResponsibilities', currentLang)}
            </h2>
            <div className={`space-y-4 text-gray-700 dark:text-gray-300 ${
              isArabic ? 'font-noto' : 'font-nt'
            }`}>
              <p>{useTranslation('termsOfService', 'buyerAgreement', currentLang)}</p>
              <ul className={`list-disc list-inside space-y-2 ml-4 ${
                isArabic ? 'font-noto' : 'font-nt'
              }`}>
                <li>{useTranslation('termsOfService', 'buyerPayPromptly', currentLang)}</li>
                <li>{useTranslation('termsOfService', 'buyerProvideShipping', currentLang)}</li>
                <li>{useTranslation('termsOfService', 'buyerCommunicateRespectfully', currentLang)}</li>
                <li>{useTranslation('termsOfService', 'buyerReportIssues', currentLang)}</li>
              </ul>
            </div>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className={`text-2xl mb-4 text-[#db2b2e] ${
              isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
            }`}>
              6. {useTranslation('termsOfService', 'feesPayments', currentLang)}
            </h2>
            <div className={`space-y-4 text-gray-700 dark:text-gray-300 ${
              isArabic ? 'font-noto' : 'font-nt'
            }`}>
              <p>
                <strong>{useTranslation('termsOfService', 'commission', currentLang)}:</strong> {useTranslation('termsOfService', 'commissionContent', currentLang)}
              </p>
              <p>
                <strong>{useTranslation('termsOfService', 'serviceFees', currentLang)}:</strong> {useTranslation('termsOfService', 'serviceFeesContent', currentLang)}
              </p>
              <p>
                <strong>{useTranslation('termsOfService', 'paymentProcessing', currentLang)}:</strong> {useTranslation('termsOfService', 'paymentProcessingContent', currentLang)}
              </p>
            </div>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className={`text-2xl mb-4 text-[#db2b2e] ${
              isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
            }`}>
              7. {useTranslation('termsOfService', 'prohibitedContent', currentLang)}
            </h2>
            <div className={`space-y-4 text-gray-700 dark:text-gray-300 ${
              isArabic ? 'font-noto' : 'font-nt'
            }`}>
              <p>{useTranslation('termsOfService', 'prohibitedIntro', currentLang)}</p>
              <ul className={`list-disc list-inside space-y-2 ml-4 ${
                isArabic ? 'font-noto' : 'font-nt'
              }`}>
                <li>{useTranslation('termsOfService', 'prohibitedCounterfeit', currentLang)}</li>
                <li>{useTranslation('termsOfService', 'prohibitedIllegal', currentLang)}</li>
                <li>{useTranslation('termsOfService', 'prohibitedHarassment', currentLang)}</li>
                <li>{useTranslation('termsOfService', 'prohibitedSpam', currentLang)}</li>
                <li>{useTranslation('termsOfService', 'prohibitedCircumventing', currentLang)}</li>
              </ul>
            </div>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className={`text-2xl mb-4 text-[#db2b2e] ${
              isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
            }`}>
              8. {useTranslation('termsOfService', 'intellectualProperty', currentLang)}
            </h2>
            <div className={`space-y-4 text-gray-700 dark:text-gray-300 ${
              isArabic ? 'font-noto' : 'font-nt'
            }`}>
              <p>
                {useTranslation('termsOfService', 'intellectualPropertyContent', currentLang)}
              </p>
            </div>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className={`text-2xl mb-4 text-[#db2b2e] ${
              isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
            }`}>
              9. {useTranslation('termsOfService', 'shippingReturns', currentLang)}
            </h2>
            <div className={`space-y-4 text-gray-700 dark:text-gray-300 ${
              isArabic ? 'font-noto' : 'font-nt'
            }`}>
              <p>
                <strong>{useTranslation('termsOfService', 'shipping', currentLang)}:</strong> {useTranslation('termsOfService', 'shippingContent', currentLang)}
              </p>
              <p>
                <strong>{useTranslation('termsOfService', 'returns', currentLang)}:</strong> {useTranslation('termsOfService', 'returnsContent', currentLang)}
              </p>
            </div>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className={`text-2xl mb-4 text-[#db2b2e] ${
              isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
            }`}>
              10. {useTranslation('termsOfService', 'limitationLiability', currentLang)}
            </h2>
            <div className={`space-y-4 text-gray-700 dark:text-gray-300 ${
              isArabic ? 'font-noto' : 'font-nt'
            }`}>
              <p>
                {useTranslation('termsOfService', 'limitationContent', currentLang)}
              </p>
            </div>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className={`text-2xl mb-4 text-[#db2b2e] ${
              isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
            }`}>
              11. {useTranslation('termsOfService', 'disputeResolution', currentLang)}
            </h2>
            <div className={`space-y-4 text-gray-700 dark:text-gray-300 ${
              isArabic ? 'font-noto' : 'font-nt'
            }`}>
              <p>
                {useTranslation('termsOfService', 'disputeContent', currentLang)}
              </p>
            </div>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className={`text-2xl mb-4 text-[#db2b2e] ${
              isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
            }`}>
              12. {useTranslation('termsOfService', 'changesToTerms', currentLang)}
            </h2>
            <div className={`space-y-4 text-gray-700 dark:text-gray-300 ${
              isArabic ? 'font-noto' : 'font-nt'
            }`}>
              <p>
                {useTranslation('termsOfService', 'changesContent', currentLang)}
              </p>
            </div>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className={`text-2xl mb-4 text-[#db2b2e] ${
              isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
            }`}>
              13. {useTranslation('termsOfService', 'contactInfo', currentLang)}
            </h2>
            <div className={`space-y-4 text-gray-700 dark:text-gray-300 ${
              isArabic ? 'font-noto' : 'font-nt'
            }`}>
              <p>
                {useTranslation('termsOfService', 'contactDescription', currentLang)}
              </p>
              <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded border border-[#db2b2e]/20">
                <p><strong>{useTranslation('termsOfService', 'email', currentLang)}:</strong> {useTranslation('termsOfService', 'legalEmailAddress', currentLang)}</p>
                <p><strong>{useTranslation('termsOfService', 'phone', currentLang)}:</strong> {useTranslation('termsOfService', 'legalPhoneNumber', currentLang)}</p>
                <p><strong>{useTranslation('termsOfService', 'address', currentLang)}:</strong> {useTranslation('termsOfService', 'legalAddress', currentLang)}</p>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </motion.div>
  );
} 