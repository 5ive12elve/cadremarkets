import { useState, useEffect } from 'react';
import { backofficeApiRequest, isBackofficeAuthenticated } from '../backUtils/cadreBackAuth';
import { FiFilter, FiSearch, FiX, FiRefreshCw, FiDownload } from 'react-icons/fi';
import PageHeader from '../components/shared/PageHeader';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';
import ServiceStatistics from '../components/shared/ServiceStatistics';
import GE02Loader from '../components/GE02Loader';
import pdfExporter from '../utils/pdfExporter';
import toast from 'react-hot-toast';
import { getApiUrl } from '../utils/apiConfig';

const CadreBackServices = () => {
    // Check authentication on component mount
    useEffect(() => {
        if (!isBackofficeAuthenticated()) {
            window.location.href = '/cadreBack/login';
        }
    }, []);

    const [services, setServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedService, setSelectedService] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await backofficeApiRequest('/services');
      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
      setServices(data);
      setFilteredServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSearch = (value) => {
    setSearchTerm(value);
    const filtered = services.filter(service => 
      service.requesterName.toLowerCase().includes(value.toLowerCase()) ||
      service.email.toLowerCase().includes(value.toLowerCase()) ||
      service.serviceType.toLowerCase().includes(value.toLowerCase()) ||
      service.subType.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredServices(filtered);
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
    if (status === 'all') {
      setFilteredServices(services);
    } else {
      const filtered = services.filter(service => service.status === status);
      setFilteredServices(filtered);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(getApiUrl(`api/services/${id}/status`), {
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
      setSelectedService(null);
      setNotes('');
      fetchServices();
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const statusFilters = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Completed', value: 'completed' }
  ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-[#f3eb4b]/10 text-[#f3eb4b]';
      case 'approved':
        return 'bg-[#db2b2e]/10 text-[#db2b2e]';
      case 'rejected':
        return 'bg-red-500/10 text-red-500';
      case 'completed':
        return 'bg-[#db2b2e]/10 text-[#db2b2e]';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchServices();
    toast.success('Services refreshed successfully');
  };

  const handleExportPDF = async () => {
    try {
      toast.loading('Generating PDF report...');
      
      // Calculate basic stats
      const stats = {
        total: services.length,
        pending: services.filter(s => s.status === 'pending').length,
        approved: services.filter(s => s.status === 'approved').length,
        rejected: services.filter(s => s.status === 'rejected').length,
        completed: services.filter(s => s.status === 'completed').length
      };

      await pdfExporter.exportServicesPDF(filteredServices, stats);
      toast.dismiss();
      toast.success('PDF exported successfully!');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to export PDF');
      console.error('Error exporting PDF:', error);
    }
  };

      return (
      <div className="w-full md:pt-0 pt-16 overflow-x-hidden">
      <PageHeader
        title="Services"
        description="Manage and monitor all services"
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
          </div>
        }
      />

      <ServiceStatistics refreshTrigger={refreshTrigger} />

      <Card className="mb-4 sm:mb-6 max-w-full overflow-x-hidden">
        {/* Filters */}
        <div className="bg-black border border-[#db2b2e] p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 lg:mb-8">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
              <input
                type="text"
                placeholder="Search services..."
                className="w-full bg-black border border-[#db2b2e]/20 text-white pl-10 pr-4 py-2 focus:border-[#db2b2e] focus:outline-none transition-colors text-xs sm:text-sm"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => handleSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 lg:gap-4">
              <FiFilter className="text-white/60" />
              <div className="flex flex-wrap gap-2">
                {statusFilters.map(filter => (
                  <button
                    key={filter.value}
                    onClick={() => handleStatusFilter(filter.value)}
                    className={`px-2 sm:px-3 lg:px-4 py-2 text-xs sm:text-sm transition-colors ${
                      selectedStatus === filter.value
                        ? 'bg-[#db2b2e] text-white'
                        : 'border border-[#db2b2e]/20 text-white/60 hover:border-[#db2b2e] hover:text-white'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Services Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <GE02Loader size="large" message="Loading services..." />
          </div>
        ) : (
          <div className="bg-black border border-[#db2b2e] overflow-hidden max-w-full overflow-x-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#db2b2e]">
                    <th className="text-left p-4 text-white/60 font-medium">Request ID</th>
                    <th className="text-left p-4 text-white/60 font-medium">Requester</th>
                    <th className="text-left p-4 text-white/60 font-medium">Service Type</th>
                    <th className="text-left p-4 text-white/60 font-medium">Status</th>
                    <th className="text-left p-4 text-white/60 font-medium">Created</th>
                    <th className="text-right p-4 text-white/60 font-medium">Budget</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredServices.map((service) => (
                    <tr
                      key={service._id}
                      className="border-b border-[#db2b2e]/20 hover:bg-[#db2b2e]/5 cursor-pointer"
                      onClick={() => {
                        setSelectedService(service);
                        setShowDetailsModal(true);
                      }}
                    >
                      <td className="p-4">
                        <p className="text-white font-medium">{service.requestId}</p>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-white">{service.requesterName}</p>
                          <p className="text-white/60 text-sm">{service.email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-white">{service.serviceType}</p>
                          <p className="text-white/60 text-sm">{service.subType}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 text-sm ${getStatusColor(service.status)}`}>
                          {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-white/60">
                          {new Date(service.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-white font-medium">
                          {service.budget}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3 p-4">
              {filteredServices.map((service) => (
                <div
                  key={service._id}
                  className="border border-[#db2b2e]/20 p-4 rounded cursor-pointer hover:bg-[#db2b2e]/5 transition-colors"
                  onClick={() => {
                    setSelectedService(service);
                    setShowDetailsModal(true);
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white text-sm mb-1">#{service.requestId}</h3>
                      <p className="text-white/60 text-xs">{service.requesterName}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs ${getStatusColor(service.status)}`}>
                      {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-white text-sm">{service.serviceType}</p>
                      <p className="text-white/60 text-xs">{service.subType}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/60 text-xs">
                        {new Date(service.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-white font-medium text-sm">
                        {service.budget}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Details Modal */}
      {showDetailsModal && selectedService && (
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-50 p-2 sm:p-4 overflow-y-auto">
          <div className="bg-black border border-[#db2b2e] w-full max-w-2xl my-4 sm:my-8 relative">
            <button
              onClick={() => {
                setShowDetailsModal(false);
                setSelectedService(null);
                setNotes('');
              }}
              className="absolute top-2 sm:top-4 right-2 sm:right-4 text-white/60 hover:text-white transition-colors p-2 z-10"
            >
              <FiX className="w-5 h-5" />
            </button>

            <div className="p-3 sm:p-4 lg:p-6">
              <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-[#db2b2e] mb-3 sm:mb-4 lg:mb-6 pr-8">Service Request Details</h3>

              <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-6">
                  <div>
                    <p className="text-white/60 text-xs sm:text-sm mb-1">Request ID</p>
                    <p className="text-white font-medium text-sm sm:text-base">{selectedService.requestId}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs sm:text-sm mb-1">Status</p>
                    <span className={`px-2 sm:px-3 py-1 text-xs sm:text-sm inline-block ${getStatusColor(selectedService.status)}`}>
                      {selectedService.status.charAt(0).toUpperCase() + selectedService.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs sm:text-sm mb-1">Requester Name</p>
                    <p className="text-white font-medium text-sm sm:text-base">{selectedService.requesterName}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs sm:text-sm mb-1">Contact</p>
                    <p className="text-white font-medium break-words text-sm sm:text-base">{selectedService.email}</p>
                    <p className="text-white/60 text-xs sm:text-sm mt-1">{selectedService.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs sm:text-sm mb-1">Service Type</p>
                    <p className="text-white font-medium text-sm sm:text-base">{selectedService.serviceType}</p>
                    <p className="text-white/60 text-xs sm:text-sm mt-1">{selectedService.subType}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs sm:text-sm mb-1">Budget</p>
                    <p className="text-white font-medium text-sm sm:text-base">{selectedService.budget}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs sm:text-sm mb-1">Design Stage</p>
                    <p className="text-white font-medium text-sm sm:text-base">{selectedService.designStage}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs sm:text-sm mb-1">Project Scope</p>
                    <p className="text-white font-medium text-sm sm:text-base">{selectedService.projectScope}</p>
                  </div>
                </div>

                {/* Additional Details */}
                {selectedService.details && (
                  <div>
                    <p className="text-white/60 text-xs sm:text-sm mb-2">Additional Details</p>
                    <div className="bg-black/20 p-3 sm:p-4 rounded">
                      <p className="text-white whitespace-pre-wrap text-sm sm:text-base">{selectedService.details}</p>
                    </div>
                  </div>
                )}

                {/* Notes Section */}
                <div>
                  <p className="text-white/60 text-xs sm:text-sm mb-2">Notes</p>
                  <textarea
                    className="w-full bg-black border border-[#db2b2e]/20 text-white p-3 sm:p-4 rounded focus:border-[#db2b2e] focus:outline-none transition-colors resize-none text-sm"
                    rows="4"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this service request..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 sm:gap-3 justify-end pt-4 border-t border-[#db2b2e]/20">
                  {selectedService.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(selectedService._id, 'rejected')}
                        className="px-2 sm:px-3 lg:px-4 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors rounded text-xs sm:text-sm"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedService._id, 'approved')}
                        className="px-2 sm:px-3 lg:px-4 py-2 bg-[#db2b2e] text-white hover:bg-[#db2b2e]/90 transition-colors rounded text-xs sm:text-sm"
                      >
                        Approve
                      </button>
                    </>
                  )}
                  {selectedService.status === 'approved' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(selectedService._id, 'rejected')}
                        className="px-2 sm:px-3 lg:px-4 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors rounded text-xs sm:text-sm"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedService._id, 'completed')}
                        className="px-2 sm:px-3 lg:px-4 py-2 bg-[#db2b2e] text-white hover:bg-[#db2b2e]/90 transition-colors rounded text-xs sm:text-sm"
                      >
                        Complete
                      </button>
                    </>
                  )}
                  {(selectedService.status === 'rejected' || selectedService.status === 'completed') && (
                    <button
                      onClick={() => handleStatusChange(selectedService._id, 'pending')}
                      className="px-2 sm:px-3 lg:px-4 py-2 border border-[#db2b2e] text-[#db2b2e] hover:bg-[#db2b2e]/10 transition-colors rounded text-xs sm:text-sm"
                    >
                      Reopen
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CadreBackServices;