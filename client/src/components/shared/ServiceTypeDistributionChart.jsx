import { FiEye, FiMic, FiImage } from 'react-icons/fi';
import PropTypes from 'prop-types';

const ServiceTypeDistributionChart = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-black border border-[#db2b2e] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Cadre Services Portfolio</h3>
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

  const typeInfo = {
    visual: { 
      label: 'Visual Design & Branding', 
      icon: FiEye, 
      color: 'bg-[#db2b2e]',
      textColor: 'text-[#db2b2e]',
      bgColor: 'bg-[#db2b2e]/10',
      borderColor: 'border-[#db2b2e]/20'
    },
    ad: { 
      label: 'Advertisement Campaigns', 
      icon: FiImage, 
      color: 'bg-[#f3eb4b]',
      textColor: 'text-[#f3eb4b]',
      bgColor: 'bg-[#f3eb4b]/10',
      borderColor: 'border-[#f3eb4b]/20'
    },
    sound: { 
      label: 'Audio Production', 
      icon: FiMic, 
      color: 'bg-white/70',
      textColor: 'text-white/90',
      bgColor: 'bg-white/5',
      borderColor: 'border-white/10'
    }
  };

  const total = Object.values(data).reduce((sum, value) => sum + (value?.count || 0), 0);

  return (
    <div className="bg-black border border-[#db2b2e] rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Cadre Services Portfolio</h3>
      
      <div className="space-y-4">
        {Object.entries(data).map(([type, typeData]) => {
          const info = typeInfo[type];
          if (!info || !typeData?.count) return null;
          
          const IconComponent = info.icon;
          const percentage = total > 0 ? (typeData.count / total) * 100 : 0;

          return (
            <div key={type} className={`${info.bgColor} ${info.borderColor} border rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <IconComponent className={`w-5 h-5 ${info.textColor} mr-2`} />
                  <span className={`font-medium ${info.textColor}`}>{info.label}</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-white">{typeData.count}</span>
                  <span className="text-sm text-white/60 ml-1">({percentage.toFixed(1)}%)</span>
                </div>
              </div>
              
              <div className="w-full bg-white/20 rounded-full h-2 mb-3">
                <div 
                  className={`${info.color} h-2 rounded-full transition-all duration-500 ease-out`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>

              {/* Status breakdown for this service type */}
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="text-center">
                  <div className="text-[#f3eb4b] font-medium">{typeData.pending || 0}</div>
                  <div className="text-white/60">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-[#db2b2e] font-medium">{typeData.approved || 0}</div>
                  <div className="text-white/60">Approved</div>
                </div>
                <div className="text-center">
                  <div className="text-[#db2b2e] font-medium">{typeData.completed || 0}</div>
                  <div className="text-white/60">Delivered</div>
                </div>
                <div className="text-center">
                  <div className="text-white/50 font-medium">{typeData.rejected || 0}</div>
                  <div className="text-white/60">Declined</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {total === 0 && (
        <div className="text-center py-8 text-white/60">
          <FiImage className="w-12 h-12 mx-auto mb-2" />
          <p>No service portfolios available</p>
        </div>
      )}
    </div>
  );
};

ServiceTypeDistributionChart.propTypes = {
  data: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired
};

export default ServiceTypeDistributionChart; 