import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import MovingParticles from '../MovingParticles';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
    },
  },
};

const textVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

function Quote({ text, author, image }) {
  const { isArabic } = useLanguage();
  
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ margin: "-50px" }}
      variants={containerVariants}
      className={`bg-white dark:bg-black transition-colors duration-300 py-6 md:py-12 relative overflow-hidden`}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <MovingParticles count={8} />
      <div className="max-w-7xl mx-auto px-4">
        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[400px]`}>
          {/* Text Section */}
          <motion.div 
            variants={textVariants}
            className={`${isArabic ? 'lg:col-span-7 lg:order-2' : 'lg:col-span-7 lg:order-1'} space-y-6`}
          >
            <motion.blockquote 
              variants={textVariants}
              className={`${isArabic ? 'text-[24px] md:text-[36px] lg:text-[42px] leading-[1.3] font-amiri' : 'text-[28px] md:text-[40px] lg:text-[48px] leading-[1.2] font-nt'} font-light text-gray-900 dark:text-gray-100 transition-colors duration-300 ${isArabic ? 'text-right' : 'text-left'}`}
              dangerouslySetInnerHTML={{ __html: text }} 
            />
            <motion.div 
              variants={textVariants}
              className={`flex items-center gap-4 ${isArabic ? 'justify-end' : 'justify-start'}`}
            >
              <div className="w-12 h-0.5 bg-primary"></div>
              <cite className={`text-primary text-lg md:text-xl font-medium not-italic ${isArabic ? 'font-amiri' : 'font-nt'}`}>
                {author}
              </cite>
            </motion.div>
          </motion.div>
          
          {/* Image Section */}
          <motion.div 
            variants={imageVariants}
            className={`${isArabic ? 'lg:col-span-5 lg:order-1' : 'lg:col-span-5 lg:order-2'} relative`}
          >
            <div className="relative overflow-hidden rounded-lg shadow-xl">
              <motion.img
                src={image}
                alt={author}
                className="w-full h-[300px] md:h-[350px] lg:h-[400px] object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -left-4 w-8 h-8 border-l-2 border-t-2 border-primary opacity-60"></div>
            <div className="absolute -bottom-4 -right-4 w-8 h-8 border-r-2 border-b-2 border-primary opacity-60"></div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

Quote.propTypes = {
  text: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
};

export default Quote; 