import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { FiPackage, FiCheckCircle, FiBox, FiTruck } from 'react-icons/fi';

const FulfillmentProgressChart = ({ data, loading = false }) => {
  const fulfillmentSteps = [
    {
      key: 'received',
      label: 'Items Received',
      icon: FiPackage,
      color: '#f59e0b'
    },
    {
      key: 'verified',
      label: 'Items Verified',
      icon: FiCheckCircle,
      color: '#3b82f6'
    },
    {
      key: 'packed',
      label: 'Items Packed',
      icon: FiBox,
      color: '#8b5cf6'
    },
    {
      key: 'readyForShipment',
      label: 'Ready for Shipment',
      icon: FiTruck,
      color: '#10b981'
    }
  ];

  if (loading) {
    return (
      <div className="bg-black border border-[#db2b2e]/20 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-5 h-5 border-t-2 border-[#db2b2e] rounded-full animate-spin"></div>
          <h3 className="text-gray-400 text-sm uppercase tracking-wider">Fulfillment Progress</h3>
        </div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-700 rounded mb-2"></div>
              <div className="h-2 bg-gray-800 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-black border border-[#db2b2e]/20 p-6 hover:border-[#db2b2e]/40 transition-colors"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-6">Fulfillment Progress</h3>
      
      <div className="space-y-4">
        {fulfillmentSteps.map((step, index) => {
          const percentage = data[step.key] || 0;
          const Icon = step.icon;
          
          return (
            <motion.div
              key={step.key}
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Icon 
                    className="w-4 h-4"
                    style={{ color: step.color }}
                  />
                  <span className="text-white text-sm">{step.label}</span>
                </div>
                <div className="text-right">
                  <span className="text-white font-semibold">{percentage.toFixed(1)}%</span>
                </div>
              </div>
              
              <div className="w-full bg-gray-800 rounded-full h-2">
                <motion.div
                  className="h-2 rounded-full"
                  style={{ backgroundColor: step.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                ></motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-[#db2b2e]/20">
        <div className="text-center">
          <span className="text-gray-400 text-sm">Overall Progress: </span>
          <span className="text-white font-semibold">
            {((data.received + data.verified + data.packed + data.readyForShipment) / 4).toFixed(1)}%
          </span>
        </div>
      </div>
    </motion.div>
  );
};

FulfillmentProgressChart.propTypes = {
  data: PropTypes.shape({
    received: PropTypes.number,
    verified: PropTypes.number,
    packed: PropTypes.number,
    readyForShipment: PropTypes.number,
  }).isRequired,
  loading: PropTypes.bool,
};

export default FulfillmentProgressChart; 