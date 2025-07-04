import { useState, useEffect } from 'react';
import { FiUsers, FiUserCheck, FiUserX, FiImage, FiShoppingBag, FiTrendingUp, FiActivity, FiHeart } from 'react-icons/fi';
import { motion } from 'framer-motion';
import StatisticsCard from './StatisticsCard';
import UserRoleDistributionChart from './UserRoleDistributionChart';
import UserEngagementChart from './UserEngagementChart';
import PropTypes from 'prop-types';

const UserStatistics = ({ refreshTrigger = 0 }) => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('30');

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/user/backoffice/statistics?timeframe=${timeframe}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch statistics: ${response.status}`);
      }
      
      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [timeframe, refreshTrigger]);

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
        <p className="text-red-400">Error loading user statistics: {error}</p>
        <button 
          onClick={fetchStatistics}
          className="mt-2 px-4 py-2 bg-[#db2b2e] text-white rounded hover:bg-[#db2b2e]/80 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const statisticsCards = [
    {
      title: 'Total Users',
      value: statistics?.overview?.totalUsers || 0,
      icon: FiUsers,
      color: '#db2b2e',
      trend: statistics?.trends?.userGrowth
    },
    {
      title: 'Active Users',
      value: statistics?.overview?.activeUsers || 0,
      icon: FiUserCheck,
      color: '#10b981',
      subtitle: `${(statistics?.overview?.activePercentage || 0).toFixed(1)}% of total`
    },
    {
      title: 'Artists',
      value: statistics?.overview?.artistCount || 0,
      icon: FiImage,
      color: '#f3eb4b',
      subtitle: `${(statistics?.overview?.artistPercentage || 0).toFixed(1)}% of users`
    },
    {
      title: 'Buyers',
      value: statistics?.overview?.buyerCount || 0,
      icon: FiShoppingBag,
      color: '#3b82f6',
      subtitle: `${(statistics?.performance?.conversionRate || 0).toFixed(1)}% conversion`
    },
    {
      title: 'Banned Users',
      value: statistics?.overview?.bannedUsers || 0,
      icon: FiUserX,
      color: '#ef4444'
    },
    {
      title: 'Weekly Active',
      value: statistics?.overview?.activeLastWeek || 0,
      icon: FiActivity,
      color: '#8b5cf6',
      subtitle: 'Last 7 days'
    },
    {
      title: 'Monthly Active',
      value: statistics?.overview?.activeLastMonth || 0,
      icon: FiTrendingUp,
      color: '#06b6d4',
      subtitle: 'Last 30 days'
    },
    {
      title: 'Engagement Rate',
      value: `${(statistics?.performance?.engagementRate || 0).toFixed(1)}%`,
      icon: FiHeart,
      color: '#f97316',
      subtitle: 'High + Medium engagement'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Timeframe Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">User Analytics</h2>
        <div className="flex gap-2">
          {['7', '30', '90'].map((days) => (
            <button
              key={days}
              onClick={() => setTimeframe(days)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                timeframe === days
                  ? 'bg-[#db2b2e] text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {days} days
            </button>
          ))}
        </div>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statisticsCards.map((card, index) => (
          <StatisticsCard
            key={card.title}
            {...card}
            loading={loading}
            delay={index * 0.1}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserRoleDistributionChart 
          data={statistics?.distributions?.role}
          loading={loading}
        />
        <UserEngagementChart 
          data={statistics?.distributions?.engagement}
          loading={loading}
        />
      </div>

      {/* Additional Metrics */}
      {statistics && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Marketplace Performance */}
          <div className="bg-black border border-[#db2b2e]/30 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Marketplace</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Listings</span>
                <span className="text-white font-semibold">
                  {statistics.marketplace?.totalListings || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Orders</span>
                <span className="text-white font-semibold">
                  {statistics.marketplace?.totalOrders || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Avg Listings/Artist</span>
                <span className="text-white font-semibold">
                  {statistics.marketplace?.averageListingsPerArtist || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Email Preferences */}
          <div className="bg-black border border-[#db2b2e]/30 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Email Preferences</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Marketing Emails</span>
                <span className="text-white font-semibold">
                  {statistics.activity?.emailPreferences?.marketing || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Notifications</span>
                <span className="text-white font-semibold">
                  {statistics.activity?.emailPreferences?.notifications || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Opt-in Rate</span>
                <span className="text-white font-semibold">
                  {statistics.overview?.totalUsers > 0 
                    ? ((statistics.activity?.emailPreferences?.marketing || 0) / statistics.overview.totalUsers * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-black border border-[#db2b2e]/30 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Artist Adoption</span>
                <span className="text-white font-semibold">
                  {(statistics.performance?.artistAdoptionRate || 0).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Buyer Conversion</span>
                <span className="text-white font-semibold">
                  {(statistics.performance?.conversionRate || 0).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">User Engagement</span>
                <span className="text-white font-semibold">
                  {(statistics.performance?.engagementRate || 0).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Artists Section */}
      {statistics?.marketplace?.topArtists?.length > 0 && !loading && (
        <div className="bg-black border border-[#db2b2e]/30 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Top Artists</h3>
          <div className="space-y-4">
            {statistics.marketplace.topArtists.map((artist, index) => (
              <div key={artist.userId} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#db2b2e]/20 flex items-center justify-center">
                    <span className="text-[#db2b2e] font-semibold text-sm">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{artist.user?.username || 'Unknown'}</p>
                    <p className="text-gray-400 text-sm">{artist.user?.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">{artist.total} listings</p>
                  <p className="text-gray-400 text-sm">
                    {artist.active} active • {artist.sold} sold
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

UserStatistics.propTypes = {
  refreshTrigger: PropTypes.number
};

export default UserStatistics; 