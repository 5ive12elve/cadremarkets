import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const StatisticsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendDirection, 
  loading = false,
  onClick,
  className = ""
}) => {
  const getTrendColor = () => {
    if (!trendDirection) return 'text-gray-400';
    return trendDirection === 'up' ? 'text-green-500' : 'text-red-500';
  };

  const getTrendIcon = () => {
    if (!trendDirection) return null;
    return trendDirection === 'up' ? '↗' : '↘';
  };

  return (
    <motion.div
      className={`bg-black border border-[#db2b2e]/20 p-6 hover:border-[#db2b2e]/40 transition-colors cursor-pointer ${className}`}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {Icon && <Icon className="w-5 h-5 text-[#db2b2e]" />}
            <h3 className="text-gray-400 text-sm uppercase tracking-wider">{title}</h3>
          </div>
          
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 border-t-2 border-[#db2b2e] rounded-full animate-spin"></div>
              <span className="text-gray-400">Loading...</span>
            </div>
          ) : (
            <>
              <div className="text-2xl font-bold text-white mb-1">{value}</div>
              {subtitle && (
                <div className="text-sm text-gray-400">{subtitle}</div>
              )}
              {trend && (
                <div className={`text-sm flex items-center gap-1 mt-2 ${getTrendColor()}`}>
                  <span>{getTrendIcon()}</span>
                  <span>{trend}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

StatisticsCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  subtitle: PropTypes.string,
  icon: PropTypes.elementType,
  trend: PropTypes.string,
  trendDirection: PropTypes.oneOf(['up', 'down']),
  loading: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default StatisticsCard; 