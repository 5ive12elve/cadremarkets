import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const PageHeader = ({ title, description, actions }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 sm:mb-8 border-b border-[#db2b2e] pb-4 sm:pb-6 max-w-full overflow-x-hidden"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black dark:text-white mb-2 transition-colors duration-300">{title}</h1>
          {description && (
            <p className="text-sm sm:text-base text-gray-600 dark:text-white/60 transition-colors duration-300">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </motion.div>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  actions: PropTypes.node
};

export default PageHeader; 