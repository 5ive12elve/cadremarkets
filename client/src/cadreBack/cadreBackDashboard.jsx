import { useEffect, useState, useCallback } from 'react';
import { 
    FiDollarSign,
    FiShoppingBag,
    FiRefreshCw,
    FiDownload,
    FiBox,
    FiMapPin,
    FiUser,
    FiCreditCard,
    FiTruck,
    FiCheck,
    FiX,
    FiPackage,
    FiUsers,
    FiHeadphones,
    FiTrendingUp,
    FiStar
} from 'react-icons/fi';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import Button from '../components/shared/Button';
import GE02Loader from '../components/GE02Loader';
import toast from 'react-hot-toast';
import PageHeader from '../components/shared/PageHeader';
import pdfExporter from '../utils/pdfExporter';
import { backofficeApiRequest, isBackofficeAuthenticated } from '../backUtils/cadreBackAuth';

const CadreBackDashboard = () => {
    // Check authentication on component mount
    useEffect(() => {
        if (!isBackofficeAuthenticated()) {
            window.location.href = '/cadreBack/login';
        }
    }, []);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);
    const [revenueData, setRevenueData] = useState([]);
    const [orderTrends, setOrderTrends] = useState([]);
    const [dashboardData, setDashboardData] = useState({
        totalUsers: 0,
        supportRequests: 0,
        activeListings: 0
    });

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            
            // Check authentication first
            if (!isBackofficeAuthenticated()) {
                throw new Error('Not authenticated for backoffice access');
            }

            // Fetch main dashboard stats
            const response = await backofficeApiRequest('/backoffice/stats');
            
            if (!response.ok) {
                throw new Error('Failed to fetch stats');
            }

            const data = await response.json();
            setStats(data);
            setRevenueData(data.revenueData || []);
            setOrderTrends(data.orderTrends || []);

            // Fetch additional data for accurate metrics using correct endpoints
            let totalUsers = 0;
            let supportRequests = 0;
            let activeListings = 0;

            // Try to fetch users count
            try {
                const usersResponse = await backofficeApiRequest('/user');
                if (usersResponse.ok) {
                    const users = await usersResponse.json();
                    totalUsers = Array.isArray(users) ? users.length : 0;
                }
            } catch (error) {
                console.warn('Failed to fetch users:', error);
            }

            // Try to fetch support requests count  
            try {
                const supportResponse = await backofficeApiRequest('/support');
                if (supportResponse.ok) {
                    const supportData = await supportResponse.json();
                    // The support API returns { requests: [], totalPages: ... }
                    supportRequests = Array.isArray(supportData.requests) ? supportData.requests.length : 0;
                }
            } catch (error) {
                console.warn('Failed to fetch support requests:', error);
            }

            // Try to fetch active listings count
            try {
                const listingsResponse = await backofficeApiRequest('/listing/backoffice/all');
                if (listingsResponse.ok) {
                    const listings = await listingsResponse.json();
                    if (Array.isArray(listings)) {
                        activeListings = listings.filter(listing => 
                            listing.status === 'For Sale' || listing.status === 'for sale'
                        ).length;
                    }
                }
            } catch (error) {
                console.warn('Failed to fetch listings:', error);
            }

            setDashboardData({
                totalUsers,
                supportRequests,
                activeListings
            });

            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch dashboard data');
            toast.error('Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
        // Set up auto-refresh every 5 minutes
        const interval = setInterval(fetchStats, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchStats]);

    const handleExportData = () => {
        if (!stats) return;
        
        const csvData = [
            ['Metric', 'Value'],
            ['Total Orders', stats.totalOrders],
            ['Placed Orders', stats.placedOrders],
            ['Out for Delivery', stats.outForDelivery],
            ['Delivered Orders', stats.deliveredOrders],
            ['Cancelled Orders', stats.cancelledOrders],
            ['Cash Orders Count', stats.cashOrders?.count || 0],
            ['Cash Orders Total', stats.cashOrders?.total || 0],
            ['Visa Orders Count', stats.visaOrders?.count || 0],
            ['Visa Orders Total', stats.visaOrders?.total || 0],
            ['Total Users', dashboardData.totalUsers],
            ['Support Requests', dashboardData.supportRequests],
            ['Active Listings', dashboardData.activeListings],
            ['Top Selling Districts', stats.topSellingDistricts?.map(d => `${d.label}: ${d.value}`).join('; ')],
            ['Top Buying Districts', stats.topBuyingDistricts?.map(d => `${d.label}: ${d.value}`).join('; ')],
            ['Top Selling Users', stats.topSellingUsers?.map(u => `${u.label}: ${u.value}`).join('; ')],
            ['Unique Listings (High Price)', stats.uniqueListingsHighPrice?.map(l => `${l.name}: ${l.price}`).join('; ')],
            ['Stock Listings (High Price)', stats.stockListingsHighPrice?.map(l => `${l.name}: ${l.price}`).join('; ')],
        ];

        const blob = new Blob([csvData.map(row => row.join(',')).join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'dashboard-stats.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleExportPDF = async () => {
        if (!stats) return;
        
        try {
            toast.loading('Generating dashboard PDF report...');
            
            await pdfExporter.exportDashboardPDF(dashboardData, stats);

            toast.dismiss();
            toast.success('Dashboard PDF exported successfully!');
        } catch (error) {
            toast.dismiss();
            toast.error('Failed to export PDF');
            console.error('PDF export error:', error);
        }
    };

    return (
        <div className="w-full min-h-screen bg-white dark:bg-black transition-colors duration-300">
            <PageHeader
                title="Dashboard"
                description="Overview of your business metrics and performance"
                actions={
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                        <Button
                            onClick={fetchStats}
                            className="flex items-center justify-center gap-2 text-white/60 hover:text-white text-sm px-3 py-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#db2b2e]/20"
                        >
                            <FiRefreshCw className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-300'} />
                            <span className="hidden sm:inline">Refresh</span>
                        </Button>
                        <Button
                            onClick={handleExportData}
                            className="flex items-center justify-center gap-2 text-white/60 hover:text-white text-sm px-3 py-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#f3eb4b]/20 group"
                        >
                            <FiDownload className="group-hover:-translate-y-1 transition-transform duration-300" />
                            <span className="hidden sm:inline">Export CSV</span>
                        </Button>
                        <Button
                            onClick={handleExportPDF}
                            className="flex items-center justify-center gap-2 text-white/60 hover:text-white text-sm px-3 py-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#db2b2e]/20 group"
                        >
                            <FiDownload className="group-hover:-translate-y-1 transition-transform duration-300" />
                            <span className="hidden sm:inline">Export PDF</span>
                        </Button>
                    </div>
                }
            />

            <div className="p-4 lg:p-6">
                {loading ? (
                    <div className="flex justify-center items-center h-[calc(100vh-200px)]">
                        <GE02Loader size="xlarge" message="Loading dashboard data..." />
                    </div>
                ) : error ? (
                    <div className="text-center text-[#db2b2e] text-lg border border-[#db2b2e] p-6 bg-red-50 dark:bg-red-900/20">
                        Failed to load dashboard data. Please try again.
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Primary Metrics */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                            <div className="bg-white dark:bg-black p-4 border-l-4 border-[#db2b2e] shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-[#db2b2e]/20 hover:-translate-y-1 hover:border-l-8 cursor-pointer group">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-gray-600 dark:text-white/60 font-medium text-sm group-hover:text-[#db2b2e] transition-colors duration-300">Total Orders</h3>
                                    <FiShoppingBag className="text-[#db2b2e] text-lg group-hover:scale-125 transition-transform duration-300" />
                                </div>
                                <p className="text-2xl font-bold text-black dark:text-white group-hover:text-[#db2b2e] transition-colors duration-300">
                                    {stats?.totalOrders || 0}
                                </p>
                            </div>
                            <div className="bg-white dark:bg-black p-4 border-l-4 border-[#f3eb4b] shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-[#f3eb4b]/20 hover:-translate-y-1 hover:border-l-8 cursor-pointer group">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-gray-600 dark:text-white/60 font-medium text-sm group-hover:text-[#f3eb4b] transition-colors duration-300">Total Revenue</h3>
                                    <FiDollarSign className="text-[#f3eb4b] text-lg group-hover:scale-125 transition-transform duration-300" />
                                </div>
                                <p className="text-2xl font-bold text-black dark:text-white group-hover:text-[#f3eb4b] transition-colors duration-300">
                                    {((stats?.totalRevenue?.total || 0) / 1).toLocaleString()} EGP
                                </p>
                            </div>
                            <div className="bg-white dark:bg-black p-4 border-l-4 border-[#db2b2e] shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-[#db2b2e]/20 hover:-translate-y-1 hover:border-l-8 cursor-pointer group">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-gray-600 dark:text-white/60 font-medium text-sm group-hover:text-[#db2b2e] transition-colors duration-300">Cadre Profit</h3>
                                    <FiTrendingUp className="text-[#db2b2e] text-lg group-hover:scale-125 transition-transform duration-300" />
                                </div>
                                <p className="text-2xl font-bold text-black dark:text-white group-hover:text-[#db2b2e] transition-colors duration-300">
                                    {((stats?.totalCadreProfit?.total || 0) / 1).toLocaleString()} EGP
                                </p>
                            </div>
                            <div className="bg-white dark:bg-black p-4 border-l-4 border-[#f3eb4b] shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-[#f3eb4b]/20 hover:-translate-y-1 hover:border-l-8 cursor-pointer group">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-gray-600 dark:text-white/60 font-medium text-sm group-hover:text-[#f3eb4b] transition-colors duration-300">Active Listings</h3>
                                    <FiPackage className="text-[#f3eb4b] text-lg group-hover:scale-125 transition-transform duration-300" />
                                </div>
                                <p className="text-2xl font-bold text-black dark:text-white group-hover:text-[#f3eb4b] transition-colors duration-300">
                                    {dashboardData.activeListings}
                                </p>
                            </div>
                        </div>

                        {/* Business Metrics */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="bg-white dark:bg-black p-4 border-l-4 border-[#db2b2e] shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-[#db2b2e]/20 hover:-translate-y-1 hover:border-l-8 cursor-pointer group">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-gray-600 dark:text-white/60 font-medium text-sm group-hover:text-[#db2b2e] transition-colors duration-300">Total Users</h3>
                                    <FiUsers className="text-[#db2b2e] text-lg group-hover:scale-125 transition-transform duration-300" />
                                </div>
                                <p className="text-2xl font-bold text-black dark:text-white group-hover:text-[#db2b2e] transition-colors duration-300">
                                    {dashboardData.totalUsers}
                                </p>
                            </div>
                            <div className="bg-white dark:bg-black p-4 border-l-4 border-[#f3eb4b] shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-[#f3eb4b]/20 hover:-translate-y-1 hover:border-l-8 cursor-pointer group">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-gray-600 dark:text-white/60 font-medium text-sm group-hover:text-[#f3eb4b] transition-colors duration-300">Support Requests</h3>
                                    <FiHeadphones className="text-[#f3eb4b] text-lg group-hover:scale-125 transition-transform duration-300" />
                                </div>
                                <p className="text-2xl font-bold text-black dark:text-white group-hover:text-[#f3eb4b] transition-colors duration-300">
                                    {dashboardData.supportRequests}
                                </p>
                            </div>
                        </div>

                        {/* Order Status Overview */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                            <div className="bg-white dark:bg-black p-4 border-l-4 border-[#db2b2e] shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-[#db2b2e]/20 hover:-translate-y-1 hover:border-l-8 cursor-pointer group">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-gray-600 dark:text-white/60 font-medium text-sm group-hover:text-[#db2b2e] transition-colors duration-300">Placed Orders</h3>
                                    <FiShoppingBag className="text-[#db2b2e] text-lg group-hover:scale-125 transition-transform duration-300" />
                                </div>
                                <div className="text-black dark:text-white">
                                    <p className="text-xl font-bold group-hover:text-[#db2b2e] transition-colors duration-300">{stats?.placedOrders || 0}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 group-hover:text-[#db2b2e]/80 transition-colors duration-300">
                                        <FiStar className="inline w-3 h-3 mr-1" />
                                        Awaiting Processing
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-black p-4 border-l-4 border-[#f3eb4b] shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-[#f3eb4b]/20 hover:-translate-y-1 hover:border-l-8 cursor-pointer group">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-gray-600 dark:text-white/60 font-medium text-sm group-hover:text-[#f3eb4b] transition-colors duration-300">Out for Delivery</h3>
                                    <FiTruck className="text-[#f3eb4b] text-lg group-hover:scale-125 transition-transform duration-300" />
                                </div>
                                <div className="text-black dark:text-white">
                                    <p className="text-xl font-bold group-hover:text-[#f3eb4b] transition-colors duration-300">{stats?.outForDeliveryOrders || 0}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 group-hover:text-[#f3eb4b]/80 transition-colors duration-300">In Transit</p>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-black p-4 border-l-4 border-[#db2b2e] shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-[#db2b2e]/20 hover:-translate-y-1 hover:border-l-8 cursor-pointer group">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-gray-600 dark:text-white/60 font-medium text-sm group-hover:text-[#db2b2e] transition-colors duration-300">Delivered</h3>
                                    <FiCheck className="text-[#db2b2e] text-lg group-hover:scale-125 transition-transform duration-300" />
                                </div>
                                <div className="text-black dark:text-white">
                                    <p className="text-xl font-bold group-hover:text-[#db2b2e] transition-colors duration-300">{stats?.deliveredOrders || 0}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 group-hover:text-[#db2b2e]/80 transition-colors duration-300">Successfully Completed</p>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-black p-4 border-l-4 border-[#db2b2e] shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-[#db2b2e]/20 hover:-translate-y-1 hover:border-l-8 cursor-pointer group">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-gray-600 dark:text-white/60 font-medium text-sm group-hover:text-[#db2b2e] transition-colors duration-300">Cancelled</h3>
                                    <FiX className="text-[#db2b2e] text-lg group-hover:scale-125 transition-transform duration-300" />
                                </div>
                                <div className="text-black dark:text-white">
                                    <p className="text-xl font-bold group-hover:text-[#db2b2e] transition-colors duration-300">{stats?.cancelledOrders || 0}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 group-hover:text-[#db2b2e]/80 transition-colors duration-300">Order Cancelled</p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                            <div className="bg-white dark:bg-black p-4 border-l-4 border-[#db2b2e] shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-[#db2b2e]/20 hover:-translate-y-1 hover:border-l-8 cursor-pointer group">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-gray-600 dark:text-white/60 font-medium text-sm group-hover:text-[#db2b2e] transition-colors duration-300">Cash Orders</h3>
                                    <FiDollarSign className="text-[#db2b2e] text-lg group-hover:scale-125 transition-transform duration-300" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xl font-bold text-black dark:text-white group-hover:text-[#db2b2e] transition-colors duration-300">
                                        Count: {stats?.cashOrders?.count || 0}
                                    </p>
                                    <p className="text-sm text-gray-700 dark:text-white/80 group-hover:text-[#db2b2e]/80 transition-colors duration-300">
                                        Total: {((stats?.cashOrders?.total || 0) / 1).toLocaleString()} EGP
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-black p-4 border-l-4 border-[#f3eb4b] shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-[#f3eb4b]/20 hover:-translate-y-1 hover:border-l-8 cursor-pointer group">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-gray-600 dark:text-white/60 font-medium text-sm group-hover:text-[#f3eb4b] transition-colors duration-300">Instapay Orders</h3>
                                    <FiCreditCard className="text-[#f3eb4b] text-lg group-hover:scale-125 transition-transform duration-300" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xl font-bold text-black dark:text-white group-hover:text-[#f3eb4b] transition-colors duration-300">
                                        Count: {stats?.visaOrders?.count || 0}
                                    </p>
                                    <p className="text-sm text-gray-700 dark:text-white/80 group-hover:text-[#f3eb4b]/80 transition-colors duration-300">
                                        Total: {((stats?.visaOrders?.total || 0) / 1).toLocaleString()} EGP
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                            {/* Revenue Chart */}
                            <div className="bg-white dark:bg-black p-4 border border-gray-200 dark:border-[#db2b2e] shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-[#db2b2e]/10 hover:-translate-y-1 cursor-pointer group">
                                <h3 className="text-lg font-bold mb-4 text-black dark:text-white group-hover:text-[#db2b2e] transition-colors duration-300">Revenue Trend</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={revenueData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(219, 43, 46, 0.1)" />
                                        <XAxis dataKey="date" stroke="currentColor" className="text-black dark:text-white text-xs" />
                                        <YAxis stroke="currentColor" className="text-black dark:text-white text-xs" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'var(--tooltip-bg)',
                                                border: '1px solid #db2b2e',
                                                color: 'var(--tooltip-text)',
                                                borderRadius: '8px',
                                                fontSize: '12px'
                                            }}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="amount"
                                            stroke="#db2b2e"
                                            strokeWidth={3}
                                            dot={{ fill: '#db2b2e', strokeWidth: 2, r: 4 }}
                                            activeDot={{ r: 6, stroke: '#db2b2e', strokeWidth: 2 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Order Trends Chart */}
                            <div className="bg-white dark:bg-black p-4 border border-gray-200 dark:border-[#db2b2e] shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-[#db2b2e]/10 hover:-translate-y-1 cursor-pointer group">
                                <h3 className="text-lg font-bold mb-4 text-black dark:text-white group-hover:text-[#db2b2e] transition-colors duration-300">Order Trends</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={orderTrends}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(219, 43, 46, 0.1)" />
                                        <XAxis dataKey="date" stroke="currentColor" className="text-black dark:text-white text-xs" />
                                        <YAxis stroke="currentColor" className="text-black dark:text-white text-xs" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'var(--tooltip-bg)',
                                                border: '1px solid #db2b2e',
                                                color: 'var(--tooltip-text)',
                                                borderRadius: '8px',
                                                fontSize: '12px'
                                            }}
                                        />
                                        <Legend />
                                        <Bar dataKey="count" fill="#db2b2e" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Districts and Users Statistics */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                            {/* Top Selling Districts */}
                            <div className="bg-white dark:bg-black p-4 border border-gray-200 dark:border-[#db2b2e] shadow-sm transition-colors duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-black dark:text-white">Top Selling Districts</h3>
                                    <FiMapPin className="text-[#db2b2e] text-lg" />
                                </div>
                                <div className="space-y-3">
                                    {(stats?.topSellingDistricts || []).map((district) => (
                                        <div
                                            key={district.label}
                                            className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-[#db2b2e]/20 hover:border-[#db2b2e] transition-colors duration-200"
                                        >
                                            <span className="text-black dark:text-white text-sm">{district.label}</span>
                                            <div className="flex items-center">
                                                <span className="text-[#db2b2e] font-bold text-sm mr-2">
                                                    {district.value}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-white/60">listings</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Top Buying Districts */}
                            <div className="bg-white dark:bg-black p-4 border border-gray-200 dark:border-[#db2b2e] shadow-sm transition-colors duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-black dark:text-white">Top Buying Districts</h3>
                                    <FiMapPin className="text-[#db2b2e] text-lg" />
                                </div>
                                <div className="space-y-3">
                                    {(stats?.topBuyingDistricts || []).map((district) => (
                                        <div
                                            key={district.label}
                                            className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-[#db2b2e]/20 hover:border-[#db2b2e] transition-colors duration-200"
                                        >
                                            <span className="text-black dark:text-white text-sm">{district.label}</span>
                                            <div className="flex items-center">
                                                <span className="text-[#db2b2e] font-bold text-sm mr-2">
                                                    {district.value}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-white/60">orders</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Top Selling Users */}
                            <div className="bg-white dark:bg-black p-4 border border-gray-200 dark:border-[#db2b2e] shadow-sm transition-colors duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-black dark:text-white">Top Selling Users</h3>
                                    <FiUser className="text-[#db2b2e] text-lg" />
                                </div>
                                <div className="space-y-3">
                                    {(stats?.topSellingUsers || []).map((user) => (
                                        <div
                                            key={user.label}
                                            className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-[#db2b2e]/20 hover:border-[#db2b2e] transition-colors duration-200"
                                        >
                                            <span className="text-black dark:text-white text-sm">{user.label}</span>
                                            <div className="flex items-center">
                                                <span className="text-[#db2b2e] font-bold text-sm mr-2">
                                                    {user.value.toLocaleString()} EGP
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-white/60">revenue</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* High Value Listings */}
                        <div className="bg-white dark:bg-black p-4 border border-gray-200 dark:border-[#db2b2e] shadow-sm transition-colors duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-black dark:text-white">High Value Listings</h3>
                                <FiBox className="text-[#db2b2e] text-lg" />
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Unique Listings */}
                                <div>
                                    <h4 className="text-md font-semibold text-gray-700 dark:text-white/80 mb-3">Unique Listings</h4>
                                    <div className="space-y-2">
                                        {(stats?.uniqueListingsHighPrice || []).map((listing) => (
                                            <div
                                                key={listing.id}
                                                className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-[#db2b2e]/20 hover:border-[#db2b2e] transition-colors duration-200"
                                            >
                                                <span className="text-black dark:text-white text-sm">{listing.name}</span>
                                                <div className="flex items-center">
                                                    <span className="text-[#db2b2e] font-bold text-sm">
                                                        {listing.price.toLocaleString()} EGP
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Stock Listings */}
                                <div>
                                    <h4 className="text-md font-semibold text-gray-700 dark:text-white/80 mb-3">Stock Listings</h4>
                                    <div className="space-y-2">
                                        {(stats?.stockListingsHighPrice || []).map((listing) => (
                                            <div
                                                key={listing.id}
                                                className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-[#db2b2e]/20 hover:border-[#db2b2e] transition-colors duration-200"
                                            >
                                                <span className="text-black dark:text-white text-sm">{listing.name}</span>
                                                <div className="flex items-center">
                                                    <span className="text-[#db2b2e] font-bold text-sm">
                                                        {listing.price.toLocaleString()} EGP
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CadreBackDashboard;