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

export default function ReturnPolicy() {
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
            {useTranslation('returnPolicy', 'title', currentLang)}
          </h1>
          <p className={`text-lg text-gray-600 dark:text-gray-300 ${
            isArabic ? 'font-noto' : 'font-nt'
          }`}>
            {useTranslation('returnPolicy', 'lastUpdated', currentLang)}: {new Date().toLocaleDateString()}
          </p>
        </motion.div>

        <div className="space-y-8">
          <motion.section variants={itemVariants}>
            <h2 className={`text-2xl mb-4 text-[#db2b2e] ${
              isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
            }`}>
              1. {useTranslation('returnPolicy', 'returnWindow', currentLang)}
            </h2>
            <div className={`space-y-4 text-gray-700 dark:text-gray-300 ${
              isArabic ? 'font-noto' : 'font-nt'
            }`}>
              <p>
                {useTranslation('returnPolicy', 'returnWindowContent', currentLang)}
              </p>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded">
                <p className={`text-yellow-800 dark:text-yellow-200 ${
                  isArabic ? 'font-noto' : 'font-nt'
                }`}>
                  {useTranslation('returnPolicy', 'customArtworkWarning', currentLang)}
                </p>
              </div>
            </div>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className={`text-2xl mb-4 text-[#db2b2e] ${
              isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
            }`}>
              2. {useTranslation('returnPolicy', 'eligibleItems', currentLang)}
            </h2>
            <div className={`space-y-4 text-gray-700 dark:text-gray-300 ${
              isArabic ? 'font-noto' : 'font-nt'
            }`}>
              <p><strong>{useTranslation('returnPolicy', 'itemsCanReturn', currentLang)}</strong></p>
              <ul className={`list-disc list-inside space-y-2 ml-4 ${
                isArabic ? 'font-noto' : 'font-nt'
              }`}>
                <li>{useTranslation('returnPolicy', 'originalArtwork', currentLang)}</li>
                <li>{useTranslation('returnPolicy', 'printsReproductions', currentLang)}</li>
                <li>{useTranslation('returnPolicy', 'sculptures3D', currentLang)}</li>
                <li>{useTranslation('returnPolicy', 'artSupplies', currentLang)}</li>
                <li>{useTranslation('returnPolicy', 'booksPublications', currentLang)}</li>
              </ul>
              
              <p className="mt-6"><strong>{useTranslation('returnPolicy', 'itemsCannotReturn', currentLang)}</strong></p>
              <ul className={`list-disc list-inside space-y-2 ml-4 ${
                isArabic ? 'font-noto' : 'font-nt'
              }`}>
                <li>{useTranslation('returnPolicy', 'customCommissioned', currentLang)}</li>
                <li>{useTranslation('returnPolicy', 'digitalDownloads', currentLang)}</li>
                <li>{useTranslation('returnPolicy', 'personalizedItems', currentLang)}</li>
                <li>{useTranslation('returnPolicy', 'damagedByBuyer', currentLang)}</li>
                <li>{useTranslation('returnPolicy', 'usedAltered', currentLang)}</li>
              </ul>
            </div>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className={`text-2xl mb-4 text-[#db2b2e] ${
              isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
            }`}>
              3. {useTranslation('returnPolicy', 'returnConditions', currentLang)}
            </h2>
            <div className={`space-y-4 text-gray-700 dark:text-gray-300 ${
              isArabic ? 'font-noto' : 'font-nt'
            }`}>
              <p>{useTranslation('returnPolicy', 'returnConditionsIntro', currentLang)}</p>
              <ul className={`list-disc list-inside space-y-2 ml-4 ${
                isArabic ? 'font-noto' : 'font-nt'
              }`}>
                <li>{useTranslation('returnPolicy', 'originalCondition', currentLang)}</li>
                <li>{useTranslation('returnPolicy', 'originalPackaging', currentLang)}</li>
                <li>{useTranslation('returnPolicy', 'proofOfPurchase', currentLang)}</li>
                <li>{useTranslation('returnPolicy', 'noWearSigns', currentLang)}</li>
              </ul>
            </div>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className={`text-2xl mb-4 text-[#db2b2e] ${
              isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
            }`}>
              4. {useTranslation('returnPolicy', 'returnProcess', currentLang)}
            </h2>
            <div className={`space-y-4 text-gray-700 dark:text-gray-300 ${
              isArabic ? 'font-noto' : 'font-nt'
            }`}>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded border border-[#db2b2e]/20">
                  <h3 className={`text-lg mb-3 text-[#db2b2e] ${
                    isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
                  }`}>
                    {useTranslation('returnPolicy', 'stepRequest', currentLang)}
                  </h3>
                  <p className={isArabic ? 'font-noto' : 'font-nt'}>
                    {useTranslation('returnPolicy', 'step1Content', currentLang)}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded border border-[#db2b2e]/20">
                  <h3 className={`text-lg mb-3 text-[#db2b2e] ${
                    isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
                  }`}>
                    {useTranslation('returnPolicy', 'stepApproval', currentLang)}
                  </h3>
                  <p className={isArabic ? 'font-noto' : 'font-nt'}>
                    {useTranslation('returnPolicy', 'step2Content', currentLang)}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded border border-[#db2b2e]/20">
                  <h3 className={`text-lg mb-3 text-[#db2b2e] ${
                    isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
                  }`}>
                    {useTranslation('returnPolicy', 'stepShip', currentLang)}
                  </h3>
                  <p className={isArabic ? 'font-noto' : 'font-nt'}>
                    {useTranslation('returnPolicy', 'step3Content', currentLang)}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded border border-[#db2b2e]/20">
                  <h3 className={`text-lg mb-3 text-[#db2b2e] ${
                    isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
                  }`}>
                    {useTranslation('returnPolicy', 'stepRefund', currentLang)}
                  </h3>
                  <p className={isArabic ? 'font-noto' : 'font-nt'}>
                    {useTranslation('returnPolicy', 'step4Content', currentLang)}
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className={`text-2xl mb-4 text-[#db2b2e] ${
              isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
            }`}>
              5. {useTranslation('returnPolicy', 'shippingCosts', currentLang)}
            </h2>
            <div className={`space-y-4 text-gray-700 dark:text-gray-300 ${
              isArabic ? 'font-noto' : 'font-nt'
            }`}>
              <p><strong>{useTranslation('returnPolicy', 'returnShipping', currentLang)}:</strong></p>
              <ul className={`list-disc list-inside space-y-2 ml-4 ${
                isArabic ? 'font-noto' : 'font-nt'
              }`}>
                <li>{useTranslation('returnPolicy', 'buyerPaysReturn', currentLang)}</li>
                <li>{useTranslation('returnPolicy', 'trackableShipping', currentLang)}</li>
                <li>{useTranslation('returnPolicy', 'insuranceRecommended', currentLang)}</li>
              </ul>
              
              <p><strong>{useTranslation('returnPolicy', 'originalShipping', currentLang)}:</strong></p>
              <ul className={`list-disc list-inside space-y-2 ml-4 ${
                isArabic ? 'font-noto' : 'font-nt'
              }`}>
                <li>{useTranslation('returnPolicy', 'originalNonRefundable', currentLang)}</li>
                <li>{useTranslation('returnPolicy', 'freeShippingDeduction', currentLang)}</li>
              </ul>
            </div>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className={`text-2xl mb-4 text-[#db2b2e] ${
              isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
            }`}>
              6. {useTranslation('returnPolicy', 'refundProcessing', currentLang)}
            </h2>
            <div className={`space-y-4 text-gray-700 dark:text-gray-300 ${
              isArabic ? 'font-noto' : 'font-nt'
            }`}>
              <p><strong>{useTranslation('returnPolicy', 'refundTimeline', currentLang)}:</strong></p>
              <ul className={`list-disc list-inside space-y-2 ml-4 ${
                isArabic ? 'font-noto' : 'font-nt'
              }`}>
                <li>{useTranslation('returnPolicy', 'inspectionTime', currentLang)}</li>
                <li>{useTranslation('returnPolicy', 'processingTime', currentLang)}</li>
                <li>{useTranslation('returnPolicy', 'bankProcessingTime', currentLang)}</li>
              </ul>
              
              <p><strong>{useTranslation('returnPolicy', 'refundMethod', currentLang)}:</strong></p>
              <p>{useTranslation('returnPolicy', 'refundMethodContent', currentLang)}</p>
            </div>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className={`text-2xl mb-4 text-[#db2b2e] ${
              isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
            }`}>
              7. {useTranslation('returnPolicy', 'damagedDefective', currentLang)}
            </h2>
            <div className={`space-y-4 text-gray-700 dark:text-gray-300 ${
              isArabic ? 'font-noto' : 'font-nt'
            }`}>
              <p>{useTranslation('returnPolicy', 'damagedDefectiveIntro', currentLang)}</p>
              <ul className={`list-disc list-inside space-y-2 ml-4 ${
                isArabic ? 'font-noto' : 'font-nt'
              }`}>
                <li>{useTranslation('returnPolicy', 'contactImmediately', currentLang)}</li>
                <li>{useTranslation('returnPolicy', 'doNotRepair', currentLang)}</li>
                <li>{useTranslation('returnPolicy', 'keepPackaging', currentLang)}</li>
                <li>{useTranslation('returnPolicy', 'prepaidLabel', currentLang)}</li>
                <li>{useTranslation('returnPolicy', 'fullRefundReplacement', currentLang)}</li>
              </ul>
            </div>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className={`text-2xl mb-4 text-[#db2b2e] ${
              isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
            }`}>
              8. {useTranslation('returnPolicy', 'exchanges', currentLang)}
            </h2>
            <div className={`space-y-4 text-gray-700 dark:text-gray-300 ${
              isArabic ? 'font-noto' : 'font-nt'
            }`}>
              <p>
                {useTranslation('returnPolicy', 'exchangesContent', currentLang)}
              </p>
            </div>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className={`text-2xl mb-4 text-[#db2b2e] ${
              isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
            }`}>
              9. {useTranslation('returnPolicy', 'internationalReturns', currentLang)}
            </h2>
            <div className={`space-y-4 text-gray-700 dark:text-gray-300 ${
              isArabic ? 'font-noto' : 'font-nt'
            }`}>
              <p>
                {useTranslation('returnPolicy', 'internationalContent', currentLang)}
              </p>
            </div>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className={`text-2xl mb-4 text-[#db2b2e] ${
              isArabic ? 'font-amiri font-bold' : 'font-nt-bold'
            }`}>
              10. {useTranslation('returnPolicy', 'contactUs', currentLang)}
            </h2>
            <div className={`space-y-4 text-gray-700 dark:text-gray-300 ${
              isArabic ? 'font-noto' : 'font-nt'
            }`}>
              <p>
                {useTranslation('returnPolicy', 'contactDescription', currentLang)}
              </p>
              <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded border border-[#db2b2e]/20">
                <p><strong>{useTranslation('returnPolicy', 'email', currentLang)}:</strong> {useTranslation('returnPolicy', 'returnsEmailAddress', currentLang)}</p>
                <p><strong>{useTranslation('returnPolicy', 'phone', currentLang)}:</strong> {useTranslation('returnPolicy', 'returnsPhoneNumber', currentLang)}</p>
                <p><strong>{useTranslation('returnPolicy', 'hours', currentLang)}:</strong> {useTranslation('returnPolicy', 'businessHours', currentLang)}</p>
                <p><strong>{useTranslation('returnPolicy', 'address', currentLang)}:</strong> {useTranslation('returnPolicy', 'returnsAddress', currentLang)}</p>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </motion.div>
  );
} 