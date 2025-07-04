import { useState, useEffect } from 'react';
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

export default function CadreBackCustomerService() {
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

      const response = await fetch(`/api/support?${queryParams}`, {
        credentials: 'include'
      });
      
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
      const response = await fetch('/api/support/stats', {
        credentials: 'include'
      });
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
      const response = await fetch(`/api/support/${id}`, {
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
    if (!window.confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/support/${id}`, {
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
        const response = await fetch('/api/support/backoffice/statistics?timeframe=365', {
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
    <div className="w-full">
      <PageHeader
        title="Customer Service"
        description="Manage support requests and contact form submissions"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? <GE02Loader size="small" /> : <FiRefreshCw className="w-4 h-4" />}
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExportPDF}
              className="flex items-center gap-2"
            >
              <FiDownload className="w-4 h-4" />
              Export PDF
            </Button>
            {stats && (
              <>
                <Button variant="secondary" icon={FiMessageSquare} size="sm">
                  New: {stats.overview.newRequests}
                </Button>
                <Button variant="secondary" icon={FiClock} size="sm">
                  In Progress: {stats.overview.inProgress}
                </Button>
                <Button variant="secondary" icon={FiStar} size="sm">
                  Resolved: {stats.overview.resolved}
                </Button>
              </>
            )}
          </div>
        }
      />

      <SupportRequestStatistics refreshTrigger={refreshTrigger} />

      <Card className="mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <Search
            onSearch={handleSearch}
            placeholder="Search by name, email, or message..."
            className="w-full md:w-96"
          />
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <FiFilter className="text-[#db2b2e]" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-black text-white px-2 py-1 border border-[#db2b2e] text-sm"
              >
                <option value="all">All Types</option>
                <option value="support">Support</option>
                <option value="contact">Contact</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-black text-white px-2 py-1 border border-[#db2b2e] text-sm"
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
                className="bg-black text-white px-2 py-1 border border-[#db2b2e] text-sm"
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

      <Card>
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
      </Card>

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-black p-4 sm:p-6 border border-[#db2b2e] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 text-[#db2b2e]">
              {selectedRequest.type === 'support' ? 'Support Request' : 'Contact Form'} Details
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div>
                <p className="text-[#db2b2e]">Name</p>
                <p>{selectedRequest.name}</p>
              </div>
              <div>
                <p className="text-[#db2b2e]">Email</p>
                <p className="break-all">{selectedRequest.email}</p>
              </div>
              <div>
                <p className="text-[#db2b2e]">Phone</p>
                <p>{selectedRequest.phone || 'Not provided'}</p>
              </div>
              {selectedRequest.orderNumber && (
                <div>
                  <p className="text-[#db2b2e]">Order Number</p>
                  <p>{selectedRequest.orderNumber}</p>
                </div>
              )}
              <div>
                <p className="text-[#db2b2e]">Category</p>
                <p>{selectedRequest.type === 'contact' ? selectedRequest.reason : selectedRequest.category}</p>
              </div>
              {selectedRequest.specificIssue && (
                <div>
                  <p className="text-[#db2b2e]">Specific Issue</p>
                  <p>{selectedRequest.specificIssue}</p>
                </div>
              )}
            </div>

            <div className="mb-4">
              <p className="text-[#db2b2e]">Message</p>
              <p className="bg-black border border-[#db2b2e] p-3 whitespace-pre-wrap">{selectedRequest.message}</p>
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-[#db2b2e]">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-black border border-[#db2b2e] p-3 focus:border-[#db2b2e] focus:ring-1 focus:ring-[#db2b2e] outline-none resize-none"
                rows="4"
                placeholder="Add notes about how this case was handled..."
              ></textarea>
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-[#db2b2e]">Update Status</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['new', 'in-progress', 'resolved', 'closed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(selectedRequest._id, status)}
                    className={`p-2 border ${
                      selectedRequest.status === status
                        ? 'border-[#db2b2e] bg-[#db2b2e] text-white'
                        : 'border-[#db2b2e] text-[#db2b2e] hover:bg-[#db2b2e] hover:text-white'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(selectedRequest._id)}
              >
                Delete Request
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowDetailsModal(false);
                  setNotes('');
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}