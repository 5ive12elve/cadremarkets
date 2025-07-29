import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const Card = ({ children, className = '', onClick, hover = true }) => {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.01 } : {}}
      className={`bg-black border border-[#db2b2e] p-3 sm:p-4 md:p-6 max-w-full overflow-x-hidden ${
        hover ? 'hover:bg-[#db2b2e]/10 transition-colors' : ''
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  onClick: PropTypes.func,
  hover: PropTypes.bool
};

export default Card; 