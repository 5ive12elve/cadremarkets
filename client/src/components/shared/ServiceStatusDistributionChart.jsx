import { FiClock, FiCheckCircle, FiXCircle, FiCheck } from 'react-icons/fi';
import PropTypes from 'prop-types';

const ServiceStatusDistributionChart = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-black border border-[#db2b2e] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Service Status Distribution</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-[#db2b2e]/20 rounded mb-2"></div>
              <div className="h-6 bg-[#db2b2e]/10 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statusInfo = {
    pending: { 
      label: 'Pending Review', 
      icon: FiClock, 
      color: 'bg-[#f3eb4b]',
      textColor: 'text-[#f3eb4b]',
      bgColor: 'bg-[#f3eb4b]/10',
      borderColor: 'border-[#f3eb4b]/20'
    },
    approved: { 
      label: 'Approved for Production', 
      icon: FiCheck, 
      color: 'bg-[#db2b2e]',
      textColor: 'text-[#db2b2e]',
      bgColor: 'bg-[#db2b2e]/10',
      borderColor: 'border-[#db2b2e]/20'
    },
    completed: { 
      label: 'Delivered to Client', 
      icon: FiCheckCircle, 
      color: 'bg-[#db2b2e]',
      textColor: 'text-[#db2b2e]',
      bgColor: 'bg-[#db2b2e]/10',
      borderColor: 'border-[#db2b2e]/20'
    },
    rejected: { 
      label: 'Declined', 
      icon: FiXCircle, 
      color: 'bg-white/50',
      textColor: 'text-white/70',
      bgColor: 'bg-white/5',
      borderColor: 'border-white/10'
    }
  };

  const total = Object.values(data).reduce((sum, value) => sum + value, 0);

  return (
    <div className="bg-black border border-[#db2b2e] rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Service Status Distribution</h3>
      
      <div className="space-y-4">
        {Object.entries(data).map(([status, count]) => {
          const info = statusInfo[status];
          if (!info || count === 0) return null;
          
          const IconComponent = info.icon;
          const percentage = total > 0 ? (count / total) * 100 : 0;

          return (
            <div key={status} className={`${info.bgColor} ${info.borderColor} border rounded-lg p-4`}>
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
          <FiClock className="w-12 h-12 mx-auto mb-2" />
          <p>No service requests available</p>
        </div>
      )}
    </div>
  );
};

ServiceStatusDistributionChart.propTypes = {
  data: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired
};

export default ServiceStatusDistributionChart; 