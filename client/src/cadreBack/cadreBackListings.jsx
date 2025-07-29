import { useEffect, useState } from 'react';
import { FiImage, FiX, FiDollarSign, FiMapPin, FiBox, FiTag, FiClock, FiSearch, FiRefreshCw, FiDownload } from 'react-icons/fi';
import PageHeader from '../components/shared/PageHeader';
import Card from '../components/shared/Card';
import Table from '../components/shared/Table';
import ListingStatistics from '../components/shared/ListingStatistics';
import Button from '../components/shared/Button';
import GE02Loader from '../components/GE02Loader';
import pdfExporter from '../utils/pdfExporter';
import toast from 'react-hot-toast';
import { getMainImageUrl, processImageUrls } from '../utils/imageUtils';
import { backofficeApiRequest, isBackofficeAuthenticated } from '../backUtils/cadreBackAuth';
import useConfirmDialog from '../hooks/useConfirmDialog';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const LISTING_STATUSES = {
    PENDING: 'Pending',
    FOR_SALE: 'For Sale',
    CONFIRMED: 'Confirmed',
    SOLD: 'Sold',
    CANCELLED: 'Cancelled'
};

const CadreBackListings = () => {
    // Check authentication on component mount
    useEffect(() => {
        if (!isBackofficeAuthenticated()) {
            window.location.href = '/cadreBack/login';
        }
    }, []);

    const { confirm, dialogProps } = useConfirmDialog();
    const [listings, setListings] = useState([]);
    const [filteredListings, setFilteredListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedListing, setSelectedListing] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showServiceRequests, setShowServiceRequests] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        try {
            setLoading(true);
            const response = await backofficeApiRequest('/listing/backoffice/all');
            if (!response.ok) {
                toast.error('Failed to fetch listings');
                throw new Error('Failed to fetch listings');
            }

            const data = await response.json();
            setListings(data);
            setFilteredListings(data);
        } catch (err) {
            console.error('Error fetching listings:', err);
            toast.error('Failed to fetch listings');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value) => {
        setSearchQuery(value);
        filterListings(value, selectedStatus, showServiceRequests);
    };

    const handleStatusFilter = (status) => {
        setSelectedStatus(status);
        filterListings(searchQuery, status, showServiceRequests);
    };

    const handleServiceFilter = (showService) => {
        setShowServiceRequests(showService);
        filterListings(searchQuery, selectedStatus, showService);
    };

    const filterListings = (search, status, showService) => {
        let filtered = [...listings];

        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(listing =>
                listing.name?.toLowerCase().includes(searchLower) ||
                listing.type?.toLowerCase().includes(searchLower) ||
                listing.city?.toLowerCase().includes(searchLower)
            );
        }

        if (status) {
            filtered = filtered.filter(listing => listing.status === status);
        }

        if (showService) {
            filtered = filtered.filter(listing => listing.cadremarketsService === true);
        }

        setFilteredListings(filtered);
    };

    const handleStatusChange = async (listingId, newStatus) => {
        try {
            setUpdatingStatus(true);
            const response = await backofficeApiRequest(`/listing/${listingId}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update status');
            }

            // Update the listings in both arrays
            setListings(prev =>
                prev.map(listing =>
                    listing._id === listingId
                        ? { ...listing, status: newStatus }
                        : listing
                )
            );
            setFilteredListings(prev =>
                prev.map(listing =>
                    listing._id === listingId
                        ? { ...listing, status: newStatus }
                        : listing
                )
            );
            
            // Update the selected listing to reflect the new status
            setSelectedListing(prev => 
                prev ? { ...prev, status: newStatus } : null
            );
            
            // Trigger statistics refresh
            setRefreshTrigger(prev => prev + 1);
            
            toast.success('Status updated successfully');
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error(error.message || 'Failed to update status');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleDeleteListing = async (listingId) => {
        const confirmed = await confirm(
            'Are you sure you want to delete this listing? This action cannot be undone.',
            'Delete Listing',
            'danger'
        );
        
        if (!confirmed) {
            return;
        }

        try {
            const response = await backofficeApiRequest(`/listing/delete/${listingId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete listing');

            setListings(prev => prev.filter(listing => listing._id !== listingId));
            setFilteredListings(prev => prev.filter(listing => listing._id !== listingId));
            setSelectedListing(null);
            
            // Trigger statistics refresh
            setRefreshTrigger(prev => prev + 1);
            
            toast.success('Listing deleted successfully');
        } catch (error) {
            console.error('Error deleting listing:', error);
            toast.error('Failed to delete listing');
        }
    };

    const handleRefresh = () => {
        setLoading(true);
        fetchListings();
        toast.success('Listings refreshed successfully');
    };

    const handleExportPDF = async () => {
        try {
            toast.loading('Generating comprehensive PDF report...');
            
            // Fetch detailed statistics
            let detailedStats = null;
            try {
                const response = await backofficeApiRequest('/listing/backoffice/statistics?timeframe=365');
                if (response.ok) {
                    detailedStats = await response.json();
                }
            } catch (error) {
                console.error('Failed to fetch detailed statistics:', error);
            }

            // Calculate basic stats as fallback
            const stats = {
                total: listings.length,
                active: listings.filter(l => l.status === 'For Sale').length,
                pending: listings.filter(l => l.status === 'Pending').length,
                sold: listings.filter(l => l.status === 'Sold').length
            };

            await pdfExporter.exportListingsPDF(filteredListings, stats, detailedStats);
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
            header: 'Listing',
            key: 'name',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-black border border-[#db2b2e]/20 flex items-center justify-center overflow-hidden">
                        {row.imageUrls?.[0] ? (
                            <img 
                                src={getMainImageUrl(row.imageUrls)} 
                                alt={row.name} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : (
                            <FiImage className="w-6 h-6 text-gray-400" />
                        )}
                        <FiImage className="w-6 h-6 text-gray-400 hidden" />
                    </div>
                    <div>
                        <p className="font-medium text-white">{row.name}</p>
                        <p className="text-sm text-gray-400">{row.type}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Type',
            key: 'listingType',
            render: (row) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <FiBox className="text-[#db2b2e]" />
                        <span className={`text-sm px-2 py-0.5 ${
                            row.listingType === 'unique' 
                                ? 'bg-[#db2b2e]/10 text-[#db2b2e]' 
                                : 'bg-black text-gray-400'
                        }`}>
                            {row.listingType === 'unique' ? 'Unique' : 'Stock'}
                        </span>
                    </div>
                </div>
            )
        },
        {
            header: 'Price & Status',
            key: 'price',
            render: (row) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <FiDollarSign className="text-[#db2b2e]" />
                        <span className="font-medium text-white">
                            {row.price?.toLocaleString()} EGP
                        </span>
                    </div>
                    <div className={`text-sm px-2 py-0.5 inline-flex items-center gap-1 ${
                        row.status === 'For Sale' 
                            ? 'bg-[#db2b2e]/10 text-[#db2b2e]'
                            : row.status === 'Pending'
                            ? 'bg-[#db2b2e]/10 text-[#db2b2e]'
                            : row.status === 'Sold'
                            ? 'bg-[#db2b2e]/10 text-[#db2b2e]'
                            : 'bg-black text-gray-400'
                    }`}>
                        <FiTag className="w-3 h-3" />
                        {row.status}
                    </div>
                </div>
            )
        },
        {
            header: 'Location',
            key: 'location',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <FiMapPin className="text-[#db2b2e]" />
                    <span className="text-white">{row.city}{row.district ? `, ${row.district}` : ''}</span>
                </div>
            )
        },
        {
            header: 'Created',
            key: 'createdAt',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <FiClock className="text-[#db2b2e]" />
                    <span className="text-gray-400">
                        {new Date(row.createdAt).toLocaleDateString()}
                    </span>
                </div>
            )
        }
    ];

      return (
    <div className="w-full md:pt-0 pt-16">
            <PageHeader
                title="Listings Management"
                description="Manage and monitor all listings"
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

            {/* Statistics Dashboard */}
            <ListingStatistics refreshTrigger={refreshTrigger} />

            <Card className="mb-4 sm:mb-6">
                <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Search listings..."
                            className="w-full bg-black border border-[#db2b2e] px-4 py-2 text-white focus:outline-none text-sm"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                        <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-[#db2b2e]" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm ${
                                selectedStatus === ''
                                    ? 'bg-[#db2b2e] text-white'
                                    : 'border border-[#db2b2e] text-[#db2b2e] hover:bg-[#db2b2e] hover:text-white'
                            } transition-colors`}
                            onClick={() => handleStatusFilter('')}
                        >
                            All
                        </button>
                        {Object.values(LISTING_STATUSES).map(status => (
                            <button
                                key={status}
                                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm ${
                                    selectedStatus === status
                                        ? 'bg-[#db2b2e] text-white'
                                        : 'border border-[#db2b2e] text-[#db2b2e] hover:bg-[#db2b2e] hover:text-white'
                                } transition-colors`}
                                onClick={() => handleStatusFilter(status)}
                            >
                                {status}
                            </button>
                        ))}
                        <button
                            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm ${
                                showServiceRequests
                                    ? 'bg-[#db2b2e] text-white'
                                    : 'border border-[#db2b2e] text-[#db2b2e] hover:bg-[#db2b2e] hover:text-white'
                            } transition-colors`}
                            onClick={() => handleServiceFilter(!showServiceRequests)}
                        >
                            Service
                        </button>
                    </div>
                </div>
            </Card>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <GE02Loader size="large" message="Loading listings..." />
                </div>
            ) : (
                <Card className="border border-[#db2b2e]/20 bg-black">
                    {/* Desktop Table */}
                    <div className="hidden md:block">
                        <Table
                            columns={columns}
                            data={filteredListings}
                            onRowClick={(row) => setSelectedListing(row)}
                            loading={loading}
                        />
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-3 p-4">
                        {filteredListings.map((listing) => (
                            <div
                                key={listing._id}
                                className="border border-[#db2b2e]/20 p-4 rounded cursor-pointer hover:bg-[#db2b2e]/5 transition-colors"
                                onClick={() => setSelectedListing(listing)}
                            >
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="w-16 h-16 bg-black border border-[#db2b2e]/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {listing.imageUrls?.[0] ? (
                                            <img 
                                                src={getMainImageUrl(listing.imageUrls)} 
                                                alt={listing.name} 
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : (
                                            <FiImage className="w-6 h-6 text-gray-400" />
                                        )}
                                        <FiImage className="w-6 h-6 text-gray-400 hidden" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-white text-sm mb-1 truncate">{listing.name}</h3>
                                        <p className="text-gray-400 text-xs mb-2">{listing.type}</p>
                                        <div className="flex items-center gap-2 mb-2">
                                            <FiMapPin className="text-[#db2b2e] w-3 h-3" />
                                            <span className="text-white text-xs">{listing.city}{listing.district ? `, ${listing.district}` : ''}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <FiDollarSign className="text-[#db2b2e] w-3 h-3" />
                                        <span className="font-medium text-white text-sm">
                                            {listing.price?.toLocaleString()} EGP
                                        </span>
                                    </div>
                                    <div className={`text-xs px-2 py-1 inline-flex items-center gap-1 ${
                                        listing.status === 'For Sale' 
                                            ? 'bg-[#db2b2e]/10 text-[#db2b2e]'
                                            : listing.status === 'Pending'
                                            ? 'bg-[#db2b2e]/10 text-[#db2b2e]'
                                            : listing.status === 'Sold'
                                            ? 'bg-[#db2b2e]/10 text-[#db2b2e]'
                                            : 'bg-black text-gray-400'
                                    }`}>
                                        <FiTag className="w-2 h-2" />
                                        {listing.status}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FiBox className="text-[#db2b2e] w-3 h-3" />
                                        <span className={`text-xs px-2 py-0.5 ${
                                            listing.listingType === 'unique' 
                                                ? 'bg-[#db2b2e]/10 text-[#db2b2e]' 
                                                : 'bg-black text-gray-400'
                                        }`}>
                                            {listing.listingType === 'unique' ? 'Unique' : 'Stock'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FiClock className="text-[#db2b2e] w-3 h-3" />
                                        <span className="text-gray-400 text-xs">
                                            {new Date(listing.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Listing Details Modal */}
            {selectedListing && (
                <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-40 p-2 sm:p-4">
                    <div className="bg-black border border-[#db2b2e]/20 w-full max-w-4xl max-h-[95vh] overflow-y-auto p-3 sm:p-6 relative">
                        <button
                            onClick={() => setSelectedListing(null)}
                            className="absolute top-2 sm:top-4 right-2 sm:right-4 text-gray-400 hover:text-white p-2 z-10"
                        >
                            <FiX size={20} />
                        </button>

                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 text-[#db2b2e] pr-8">Listing Details</h2>
                        
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-6">
                            <div>
                                <p className="text-gray-400 text-xs sm:text-sm">Name</p>
                                <p className="font-semibold text-white text-sm sm:text-base">{selectedListing.name}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs sm:text-sm">Status</p>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                    <select
                                        value={selectedListing.status}
                                        onChange={(e) => handleStatusChange(selectedListing._id, e.target.value)}
                                        disabled={updatingStatus}
                                        className={`bg-black border border-[#db2b2e] text-white px-3 py-2 focus:outline-none focus:border-[#db2b2e] hover:border-[#db2b2e]/80 text-xs sm:text-sm ${
                                            updatingStatus ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="For Sale">For Sale</option>
                                        <option value="Confirmed">Confirmed</option>
                                        <option value="Sold">Sold</option>
                                    </select>
                                    {updatingStatus && (
                                        <GE02Loader size="small" />
                                    )}
                                    <span className={`px-2 py-1 text-xs sm:text-sm ${
                                        selectedListing.status === 'For Sale' 
                                            ? 'bg-green-500/10 text-green-500'
                                            : selectedListing.status === 'Pending'
                                            ? 'bg-yellow-500/10 text-yellow-500'
                                            : selectedListing.status === 'Confirmed'
                                            ? 'bg-blue-500/10 text-blue-500'
                                            : selectedListing.status === 'Sold'
                                            ? 'bg-[#db2b2e]/10 text-[#db2b2e]'
                                            : 'bg-gray-500/10 text-gray-500'
                                    }`}>
                                    {selectedListing.status}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs sm:text-sm">Type</p>
                                <p className="font-semibold text-white text-sm sm:text-base">{selectedListing.type}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs sm:text-sm">Price</p>
                                <p className="font-semibold text-white text-sm sm:text-base">{selectedListing.price?.toLocaleString()} EGP</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs sm:text-sm">Created At</p>
                                <p className="font-semibold text-white text-sm sm:text-base">{new Date(selectedListing.createdAt).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs sm:text-sm">Listing Type</p>
                                <p className="font-semibold text-white text-sm sm:text-base">{selectedListing.listingType}</p>
                            </div>
                        </div>

                        {/* Image Gallery */}
                        <div className="mb-4 sm:mb-6">
                            <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-3 sm:mb-4 text-[#db2b2e]">Images</h3>
                            {selectedListing.imageUrls && selectedListing.imageUrls.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
                                    {processImageUrls(selectedListing.imageUrls).map((imageUrl, index) => (
                                        <div 
                                            key={index} 
                                            className="relative group cursor-pointer"
                                            onClick={() => {
                                                // Open image in new tab for full view
                                                window.open(imageUrl, '_blank');
                                            }}
                                        >
                                            <div className="aspect-square bg-black border border-[#db2b2e]/20 overflow-hidden hover:border-[#db2b2e] transition-colors">
                                                <img
                                                    src={imageUrl}
                                                    alt={`${selectedListing.name} - Image ${index + 1}`}
                                                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                                <div className="hidden w-full h-full bg-gray-900 border-2 border-dashed border-[#db2b2e]/30 flex items-center justify-center">
                                                    <div className="text-center text-gray-400">
                                                        <FiImage className="w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-[#db2b2e]/50" />
                                                        <p className="text-xs">Image not available</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                                <p className="text-white text-xs font-medium text-center px-1 sm:px-2">Click to view full size</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-20 sm:h-24 lg:h-32 bg-gray-900 border-2 border-dashed border-[#db2b2e]/30">
                                    <div className="text-center text-gray-400">
                                        <div className="mb-1 sm:mb-2">
                                            <img 
                                                src="/mediassets/Filter05.png" 
                                                alt="" 
                                                className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 mx-auto opacity-20 mb-1 sm:mb-2"
                                            />
                                        </div>
                                        <FiImage className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 mx-auto mb-1 sm:mb-2 text-[#db2b2e]/50" />
                                        <p className="text-xs sm:text-sm">No images available for this listing</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quantity Information */}
                        <div className="mb-4 sm:mb-6">
                            <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-3 sm:mb-4 text-[#db2b2e]">Quantity Information</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
                                <div>
                                    <p className="text-gray-400 text-xs sm:text-sm">Initial Quantity</p>
                                    <p className="font-semibold text-white text-sm sm:text-base">{selectedListing.initialQuantity}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs sm:text-sm">Current Quantity</p>
                                    <p className="font-semibold text-white text-sm sm:text-base">{selectedListing.currentQuantity}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs sm:text-sm">Sold Quantity</p>
                                    <p className="font-semibold text-white text-sm sm:text-base">{selectedListing.soldQuantity || 0}</p>
                                </div>
                            </div>
                        </div>

                        {/* Location Information */}
                        <div className="mb-4 sm:mb-6">
                            <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-3 sm:mb-4 text-[#db2b2e]">Location Information</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                                <div>
                                    <p className="text-gray-400 text-xs sm:text-sm">City</p>
                                    <p className="font-semibold text-white text-sm sm:text-base">{selectedListing.city}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs sm:text-sm">District</p>
                                    <p className="font-semibold text-white text-sm sm:text-base">{selectedListing.district}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs sm:text-sm">Address</p>
                                    <p className="font-semibold text-white text-sm sm:text-base">{selectedListing.address}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs sm:text-sm">Contact Preference</p>
                                    <p className="font-semibold text-white text-sm sm:text-base">{selectedListing.contactPreference}</p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-4 sm:mb-6">
                            <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-3 sm:mb-4 text-[#db2b2e]">Description</h3>
                            <p className="text-white whitespace-pre-wrap text-sm sm:text-base">{selectedListing.description}</p>
                        </div>

                        {/* Dimensions */}
                        <div className="mb-4 sm:mb-6">
                            <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-3 sm:mb-4 text-[#db2b2e]">Dimensions</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
                                <div>
                                    <p className="text-gray-400 text-xs sm:text-sm">Width</p>
                                    <p className="font-semibold text-white text-sm sm:text-base">{selectedListing.width} cm</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs sm:text-sm">Height</p>
                                    <p className="font-semibold text-white text-sm sm:text-base">{selectedListing.height} cm</p>
                                </div>
                                {selectedListing.depth && (
                                    <div>
                                        <p className="text-gray-400 text-xs sm:text-sm">Depth</p>
                                        <p className="font-semibold text-white text-sm sm:text-base">{selectedListing.depth} cm</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Platform Information */}
                        <div className="mb-4 sm:mb-6">
                            <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-3 sm:mb-4 text-[#db2b2e]">Platform Information</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                                <div>
                                    <p className="text-gray-400 text-xs sm:text-sm">Cadre Profit</p>
                                    <p className="font-semibold text-white text-sm sm:text-base">{selectedListing.cadreProfit?.toLocaleString()} EGP</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs sm:text-sm">Cadremarkets Service</p>
                                    <p className="font-semibold text-white text-sm sm:text-base">{selectedListing.cadremarketsService ? 'Yes' : 'No'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                                <button
                                onClick={() => setSelectedListing(null)}
                                className="px-3 sm:px-4 py-2 border border-[#db2b2e] text-[#db2b2e] hover:bg-[#db2b2e] hover:text-white transition text-xs sm:text-sm"
                                >
                                Close
                                </button>
                            <button
                                onClick={() => handleDeleteListing(selectedListing._id)}
                                className="px-3 sm:px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition text-xs sm:text-sm"
                            >
                                Delete Listing
                            </button>
                        </div>
                    </div>
                </div>
            )}

      <ConfirmDialog {...dialogProps} />
        </div>
    );
};

export default CadreBackListings;