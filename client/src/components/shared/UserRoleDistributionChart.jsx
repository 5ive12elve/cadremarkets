import { FiUser, FiShield, FiStar } from 'react-icons/fi';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const UserRoleDistributionChart = ({ data, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-black border border-[#db2b2e]/30 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4">Role Distribution</h3>
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

  const roleColors = {
    user: '#6b7280',
    admin: '#8b5cf6',
    moderator: '#3b82f6',
    artist: '#db2b2e'
  };

  const roleIcons = {
    user: FiUser,
    admin: FiShield,
    moderator: FiStar,
    artist: FiUser
  };

  const total = Object.values(data || {}).reduce((sum, count) => sum + count, 0);

  if (total === 0) {
    return (
      <div className="bg-black border border-[#db2b2e]/30 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4">Role Distribution</h3>
        <div className="text-center py-8">
          <p className="text-gray-400">No user data available</p>
        </div>
      </div>
    );
  }

  const roles = Object.entries(data || {})
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([role, count]) => ({
      role,
      count,
      percentage: (count / total) * 100,
      color: roleColors[role] || '#6b7280',
      Icon: roleIcons[role] || FiUser
    }));

  const maxCount = Math.max(...roles.map(r => r.count));

  return (
    <div className="bg-black border border-[#db2b2e]/30 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-4">Role Distribution</h3>
      
      <div className="space-y-4">
        {roles.map(({ role, count, percentage, color, Icon }, index) => (
          <motion.div
            key={role}
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
                <span className="text-white font-medium capitalize">
                  {role === 'artist' ? 'Artist' : role}
                </span>
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
                  animate={{ width: `${(count / maxCount) * 100}%` }}
                  transition={{ duration: 1, delay: index * 0.2 }}
                  className="h-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-800">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Total Users</span>
          <span className="text-white font-semibold">{total}</span>
        </div>
      </div>
    </div>
  );
};

UserRoleDistributionChart.propTypes = {
  data: PropTypes.object,
  loading: PropTypes.bool
};

export default UserRoleDistributionChart; 