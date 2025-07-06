import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { backofficeApiRequest, isBackofficeAuthenticated } from '../../backUtils/cadreBackAuth';
import { 
  FiShoppingCart, 
  FiDollarSign, 
  FiTrendingUp, 
  FiPackage,
  FiCreditCard,
  FiCheckCircle
} from 'react-icons/fi';
import StatisticsCard from './StatisticsCard';
import OrderStatusDistributionChart from './OrderStatusDistributionChart';
import FulfillmentProgressChart from './FulfillmentProgressChart';
import PropTypes from 'prop-types';

const OrderStatistics = ({ refreshTrigger = 0 }) => {
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
        response = await backofficeApiRequest(`/orders/backoffice/statistics?timeframe=${timeframe}`);
      } else {
        response = await fetch(`/api/orders/backoffice/statistics?timeframe=${timeframe}`);
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch order statistics');
      }
      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching order statistics:', error);
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
        <p>Failed to load order statistics. Please try again.</p>
      </div>
    );
  }

  const { overview, trends, distributions, fulfillment } = statistics;

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
          title="Total Orders"
          value={formatNumber(overview.totalOrders)}
          subtitle={`${overview.activeCount} active`}
          icon={FiShoppingCart}
          trend={formatTrend(trends.orderGrowth)}
          trendDirection={trends.orderGrowth?.direction}
          loading={loading}
        />
        
        <StatisticsCard
          title="Total Revenue"
          value={formatCurrency(overview.totalRevenue)}
          subtitle={`Avg: ${formatCurrency(overview.averageOrderValue)}`}
          icon={FiDollarSign}
          trend={formatTrend(trends.revenueGrowth)}
          trendDirection={trends.revenueGrowth?.direction}
          loading={loading}
        />
        
        <StatisticsCard
          title="Cadre Revenue"
          value={formatCurrency(overview.totalCadreRevenue)}
          subtitle="10% commission"
          icon={FiTrendingUp}
          loading={loading}
        />
        
        <StatisticsCard
          title="Completion Rate"
          value={`${overview.completionRate.toFixed(1)}%`}
          subtitle={`${formatNumber(overview.completedCount)} delivered`}
          icon={FiCheckCircle}
          loading={loading}
        />
      </div>

      {/* Secondary Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatisticsCard
          title="Items Sold"
          value={formatNumber(overview.totalItemsSold)}
          subtitle="Total quantity"
          icon={FiPackage}
          loading={loading}
        />
        
        <StatisticsCard
          title="Shipping Revenue"
          value={formatCurrency(overview.totalShipmentFees)}
          subtitle="85 EGP per order"
          icon={FiTrendingUp}
          loading={loading}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Order Status Distribution */}
        <OrderStatusDistributionChart
          data={distributions.status}
          loading={loading}
        />

        {/* Fulfillment Progress */}
        <FulfillmentProgressChart
          data={fulfillment.completionPercentages}
          loading={loading}
        />

        {/* Payment Methods */}
        <motion.div
          className="bg-black border border-[#db2b2e]/20 p-6 hover:border-[#db2b2e]/40 transition-colors"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-6">Payment Methods</h3>
          <div className="space-y-4">
            {Object.entries(distributions.paymentMethod).map(([method, count]) => (
              <div key={method} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FiCreditCard className="w-4 h-4 text-[#db2b2e]" />
                  <span className="text-white text-sm capitalize">{method}</span>
                </div>
                <div className="text-right">
                  <span className="text-white font-semibold">{count}</span>
                  <div className="text-xs text-gray-400">
                    {overview.totalOrders > 0 ? ((count / overview.totalOrders) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Additional Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Item Categories */}
        <motion.div
          className="bg-black border border-[#db2b2e]/20 p-6 hover:border-[#db2b2e]/40 transition-colors"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-6">Top Item Categories</h3>
          <div className="space-y-4">
            {Object.entries(distributions.itemType)
              .sort(([,a], [,b]) => b.quantity - a.quantity)
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
                    <span className="text-white font-semibold">{data.quantity}</span>
                    <div className="text-xs text-gray-400">
                      {formatCurrency(data.revenue)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </motion.div>

        {/* Top Cities */}
        <motion.div
          className="bg-black border border-[#db2b2e]/20 p-6 hover:border-[#db2b2e]/40 transition-colors"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-6">Top Cities by Orders</h3>
          <div className="space-y-4">
            {distributions.topCities.slice(0, 5).map(([city, data]) => (
              <div key={city} className="flex justify-between items-center">
                <div>
                  <span className="text-white text-sm">{city}</span>
                  <div className="text-xs text-gray-400">
                    {Object.keys(data.districts).length} districts
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-white font-semibold">{data.count}</span>
                  <div className="text-xs text-gray-400">
                    {formatCurrency(data.revenue)}
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

OrderStatistics.propTypes = {
  refreshTrigger: PropTypes.number,
};

export default OrderStatistics; 