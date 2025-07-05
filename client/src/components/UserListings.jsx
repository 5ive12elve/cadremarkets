import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiAlertCircle, FiBox, FiEye, FiPhone } from 'react-icons/fi';
import toast from 'react-hot-toast';
import PropTypes from 'prop-types';
import ConfirmDialog from './ui/ConfirmDialog';
import { useLanguage } from '../contexts/LanguageContext';
import { getPageTranslations } from '../locales/translations';
import { getMainImageUrl } from '../utils/imageUtils';
import { migrateListingImages, needsMigration } from '../utils/imageMigration';
import { apiCall } from '../utils/apiConfig';

export default function UserListings({ userId }) {
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [migrating, setMigrating] = useState(false);
    
    // Language context
    const { currentLang, isArabic } = useLanguage();
    const t = getPageTranslations('profile', currentLang);
    const common = getPageTranslations('common', currentLang);
    
    // Confirm dialog state
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null
    });

    useEffect(() => {
        fetchListings();
    }, [userId]);

    const fetchListings = async () => {
        try {
            setLoading(true);
            const data = await apiCall(`/api/user/listings/${userId}`);
            setListings(data);
        } catch {
            setError('Error fetching listings');
        } finally {
            setLoading(false);
        }
    };

    const showConfirmDialog = (title, message, onConfirm) => {
        setConfirmDialog({
            isOpen: true,
            title,
            message,
            onConfirm
        });
    };

    const closeConfirmDialog = () => {
        setConfirmDialog({
            isOpen: false,
            title: '',
            message: '',
            onConfirm: null
        });
    };

    const handleDelete = async (listingId) => {
        showConfirmDialog(
            t.deleteListing || 'Delete Listing',
            t.deleteListingConfirm || 'Are you sure you want to delete this listing? This action cannot be undone.',
            async () => {
                try {
                    await apiCall(`/api/listing/delete/${listingId}`, {
                        method: 'DELETE',
                    });
                    setListings((prev) => prev.filter((listing) => listing._id !== listingId));
                    toast.success(common.listingDeleted);
                } catch {
                    toast.error(common.errorDeletingListing);
                }
            }
        );
    };

    const getStatusMessage = (status) => {
        switch (status) {
            case 'Pending':
                return t.statusPending || 'Your listing is pending approval from Cadremarkets team.';
            case 'For Sale':
                return t.statusForSale || 'Your listing is live and available for purchase. Contact Cadremarkets for any changes.';
            case 'Confirmed':
                return t.statusConfirmed || 'Action Required: A customer has purchased this item. Please prepare it for shipping to Cadremarkets as soon as possible.';
            case 'Sold':
                return t.statusSold || 'This listing has been sold successfully.';
            default:
                return '';
        }
    };

    const getStatusNameTranslated = (status) => {
        switch (status) {
            case 'Pending':
                return t.pending || 'Pending';
            case 'For Sale':
                return t.forSale || 'For Sale';
            case 'Confirmed':
                return t.confirmed || 'Confirmed';
            case 'Sold':
                return t.sold || 'Sold';
            default:
                return status;
        }
    };

    const getNoListingsMessage = (activeTab) => {
        if (activeTab === 'all') {
            return common.noListingsYet;
        }
        
        if (isArabic) {
            // For Arabic, use proper translations for each status
            switch (activeTab) {
                case 'Pending':
                    return 'لا توجد إعلانات قيد المراجعة';
                case 'For Sale':
                    return 'لا توجد إعلانات للبيع';
                case 'Confirmed':
                    return 'لا توجد إعلانات مؤكدة';
                case 'Sold':
                    return 'لا توجد إعلانات مُباعة';
                default:
                    return 'لا توجد إعلانات';
            }
        } else {
            // For English, use the existing structure
            const statusName = getStatusNameTranslated(activeTab);
            return `You don't have any ${statusName.toLowerCase()} listings.`;
        }
    };

    const filteredListings = listings.filter(listing => {
        if (activeTab === 'all') return true;
        return listing.status === activeTab;
    });

    const tabs = [
        { id: 'all', label: t.allListings || 'All Listings' },
        { id: 'Pending', label: t.pending || 'Pending' },
        { id: 'For Sale', label: t.forSale || 'For Sale' },
        { id: 'Confirmed', label: t.confirmed || 'Confirmed' },
        { id: 'Sold', label: t.sold || 'Sold' }
    ];

    const getListingCount = (status) => {
        if (status === 'all') return listings.length;
        return listings.filter(listing => listing.status === status).length;
    };

    // Check if any listings need migration
    const listingsNeedingMigration = listings.filter(listing => 
        listing.imageUrls?.some(url => needsMigration(url))
    );

    const handleMigrateImages = async () => {
        if (listingsNeedingMigration.length === 0) {
            toast.success('All images are already migrated!');
            return;
        }

        setMigrating(true);
        let migratedCount = 0;

        try {
            for (const listing of listingsNeedingMigration) {
                try {
                    const migratedListing = await migrateListingImages(listing);
                    
                    // Update the listing in the database
                    await apiCall(`/api/listing/update/${listing._id}`, {
                        method: 'PUT',
                        body: JSON.stringify({
                            imageUrls: migratedListing.imageUrls
                        }),
                    });
                    
                    migratedCount++;
                    // Update local state
                    setListings(prev => prev.map(l => 
                        l._id === listing._id ? { ...l, imageUrls: migratedListing.imageUrls } : l
                    ));
                } catch (error) {
                    console.error(`Failed to migrate listing ${listing._id}:`, error);
                }
            }

            if (migratedCount > 0) {
                toast.success(`Successfully migrated ${migratedCount} listings!`);
            } else {
                toast.error('Failed to migrate any listings. Please try again.');
            }
        } catch {
            toast.error('Migration failed. Please try again.');
        } finally {
            setMigrating(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 relative">
                <div className="absolute inset-0 border-t-2 border-r-2 border-[#db2b2e] animate-spin"></div>
            </div>
        </div>
    );
    
    if (error) return (
        <div className="p-4 border border-[#db2b2e] bg-[#db2b2e]/5 text-[#db2b2e]">
            {error}
        </div>
    );

    return (
        <>
            <div dir={isArabic ? 'rtl' : 'ltr'}>
                {/* Tabs and Migration Button */}
                <div className="flex flex-wrap gap-4 mb-8 items-center justify-between">
                    <div className="flex flex-wrap gap-4">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-3 font-semibold transition-colors ${isArabic ? 'font-noto' : 'font-nt'} ${
                                    activeTab === tab.id
                                        ? 'bg-[#db2b2e] text-white'
                                        : 'bg-white dark:bg-black border border-[#db2b2e] text-[#db2b2e] hover:bg-[#db2b2e] hover:text-white'
                                }`}
                            >
                                {tab.label} ({getListingCount(tab.id)})
                            </button>
                        ))}
                    </div>
                    
                    {/* Migration Button */}
                    {listingsNeedingMigration.length > 0 && (
                        <button
                            onClick={handleMigrateImages}
                            disabled={migrating}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${
                                migrating 
                                    ? 'bg-gray-500 text-white cursor-not-allowed' 
                                    : 'bg-[#db2b2e] text-white hover:bg-[#db2b2e]/90'
                            } ${isArabic ? 'font-noto' : 'font-nt'}`}
                        >
                            {migrating ? 'Migrating...' : `Migrate ${listingsNeedingMigration.length} Listing(s)`}
                        </button>
                    )}
                </div>

                {/* Listings Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {filteredListings.map((listing) => (
                        <div
                            key={listing._id}
                            className="group relative bg-white dark:bg-black border border-[#db2b2e] hover:border-[#db2b2e]/80 transition-colors duration-300 flex flex-col"
                        >
                            {/* Listing Image with Sharp Edges */}
                            <div className="h-[200px] sm:h-[250px] md:h-[300px] relative">
                                <img
                                    src={getMainImageUrl(listing.imageUrls)}
                                    alt={listing.name}
                                    className="w-full h-full object-cover"
                                />
                                {/* Status Badge - Sharp Corner */}
                                <div className="absolute top-0 right-0">
                                    <div className={`py-1 px-2 sm:px-3 text-xs sm:text-sm ${
                                        listing.status === 'Pending' ? 'bg-[#db2b2e]/20 border-[#db2b2e] text-[#db2b2e]' :
                                        listing.status === 'For Sale' ? 'bg-[#db2b2e] border-[#db2b2e] text-white' :
                                        listing.status === 'Confirmed' ? 'bg-[#db2b2e]/80 border-[#db2b2e] text-white' :
                                        'bg-white dark:bg-black border-[#db2b2e] text-black dark:text-white'
                                    } border font-medium transition-colors duration-300`}>
                                        {listing.status}
                                    </div>
                                </div>
                                {/* Sold Overlay */}
                                {listing.status === 'Sold' && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                        <div className="absolute inset-0 overflow-hidden">
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform rotate-[-35deg]">
                                                <span className="text-[#db2b2e] text-2xl sm:text-3xl md:text-4xl font-bold tracking-wider border-t-2 border-b-2 border-[#db2b2e] px-4 sm:px-8 py-1">
                                                    SOLD
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Listing Details */}
                            <div className="p-3 sm:p-4 border-t border-[#db2b2e] flex-1 flex flex-col">
                                <h3 className="text-sm sm:text-base md:text-lg font-bold text-black dark:text-white mb-2 transition-colors duration-300 line-clamp-2">{listing.name}</h3>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 gap-2">
                                    <span className="text-lg sm:text-xl font-bold text-[#db2b2e]">
                                        {listing.price?.toLocaleString()} EGP
                                    </span>
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-white/80 transition-colors duration-300">
                                        <FiBox className="text-[#db2b2e] text-xs sm:text-sm" />
                                        <span className="uppercase text-[10px] sm:text-xs tracking-wider">{listing.listingType}</span>
                                    </div>
                                </div>

                                {/* Quantity Information for Stock Items */}
                                {listing.listingType === 'stock' && (
                                    <div className="grid grid-cols-3 gap-0 mb-3 sm:mb-4">
                                        <div className="border border-[#db2b2e] p-2 sm:p-3 text-center">
                                            <p className="text-[8px] sm:text-[10px] text-[#db2b2e] uppercase tracking-wider">Initial</p>
                                            <p className="text-sm sm:text-base md:text-lg font-bold text-black dark:text-white transition-colors duration-300">{listing.initialQuantity}</p>
                                        </div>
                                        <div className="border-t border-b border-[#db2b2e] p-2 sm:p-3 text-center">
                                            <p className="text-[8px] sm:text-[10px] text-[#db2b2e] uppercase tracking-wider">Current</p>
                                            <p className="text-sm sm:text-base md:text-lg font-bold text-black dark:text-white transition-colors duration-300">{listing.currentQuantity}</p>
                                        </div>
                                        <div className="border border-[#db2b2e] p-2 sm:p-3 text-center">
                                            <p className="text-[8px] sm:text-[10px] text-[#db2b2e] uppercase tracking-wider">Sold</p>
                                            <p className="text-sm sm:text-base md:text-lg font-bold text-black dark:text-white transition-colors duration-300">{listing.soldQuantity || 0}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Status Message */}
                                <div className="mb-3 sm:mb-4 p-2 sm:p-3 border border-[#db2b2e] bg-[#db2b2e]/5 flex-1 flex items-start">
                                    <div className="flex items-start gap-2">
                                        <FiAlertCircle className="mt-0.5 flex-shrink-0 text-[#db2b2e] text-xs sm:text-sm" />
                                        <div className="flex-1 text-[10px] sm:text-xs text-black dark:text-white transition-colors duration-300 leading-relaxed">
                                            {getStatusMessage(listing.status)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions - Compact layout with icon-only delete */}
                            <div className="p-3 sm:p-4 border-t border-[#db2b2e]/20 mt-auto">
                                <div className="flex gap-1.5 sm:gap-2">
                                    <button
                                        onClick={() => navigate(`/listing/${listing._id}`)}
                                        className={`${listing.status === 'Pending' || listing.status === 'Confirmed' ? 'flex-1' : 'w-full'} bg-[#db2b2e] text-white py-1.5 sm:py-2 px-2 sm:px-3 hover:bg-[#db2b2e]/90 transition-colors flex items-center justify-center gap-1 text-[10px] sm:text-xs font-medium`}
                                    >
                                        <FiEye className="text-xs" />
                                        <span>View</span>
                                    </button>
                                    {listing.status === 'Confirmed' && (
                                        <Link
                                            to="/support"
                                            className="flex-1 bg-[#f3eb4b] text-[#db2b2e] py-1.5 sm:py-2 px-2 sm:px-3 hover:bg-[#f3eb4b]/90 transition-colors flex items-center justify-center gap-1 text-[10px] sm:text-xs font-medium"
                                        >
                                            <FiPhone className="text-xs" />
                                            <span className="hidden sm:inline">Contact</span>
                                            <span className="sm:hidden">Call</span>
                                        </Link>
                                    )}
                                    {listing.status === 'Pending' && (
                                        <>
                                            <Link
                                                to={`/update-listing/${listing._id}`}
                                                className="flex-1 bg-[#db2b2e] text-white py-1.5 sm:py-2 px-2 sm:px-3 hover:bg-[#db2b2e]/90 transition-colors flex items-center justify-center gap-1 text-[10px] sm:text-xs font-medium"
                                            >
                                                <FiEdit2 className="text-xs" />
                                                <span>Edit</span>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(listing._id)}
                                                className="w-8 sm:w-10 bg-white dark:bg-black border border-[#db2b2e] text-[#db2b2e] hover:bg-[#db2b2e] hover:text-white transition-colors flex items-center justify-center py-1.5 sm:py-2"
                                                title="Delete listing"
                                            >
                                                <FiTrash2 className="text-sm sm:text-base text-[#db2b2e] hover:text-white transition-colors" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredListings.length === 0 && (
                    <div className="text-center py-12">
                        <div className="mb-6">
                            <img 
                                src="/mediassets/Filter01.png" 
                                alt="" 
                                className="w-24 h-24 mx-auto opacity-30 mb-4"
                            />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                            {common.noListingsFound}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-500 mb-6">
                            {getNoListingsMessage(activeTab)}
                        </p>
                        <Link
                            to="/create-listing"
                            className="inline-block bg-[#db2b2e] text-white px-6 py-3 hover:bg-[#db2b2e]/90 transition-colors"
                        >
                            {common.createYourFirstListing}
                        </Link>
                    </div>
                )}
            </div>

            {/* Confirm Dialog */}
            {confirmDialog.isOpen && confirmDialog.onConfirm && (
                <ConfirmDialog
                    isOpen={confirmDialog.isOpen}
                    onClose={closeConfirmDialog}
                    onConfirm={confirmDialog.onConfirm}
                    title={confirmDialog.title}
                    message={confirmDialog.message}
                    type="danger"
                    confirmText="Delete"
                    cancelText="Cancel"
                />
            )}
        </>
    );
}

UserListings.propTypes = {
    userId: PropTypes.string.isRequired,
}; 