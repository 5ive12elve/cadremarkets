import { FiZap, FiActivity, FiMinus } from 'react-icons/fi';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const UserEngagementChart = ({ data, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-black border border-[#db2b2e]/30 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4">User Engagement</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-700 rounded mb-2"></div>
              <div className="h-6 bg-gray-800 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const engagementLevels = [
    {
      level: 'high',
      label: 'High Engagement',
      description: 'Active with listings',
      color: '#db2b2e',
      Icon: FiZap,
      count: data?.high || 0
    },
    {
      level: 'medium',
      label: 'Medium Engagement',
      description: 'Partially active',
      color: '#f3eb4b',
      Icon: FiActivity,
      count: data?.medium || 0
    },
    {
      level: 'low',
      label: 'Low Engagement',
      description: 'Minimal activity',
      color: '#6b7280',
      Icon: FiMinus,
      count: data?.low || 0
    }
  ];

  const total = engagementLevels.reduce((sum, level) => sum + level.count, 0);

  if (total === 0) {
    return (
      <div className="bg-black border border-[#db2b2e]/30 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4">User Engagement</h3>
        <div className="text-center py-8">
          <p className="text-gray-400">No engagement data available</p>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...engagementLevels.map(l => l.count));

  return (
    <div className="bg-black border border-[#db2b2e]/30 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-4">User Engagement</h3>
      
      <div className="space-y-4">
        {engagementLevels.map(({ level, label, description, color, Icon, count }, index) => {
          const percentage = total > 0 ? (count / total) * 100 : 0;
          
          return (
            <motion.div
              key={level}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <div>
                    <span className="text-white font-medium block">{label}</span>
                    <span className="text-gray-400 text-xs">{description}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-white font-semibold">{count}</span>
                  <span className="text-gray-400 text-sm ml-2">
                    ({percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
              
              <div className="relative">
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${maxCount > 0 ? (count / maxCount) * 100 : 0}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                    className="h-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-800">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Total Users</span>
            <span className="text-white font-semibold">{total}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Engagement Rate</span>
            <span className="text-white font-semibold">
              {total > 0 ? (((data?.high || 0) + (data?.medium || 0)) / total * 100).toFixed(1) : 0}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

UserEngagementChart.propTypes = {
  data: PropTypes.object,
  loading: PropTypes.bool
};

export default UserEngagementChart; 