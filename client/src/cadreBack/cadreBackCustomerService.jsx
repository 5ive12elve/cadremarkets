import { useState, useEffect } from 'react';
import { backofficeApiRequest, isBackofficeAuthenticated } from '../backUtils/cadreBackAuth';
import { FiFilter, FiMessageSquare, FiClock, FiStar, FiRefreshCw, FiDownload } from 'react-icons/fi';
import PageHeader from '../components/shared/PageHeader';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';
import Search from '../components/shared/Search';
import Table from '../components/shared/Table';
import SupportRequestStatistics from '../components/shared/SupportRequestStatistics';
import GE02Loader from '../components/GE02Loader';
import pdfExporter from '../utils/pdfExporter';
import toast from 'react-hot-toast';
import { getApiUrl } from '../utils/apiConfig';
import useConfirmDialog from '../hooks/useConfirmDialog';
import ConfirmDialog from '../components/ui/ConfirmDialog';

export default function CadreBackCustomerService() {
  // Check authentication on component mount
  useEffect(() => {
    if (!isBackofficeAuthenticated()) {
      window.location.href = '/cadreBack/login';
    }
  }, []);

  const { confirm, dialogProps } = useConfirmDialog();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(selectedType !== 'all' && { type: selectedType }),
        ...(selectedStatus !== 'all' && { status: selectedStatus }),
        ...(selectedPriority !== 'all' && { priority: selectedPriority }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await backofficeApiRequest(`/support?${queryParams}`);
      
      if (!response.ok) throw new Error('Failed to fetch requests');
      
      const data = await response.json();
      setRequests(data.requests);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await backofficeApiRequest('/support/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, [currentPage, selectedType, selectedStatus, selectedPriority, searchTerm]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(getApiUrl(`api/support/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ 
          status: newStatus,
          notes: notes.trim() ? notes : undefined
        })
      });

      if (!response.ok) throw new Error('Failed to update status');
      
      toast.success('Status updated successfully');
      setShowDetailsModal(false);
      setNotes('');
      fetchRequests();
      fetchStats();
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm(
      'Are you sure you want to delete this request? This action cannot be undone.',
      'Delete Request',
      'danger'
    );
    
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(getApiUrl(`api/support/${id}`), {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to delete request');
      
      toast.success('Request deleted successfully');
      setShowDetailsModal(false);
      fetchRequests();
      fetchStats();
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error('Failed to delete request');
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchRequests();
    fetchStats();
    toast.success('Customer service data refreshed successfully');
  };

  const handleExportPDF = async () => {
    try {
      toast.loading('Generating comprehensive PDF report...');
      
      // Fetch detailed statistics
      let detailedStats = null;
      try {
        const response = await fetch(getApiUrl('api/support/backoffice/statistics?timeframe=365'), {
          credentials: 'include'
        });
        if (response.ok) {
          detailedStats = await response.json();
        }
      } catch (error) {
        console.error('Failed to fetch detailed statistics:', error);
      }

      // Calculate basic stats as fallback
      const stats = {
        total: requests.length,
        new: requests.filter(r => r.status === 'new').length,
        inProgress: requests.filter(r => r.status === 'in-progress').length,
        resolved: requests.filter(r => r.status === 'resolved').length,
        closed: requests.filter(r => r.status === 'closed').length
      };

      await pdfExporter.exportCustomerServicePDF(requests, stats, detailedStats);
      toast.dismiss();
      toast.success('Comprehensive PDF report exported successfully!');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to export PDF');
      console.error('Error exporting PDF:', error);
    }
  };

  const columns = [
    {
      header: 'Type',
      key: 'type',
      render: (row) => (
        <span className={`px-2 py-1 text-xs font-medium ${
          row.type === 'support' ? 'text-[#db2b2e]' : 'text-[#db2b2e]'
        }`}>
          {row.type.charAt(0).toUpperCase() + row.type.slice(1)}
        </span>
      )
    },
    {
      header: 'Name',
      key: 'name'
    },
    {
      header: 'Category',
      key: 'category',
      render: (row) => {
        // For contact requests, use the reason as category
        const category = row.type === 'contact' ? row.reason : row.category;
        return category || 'N/A';
      }
    },
    {
      header: 'Priority',
      key: 'priority',
      render: (row) => (
        <span className={`px-2 py-1 text-xs font-medium ${
          row.priority === 'high' ? 'text-[#db2b2e]' :
          row.priority === 'normal' ? 'text-[#db2b2e]/70' :
          'text-[#db2b2e]/50'
        }`}>
          {row.priority ? row.priority.charAt(0).toUpperCase() + row.priority.slice(1) : 'N/A'}
        </span>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => (
        <span className={`px-2 py-1 text-xs font-medium ${
          row.status === 'new' ? 'text-[#db2b2e]' :
          row.status === 'in-progress' ? 'text-[#db2b2e]/70' :
          row.status === 'resolved' ? 'text-[#db2b2e]/50' :
          'text-[#db2b2e]/30'
        }`}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      )
    },
    {
      header: 'Date',
      key: 'createdAt',
      render: (row) => new Date(row.createdAt).toLocaleDateString()
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="flex space-x-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setSelectedRequest(row);
              setNotes(row.notes || '');
              setShowDetailsModal(true);
            }}
          >
            View Details
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(row._id)}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

      return (
      <div className="w-full md:pt-0 pt-16 overflow-x-hidden">
      <PageHeader
        title="Customer Service"
        description="Manage support requests and contact form submissions"
        actions={
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? <GE02Loader size="small" /> : <FiRefreshCw className="w-4 h-4" />}
                                          <span>Refresh</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExportPDF}
              className="flex items-center gap-2"
            >
              <FiDownload className="w-4 h-4" />
                                          <span>Export PDF</span>
            </Button>
            {stats && (
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" icon={FiMessageSquare} size="sm" className="text-xs">
                                              <span>New: </span>{stats.overview.newRequests}
                </Button>
                <Button variant="secondary" icon={FiClock} size="sm" className="text-xs">
                                              <span>In Progress: </span>{stats.overview.inProgress}
                </Button>
                <Button variant="secondary" icon={FiStar} size="sm" className="text-xs">
                                              <span>Resolved: </span>{stats.overview.resolved}
                </Button>
              </div>
            )}
          </div>
        }
      />

      <SupportRequestStatistics refreshTrigger={refreshTrigger} />

      <Card className="mb-4 max-w-full overflow-x-hidden">
        <div className="flex flex-col gap-3">
          <Search
            onSearch={handleSearch}
            placeholder="Search by name, email, or message..."
            className="w-full"
          />
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <FiFilter className="text-[#db2b2e]" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-black text-white px-2 py-1 border border-[#db2b2e] text-xs sm:text-sm"
              >
                <option value="all">All Types</option>
                <option value="support">Support</option>
                <option value="contact">Contact</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-black text-white px-2 py-1 border border-[#db2b2e] text-xs sm:text-sm"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="bg-black text-white px-2 py-1 border border-[#db2b2e] text-xs sm:text-sm"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      <Card className="max-w-full overflow-x-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block">
          <Table
            columns={columns}
            data={requests}
            loading={loading}
            pagination={{
              currentPage,
              totalPages,
              onPageChange: setCurrentPage
            }}
          />
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3 p-4">
          {requests.map((request) => (
            <div
              key={request._id}
              className="border border-[#db2b2e]/20 p-4 rounded cursor-pointer hover:bg-[#db2b2e]/5 transition-colors"
              onClick={() => {
                setSelectedRequest(request);
                setNotes(request.notes || '');
                setShowDetailsModal(true);
              }}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white text-sm mb-1 truncate">{request.name}</h3>
                  <p className="text-gray-400 text-xs mb-2">{request.email}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-1 text-xs font-medium ${
                    request.type === 'support' ? 'text-[#db2b2e]' : 'text-[#db2b2e]'
                  }`}>
                    {request.type.charAt(0).toUpperCase() + request.type.slice(1)}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium ${
                    request.status === 'new' ? 'text-[#db2b2e]' :
                    request.status === 'in-progress' ? 'text-[#db2b2e]/70' :
                    request.status === 'resolved' ? 'text-[#db2b2e]/50' :
                    'text-[#db2b2e]/30'
                  }`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <p className="text-white text-sm">
                    {request.type === 'contact' ? request.reason : request.category || 'N/A'}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-1 text-xs font-medium ${
                    request.priority === 'high' ? 'text-[#db2b2e]' :
                    request.priority === 'normal' ? 'text-[#db2b2e]/70' :
                    'text-[#db2b2e]/50'
                  }`}>
                    {request.priority ? request.priority.charAt(0).toUpperCase() + request.priority.slice(1) : 'N/A'}
                  </span>
                  <span className="text-white/60 text-xs">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
                        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-30 p-1 sm:p-4">
          <div className="bg-black p-2 sm:p-6 border border-[#db2b2e] w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4 text-[#db2b2e]">
              {selectedRequest.type === 'support' ? 'Support Request' : 'Contact Form'} Details
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div>
                <p className="text-[#db2b2e] text-xs sm:text-sm">Name</p>
                <p className="text-sm sm:text-base">{selectedRequest.name}</p>
              </div>
              <div>
                <p className="text-[#db2b2e] text-xs sm:text-sm">Email</p>
                <p className="break-all text-sm sm:text-base">{selectedRequest.email}</p>
              </div>
              <div>
                <p className="text-[#db2b2e] text-xs sm:text-sm">Phone</p>
                <p className="text-sm sm:text-base">{selectedRequest.phone || 'Not provided'}</p>
              </div>
              {selectedRequest.orderNumber && (
                <div>
                  <p className="text-[#db2b2e] text-xs sm:text-sm">Order Number</p>
                  <p className="text-sm sm:text-base">{selectedRequest.orderNumber}</p>
                </div>
              )}
              <div>
                <p className="text-[#db2b2e] text-xs sm:text-sm">Type</p>
                <p className="text-sm sm:text-base">{selectedRequest.type}</p>
              </div>
              <div>
                <p className="text-[#db2b2e] text-xs sm:text-sm">Status</p>
                <p className="text-sm sm:text-base">{selectedRequest.status}</p>
              </div>
              <div>
                <p className="text-[#db2b2e] text-xs sm:text-sm">Priority</p>
                <p className="text-sm sm:text-base">{selectedRequest.priority}</p>
              </div>
              <div>
                <p className="text-[#db2b2e] text-xs sm:text-sm">Date</p>
                <p className="text-sm sm:text-base">{new Date(selectedRequest.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="mb-3 sm:mb-4">
              <p className="text-[#db2b2e] text-xs sm:text-sm mb-2">Message</p>
              <div className="bg-black/20 p-3 sm:p-4 rounded">
                <p className="text-sm sm:text-base whitespace-pre-wrap">{selectedRequest.message}</p>
              </div>
            </div>

            <div className="mb-3 sm:mb-4">
              <p className="text-[#db2b2e] text-xs sm:text-sm mb-2">Notes</p>
              <textarea
                className="w-full bg-black border border-[#db2b2e]/20 text-white p-3 sm:p-4 rounded focus:border-[#db2b2e] focus:outline-none transition-colors resize-none text-sm"
                rows="4"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this request..."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end pt-4 border-t border-[#db2b2e]/20">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedRequest(null);
                  setNotes('');
                }}
                className="px-3 sm:px-4 py-2 border border-[#db2b2e] text-[#db2b2e] hover:bg-[#db2b2e] hover:text-white transition-colors rounded text-xs sm:text-sm"
              >
                Close
              </button>
              <button
                onClick={() => handleStatusChange(selectedRequest._id, 'resolved')}
                className="px-3 sm:px-4 py-2 bg-[#db2b2e] text-white hover:bg-[#db2b2e]/90 transition-colors rounded text-xs sm:text-sm"
              >
                Mark Resolved
              </button>
              <button
                onClick={() => handleDelete(selectedRequest._id)}
                className="px-3 sm:px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors rounded text-xs sm:text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}