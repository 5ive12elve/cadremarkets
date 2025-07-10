import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { backofficeApiRequest, isBackofficeAuthenticated } from '../../backUtils/cadreBackAuth';
import { 
  FiDollarSign, 
  FiTrendingUp, 
  FiActivity, 
  FiPackage,
  FiShoppingBag,
  FiSettings
} from 'react-icons/fi';
import StatisticsCard from './StatisticsCard';
import StatusDistributionChart from './StatusDistributionChart';
import PropTypes from 'prop-types';

const ListingStatistics = ({ refreshTrigger = 0 }) => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState(30);

  useEffect(() => {
    fetchStatistics();
  }, [timeframe, refreshTrigger]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      
      // Check if we're in backoffice context and use appropriate API call
      let response;
      if (isBackofficeAuthenticated()) {
        response = await backofficeApiRequest(`/listing/backoffice/statistics?timeframe=${timeframe}`);
      } else {
        response = await fetch(`/api/listing/backoffice/statistics?timeframe=${timeframe}`);
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }
      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatTrend = (trendData) => {
    if (!trendData || trendData.direction === 'neutral') return null;
    const sign = trendData.direction === 'up' ? '+' : '';
    return `${sign}${trendData.value.toFixed(1)}% (${trendData.period})`;
  };

  if (loading && !statistics) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-end mb-6">
          <div className="w-6 h-6 border-t-2 border-[#db2b2e] rounded-full animate-spin"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[...Array(4)].map((_, i) => (
            <StatisticsCard
              key={i}
              title="Loading..."
              value=""
              loading={true}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="mb-8 text-center text-gray-400">
        <p>Failed to load statistics. Please try again.</p>
      </div>
    );
  }

  const { overview, trends, distributions } = statistics;

  return (
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header with Timeframe Selector */}
      <div className="flex items-center justify-end mb-6">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">Timeframe:</span>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(parseInt(e.target.value))}
            className="bg-black border border-[#db2b2e]/20 text-white px-3 py-1 text-sm focus:outline-none focus:border-[#db2b2e]"
            disabled={loading}
          >
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
            <option value={365}>1 year</option>
          </select>
        </div>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatisticsCard
          title="Total Listings"
          value={formatNumber(overview.totalListings)}
          subtitle="Active & Inactive"
          icon={FiPackage}
          trend={formatTrend(trends.listingGrowth)}
          trendDirection={trends.listingGrowth?.direction}
          loading={loading}
        />
        
        <StatisticsCard
          title="Total Marketplace Value"
          value={formatCurrency(overview.totalValue)}
          subtitle={`Avg: ${formatCurrency(overview.averagePrice)}`}
          icon={FiDollarSign}
          trend={formatTrend(trends.valueGrowth)}
          trendDirection={trends.valueGrowth?.direction}
          loading={loading}
        />
        
        <StatisticsCard
          title="Cadre Revenue Potential"
          value={formatCurrency(overview.totalCadreRevenue)}
          subtitle="10% commission"
          icon={FiTrendingUp}
          loading={loading}
        />
        
        <StatisticsCard
          title="Active Listings"
          value={`${overview.activePercentage.toFixed(1)}%`}
          subtitle={`${formatNumber(overview.activeCount)} of ${formatNumber(overview.totalListings)}`}
          icon={FiActivity}
          loading={loading}
        />
      </div>

      {/* Secondary Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatisticsCard
          title="Service Requests"
          value={formatNumber(statistics.services.requestsCount)}
          subtitle={`${statistics.services.requestsPercentage.toFixed(1)}% of listings`}
          icon={FiSettings}
          loading={loading}
        />
        
        <StatisticsCard
          title="Inventory Alerts"
          value={formatNumber(statistics.inventory.lowStockCount + statistics.inventory.outOfStockCount)}
          subtitle={`${statistics.inventory.outOfStockCount} out of stock`}
          icon={FiShoppingBag}
          loading={loading}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <StatusDistributionChart
          data={distributions.status}
          loading={loading}
        />

        {/* Category Performance */}
        <motion.div
          className="bg-black border border-[#db2b2e]/20 p-6 hover:border-[#db2b2e]/40 transition-colors"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-6">Top Categories</h3>
          <div className="space-y-4">
            {Object.entries(distributions.category)
              .sort(([,a], [,b]) => b.count - a.count)
              .slice(0, 5)
              .map(([category, data]) => (
                <div key={category} className="flex justify-between items-center">
                  <div>
                    <span className="text-white text-sm">{category}</span>
                    <div className="text-xs text-gray-400">
                      Avg: {formatCurrency(data.avgPrice)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-semibold">{data.count}</span>
                    <div className="text-xs text-gray-400">
                      {formatCurrency(data.totalValue)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

ListingStatistics.propTypes = {
  refreshTrigger: PropTypes.number,
};

export default ListingStatistics; 