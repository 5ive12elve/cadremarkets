import { useState, useEffect } from 'react';
import { 
  FiUsers, 
  FiClock, 
  FiCheckCircle, 
  FiXCircle, 
  FiTrendingUp, 
  FiBarChart2, 
  FiAlertTriangle,
  FiCalendar,
  FiUserCheck,
  FiUserX
} from 'react-icons/fi';
import PropTypes from 'prop-types';
import StatisticsCard from './StatisticsCard';
import SupportStatusDistributionChart from './SupportStatusDistributionChart';
import SupportPriorityDistributionChart from './SupportPriorityDistributionChart';

const SupportRequestStatistics = ({ refreshTrigger }) => {
  const [statistics, setStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30');

  const fetchStatistics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/support/backoffice/statistics?timeframe=${timeframe}`);
      if (!response.ok) throw new Error('Failed to fetch statistics');
      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching support statistics:', error);
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
      resolved: FiCheckCircle,
      closed: FiXCircle,
      growth: FiTrendingUp,
      resolution: FiBarChart2,
      response: FiCalendar,
      urgent: FiAlertTriangle,
      assigned: FiUserCheck,
      unassigned: FiUserX
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
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

  const { overview, trends, distributions, breakdown, performance } = statistics;

  const statisticsCards = [
    {
      title: 'Total Requests',
      value: overview.totalRequests,
      icon: getIcon('total'),
      format: 'number',
      description: 'All support requests'
    },
    {
      title: 'Active Requests',
      value: overview.activeCount,
      icon: getIcon('active'),
      format: 'number',
      description: 'New & in-progress',
      trend: `${overview.activePercentage.toFixed(1)}% of total`
    },
    {
      title: 'Resolved Requests',
      value: overview.resolvedCount,
      icon: getIcon('resolved'),
      format: 'number',
      description: 'Successfully resolved',
      trend: `${overview.resolutionRate.toFixed(1)}% resolution rate`
    },
    {
      title: 'Closed Requests',
      value: overview.closedCount,
      icon: getIcon('closed'),
      format: 'number',
      description: 'Completed & closed'
    },
    {
      title: 'Request Growth',
      value: trends.requestGrowth.value.toFixed(1),
      icon: getIcon('growth'),
      format: 'growth',
      description: `Last ${trends.requestGrowth.period}`,
      trend: trends.requestGrowth.direction,
      trendColor: getGrowthColor(trends.requestGrowth.value)
    },
    {
      title: 'Resolution Rate',
      value: overview.resolutionRate.toFixed(1),
      icon: getIcon('resolution'),
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
      title: 'Urgent Requests',
      value: overview.urgentCount,
      icon: getIcon('urgent'),
      format: 'number',
      description: 'High priority items',
      trend: overview.urgentCount > 5 ? 'Needs attention' : 'Under control'
    },
    {
      title: 'Unassigned Requests',
      value: overview.unassignedCount,
      icon: getIcon('unassigned'),
      format: 'number',
      description: 'Waiting assignment',
      trend: overview.unassignedCount > 10 ? 'High backlog' : 'Manageable'
    }
  ];

  return (
    <div className="space-y-6 mb-6">
      <div className="bg-black border border-[#db2b2e] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FiBarChart2 className="w-6 h-6 text-[#db2b2e]" />
            <h2 className="text-xl font-bold text-white">Cadre Customer Support Analytics</h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <label htmlFor="support-timeframe" className="text-sm font-medium text-white/60">
              Timeframe:
            </label>
            <select
              id="support-timeframe"
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
        <SupportStatusDistributionChart 
          data={distributions.status} 
          isLoading={isLoading} 
        />
        <SupportPriorityDistributionChart 
          data={distributions.priority} 
          isLoading={isLoading} 
        />
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request Type Breakdown */}
        <div className="bg-black border border-[#db2b2e]/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Request Type Breakdown</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/70">Support Requests</span>
              <div className="text-right">
                <span className="font-medium text-white">{breakdown.supportRequests}</span>
                <span className="text-sm text-white/60 ml-1">({breakdown.supportPercentage.toFixed(1)}%)</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/70">Contact Form</span>
              <div className="text-right">
                <span className="font-medium text-white">{breakdown.contactFormRequests}</span>
                <span className="text-sm text-white/60 ml-1">({breakdown.contactFormPercentage.toFixed(1)}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-black border border-[#db2b2e]/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Category Distribution</h3>
          <div className="space-y-3">
            {Object.entries(distributions.category).slice(0, 5).map(([category, data]) => (
              <div key={category} className="flex justify-between items-center">
                <span className="text-sm text-white/70 capitalize">{category || 'General'}</span>
                <span className="font-medium text-white">{data.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-black border border-[#db2b2e]/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/70">New Requests</span>
              <span className="font-medium text-white">{performance.newCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/70">Oldest New Request</span>
              <span className="font-medium text-white">{performance.oldestNew} days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/70">Assignment Rate</span>
              <span className="font-medium text-white">{performance.assignedPercentage.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Performance */}
      <div className="bg-black border border-[#db2b2e]/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Monthly Performance</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {performance.monthlyData.map((month, index) => (
            <div key={index} className="text-center">
              <div className="text-sm text-white/60 mb-1">{month.month}</div>
              <div className="text-lg font-bold text-white mb-1">{month.count}</div>
              <div className="text-xs text-[#db2b2e]">{month.resolved} resolved</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

SupportRequestStatistics.propTypes = {
  refreshTrigger: PropTypes.number
};

export default SupportRequestStatistics; 