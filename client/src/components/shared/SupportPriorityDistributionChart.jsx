import { FiChevronDown, FiMinus, FiAlertTriangle } from 'react-icons/fi';
import PropTypes from 'prop-types';

const SupportPriorityDistributionChart = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-black border border-[#db2b2e]/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Priority Distribution</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-[#db2b2e]/20 rounded mb-2"></div>
              <div className="h-6 bg-[#db2b2e]/10 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const priorityInfo = {
    low: { 
      label: 'Low Priority', 
      icon: FiChevronDown, 
      color: 'bg-gray-400',
      textColor: 'text-gray-400',
      bgColor: 'bg-gray-400/10',
      borderColor: 'border-gray-400/20'
    },
    normal: { 
      label: 'Standard Priority', 
      icon: FiMinus, 
      color: 'bg-white/70',
      textColor: 'text-white',
      bgColor: 'bg-white/5',
      borderColor: 'border-white/10'
    },
    high: { 
      label: 'High Priority', 
      icon: FiAlertTriangle, 
      color: 'bg-[#db2b2e]',
      textColor: 'text-[#db2b2e]',
      bgColor: 'bg-[#db2b2e]/10',
      borderColor: 'border-[#db2b2e]/20'
    }
  };

  const total = Object.values(data).reduce((sum, value) => sum + value, 0);

  // Sort priorities by urgency level
  const sortedPriorities = ['high', 'normal', 'low'];

  return (
    <div className="bg-black border border-[#db2b2e]/30 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Priority Distribution</h3>
      
      <div className="space-y-4">
        {sortedPriorities.map((priority) => {
          const count = data[priority] || 0;
          const info = priorityInfo[priority];
          if (!info) return null;
          
          const IconComponent = info.icon;
          const percentage = total > 0 ? (count / total) * 100 : 0;

          return (
            <div key={priority} className={`${info.bgColor} ${info.borderColor} border rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <IconComponent className={`w-5 h-5 ${info.textColor} mr-2`} />
                  <span className={`font-medium ${info.textColor}`}>{info.label}</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-white">{count}</span>
                  <span className="text-sm text-white/60 ml-1">({percentage.toFixed(1)}%)</span>
                </div>
              </div>
              
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className={`${info.color} h-2 rounded-full transition-all duration-500 ease-out`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {total === 0 && (
        <div className="text-center py-8 text-white/60">
          <FiMinus className="w-12 h-12 mx-auto mb-2" />
          <p>No priority data available</p>
        </div>
      )}
    </div>
  );
};

SupportPriorityDistributionChart.propTypes = {
  data: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired
};

export default SupportPriorityDistributionChart; 