import { motion } from 'framer-motion';
import ContactForm from '../../components/ContactForm';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslation } from '../../locales/translations';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
    },
  },
};

export default function Contact() {
  const { currentLang, isArabic } = useLanguage();
  
  return (
    <motion.section 
      className={`relative bg-white dark:bg-black text-black dark:text-white ${isArabic ? 'font-noto' : 'font-nt'} py-8 md:py-12 transition-colors duration-300 overflow-hidden`}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {/* Subtle background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute ${isArabic ? 'left-8' : 'right-8'} top-1/2 transform -translate-y-1/2`}>
          <img 
            src="/mediassets/Filter06.png" 
            alt="" 
            className="w-32 h-32 md:w-48 md:h-48 object-contain opacity-[0.03] dark:opacity-[0.05] select-none"
          />
        </div>
      </div>
      
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-4">
        <div className="border-t border-primary pt-6 md:pt-8 relative">
          <div className={`flex flex-col ${isArabic ? 'md:flex-row' : 'md:flex-row'} justify-between items-start mb-6 md:mb-8 gap-8`}>
            <div className={`flex-1 ${isArabic ? 'order-1' : 'order-1'}`}>
              <h2 className={`text-[32px] sm:text-[40px] md:text-[48px] lg:text-[72px] font-bold leading-none mb-6 text-[#db2b2e] dark:text-white transition-colors duration-300 ${isArabic ? 'font-amiri' : 'font-nt-bold'}`}>
                {useTranslation('home', 'contactUs', currentLang)} <span className="text-[#f3eb4b]">{useTranslation('home', 'contactUsText', currentLang)}</span>
              </h2>
              <p className={`text-base sm:text-lg md:text-xl text-[#db2b2e] dark:text-gray-300 max-w-xl transition-colors duration-300 ${isArabic ? 'font-noto text-right' : 'font-nt text-left'}`}>
                {useTranslation('home', 'contactDescription', currentLang)}
              </p>
              <div className={`flex gap-6 text-primary text-base sm:text-lg md:text-xl underline mt-8 ${isArabic ? 'font-noto justify-start' : 'font-nt justify-start'}`}>
                  <motion.a 
                    href="https://www.facebook.com/cadremarkets" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-[#f3eb4b] transition-colors"
                    aria-label="Visit our Facebook page"
                    whileHover={{ scale: 1.05 }}
                  >
                    {useTranslation('home', 'facebook', currentLang)}
                  </motion.a>
                  <motion.a 
                    href="https://www.instagram.com/cadremarkets?utm_source=ig_web_button_share_sheet&amp;igsh=ZDNlZDc0MzIxNw==" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-[#f3eb4b] transition-colors"
                    aria-label="Visit our Instagram page"
                    whileHover={{ scale: 1.05 }}
                  >
                    {useTranslation('home', 'instagram', currentLang)}
                  </motion.a>
                  <motion.a 
                    href="https://www.linkedin.com/company/cadremarkets/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-[#f3eb4b] transition-colors"
                    aria-label="Visit our LinkedIn page"
                    whileHover={{ scale: 1.05 }}
                  >
                    {useTranslation('home', 'linkedin', currentLang)}
                  </motion.a>
                </div>
                
                {/* Contact Image */}
                <motion.div 
                  className={`mt-8 ${isArabic ? 'flex justify-start' : 'flex justify-start'}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  <img 
                    src="/mediassets/CADT04.png" 
                    alt="Cadre Contact" 
                    className="max-w-xs sm:max-w-sm md:max-w-md w-full h-auto object-contain"
                  />
                </motion.div>
            </div>

            <div className={`flex-1 w-full ${isArabic ? 'order-2' : 'order-2'}`}>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
} 