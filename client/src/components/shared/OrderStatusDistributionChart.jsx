import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const OrderStatusDistributionChart = ({ data, loading = false }) => {
  const statusColors = {
    'placed': '#f59e0b',
    'out for delivery': '#3b82f6',
    'delivered': '#10b981',
    'cancelled': '#6b7280'
  };

  const statusLabels = {
    'placed': 'Placed',
    'out for delivery': 'Out for Delivery',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled'
  };

  const total = Object.values(data).reduce((sum, count) => sum + count, 0);

  const getPercentage = (count) => {
    return total > 0 ? ((count / total) * 100).toFixed(1) : 0;
  };

  const getBarWidth = (count) => {
    return total > 0 ? (count / total) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="bg-black border border-[#db2b2e]/20 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-5 h-5 border-t-2 border-[#db2b2e] rounded-full animate-spin"></div>
          <h3 className="text-gray-400 text-sm uppercase tracking-wider">Order Status Distribution</h3>
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
      <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-6">Order Status Distribution</h3>
      
      <div className="space-y-4">
        {Object.entries(data).map(([status, count]) => (
          <motion.div
            key={status}
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: statusColors[status] }}
                ></div>
                <span className="text-white text-sm">{statusLabels[status] || status}</span>
              </div>
              <div className="text-right">
                <span className="text-white font-semibold">{count}</span>
                <span className="text-gray-400 text-sm ml-2">({getPercentage(count)}%)</span>
              </div>
            </div>
            
            <div className="w-full bg-gray-800 rounded-full h-2">
              <motion.div
                className="h-2 rounded-full"
                style={{ backgroundColor: statusColors[status] }}
                initial={{ width: 0 }}
                animate={{ width: `${getBarWidth(count)}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
              ></motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      {total > 0 && (
        <div className="mt-6 pt-4 border-t border-[#db2b2e]/20">
          <div className="text-center">
            <span className="text-gray-400 text-sm">Total Orders: </span>
            <span className="text-white font-semibold">{total.toLocaleString()}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

OrderStatusDistributionChart.propTypes = {
  data: PropTypes.objectOf(PropTypes.number).isRequired,
  loading: PropTypes.bool,
};

export default OrderStatusDistributionChart; 