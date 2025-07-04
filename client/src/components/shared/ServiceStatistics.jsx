import { useState, useEffect } from 'react';
import { 
  FiUsers, 
  FiClock, 
  FiCheckCircle, 
  FiXCircle, 
  FiTrendingUp, 
  FiBarChart2, 
  FiDollarSign,
  FiCalendar
} from 'react-icons/fi';
import PropTypes from 'prop-types';
import StatisticsCard from './StatisticsCard';
import ServiceStatusDistributionChart from './ServiceStatusDistributionChart';
import ServiceTypeDistributionChart from './ServiceTypeDistributionChart';

const ServiceStatistics = ({ refreshTrigger }) => {
  const [statistics, setStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30');

  const fetchStatistics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/services/backoffice/statistics?timeframe=${timeframe}`);
      if (!response.ok) throw new Error('Failed to fetch statistics');
      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching service statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [timeframe, refreshTrigger]);

  const getIcon = (type) => {
    const icons = {
      total: FiUsers,
      active: FiClock,
      completed: FiCheckCircle,
      rejected: FiXCircle,
      growth: FiTrendingUp,
      completion: FiBarChart2,
      response: FiCalendar,
      pending: FiDollarSign
    };
    return icons[type] || FiUsers;
  };

  const formatValue = (value, type) => {
    if (type === 'percentage') return `${value}%`;
    if (type === 'days') return `${value} days`;
    if (type === 'growth') return `${value > 0 ? '+' : ''}${value}%`;
    return value;
  };

  const getGrowthColor = (value) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (isLoading && !statistics) {
    return (
      <div className="space-y-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-[#db2b2e]/20 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-[#db2b2e]/10 rounded w-32 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-black border border-[#db2b2e] rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-[#db2b2e]/20 rounded mb-4"></div>
              <div className="h-8 bg-[#db2b2e]/10 rounded mb-2"></div>
              <div className="h-3 bg-[#db2b2e]/10 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!statistics) return null;

  const { overview, trends, distributions, performance } = statistics;

  const statisticsCards = [
    {
      title: 'Total Services',
      value: overview.totalServices,
      icon: getIcon('total'),
      format: 'number',
      description: 'All service requests'
    },
    {
      title: 'Active Services',
      value: overview.activeCount,
      icon: getIcon('active'),
      format: 'number',
      description: 'Pending & approved',
      trend: `${overview.activePercentage.toFixed(1)}% of total`
    },
    {
      title: 'Completed Services',
      value: overview.completedCount,
      icon: getIcon('completed'),
      format: 'number',
      description: 'Successfully completed',
      trend: `${overview.completionRate.toFixed(1)}% completion rate`
    },
    {
      title: 'Rejected Services',
      value: overview.rejectedCount,
      icon: getIcon('rejected'),
      format: 'number',
      description: 'Declined requests'
    },
    {
      title: 'Service Growth',
      value: trends.serviceGrowth.value.toFixed(1),
      icon: getIcon('growth'),
      format: 'growth',
      description: `Last ${trends.serviceGrowth.period}`,
      trend: trends.serviceGrowth.direction,
      trendColor: getGrowthColor(trends.serviceGrowth.value)
    },
    {
      title: 'Completion Rate',
      value: overview.completionRate.toFixed(1),
      icon: getIcon('completion'),
      format: 'percentage',
      description: 'Overall success rate'
    },
    {
      title: 'Avg Response Time',
      value: overview.avgResponseTime,
      icon: getIcon('response'),
      format: 'days',
      description: 'Processing time'
    },
    {
      title: 'Oldest Pending',
      value: overview.oldestPending,
      icon: getIcon('pending'),
      format: 'days',
      description: 'Needs attention',
      trend: parseFloat(overview.oldestPending) > 7 ? 'High priority' : 'Normal'
    }
  ];

  return (
    <div className="space-y-6 mb-6">
      <div className="bg-black border border-[#db2b2e] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FiBarChart2 className="w-6 h-6 text-[#db2b2e]" />
            <h2 className="text-xl font-bold text-white">Cadre Services Analytics</h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <label htmlFor="timeframe" className="text-sm font-medium text-white/60">
              Timeframe:
            </label>
            <select
              id="timeframe"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-black border border-[#db2b2e]/20 text-white px-3 py-1 text-sm focus:outline-none focus:border-[#db2b2e] transition-colors"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statisticsCards.map((card, index) => (
          <StatisticsCard
            key={index}
            title={card.title}
            value={formatValue(card.value, card.format)}
            icon={card.icon}
            description={card.description}
            trend={card.trend}
            trendColor={card.trendColor}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ServiceStatusDistributionChart 
          data={distributions.status} 
          isLoading={isLoading} 
        />
        <ServiceTypeDistributionChart 
          data={distributions.serviceType} 
          isLoading={isLoading} 
        />
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Distribution */}
        <div className="bg-black border border-[#db2b2e] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Client Budget Analysis</h3>
          <div className="space-y-3">
            {Object.entries(distributions.budget).map(([budget, count]) => (
              <div key={budget} className="flex justify-between items-center">
                <span className="text-sm text-white/60">{budget}</span>
                <span className="font-medium text-[#db2b2e]">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Design Stage Distribution */}
        <div className="bg-black border border-[#db2b2e] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Project Development Stages</h3>
          <div className="space-y-3">
            {Object.entries(distributions.designStage).map(([stage, count]) => (
              <div key={stage} className="flex justify-between items-center">
                <span className="text-sm text-white/60 capitalize">{stage}</span>
                <span className="font-medium text-[#db2b2e]">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-black border border-[#db2b2e] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Cadre Monthly Performance</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {performance.monthlyData.map((month, index) => (
            <div key={index} className="text-center">
              <div className="text-sm text-white/60 mb-1">{month.month}</div>
              <div className="text-lg font-bold text-white mb-1">{month.count}</div>
              <div className="text-xs text-[#db2b2e]">{month.completed} delivered</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

ServiceStatistics.propTypes = {
  refreshTrigger: PropTypes.number
};

export default ServiceStatistics; 