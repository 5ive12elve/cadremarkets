import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ListingItem from '../components/ListingItem';
import GE02Loader from '../components/GE02Loader';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../locales/translations';
import { smartFetch, getApiUrl } from '../utils/apiConfig';

export default function Search() {
  console.log('🔍 Search component rendered');
  const navigate = useNavigate();
  const location = useLocation();
  const { isArabic, currentLang } = useLanguage();
  
  // Get all translations at component level
  const title = useTranslation('search', 'title', currentLang);
  const subtitle = useTranslation('search', 'subtitle', currentLang);
  const filters = useTranslation('search', 'filters', currentLang);
  const type = useTranslation('search', 'type', currentLang);
  const all = useTranslation('search', 'all', currentLang);
  const paintingsDrawings = useTranslation('search', 'paintingsDrawings', currentLang);
  const sculptures3DArt = useTranslation('search', 'sculptures3DArt', currentLang);
  const antiquesCollectibles = useTranslation('search', 'antiquesCollectibles', currentLang);
  const clothingWearables = useTranslation('search', 'clothingWearables', currentLang);
  const homeDecor = useTranslation('search', 'homeDecor', currentLang);
  const accessories = useTranslation('search', 'accessories', currentLang);
  const printsPoster = useTranslation('search', 'printsPoster', currentLang);
  const applyFilters = useTranslation('search', 'applyFilters', currentLang);
  const sortBy = useTranslation('search', 'sortBy', currentLang);
  const latest = useTranslation('search', 'latest', currentLang);
  const oldest = useTranslation('search', 'oldest', currentLang);
  const noResults = useTranslation('search', 'noResults', currentLang);
  const noResultsSubtitle = useTranslation('search', 'noResultsSubtitle', currentLang);
  const loadMore = useTranslation('search', 'loadMore', currentLang);

  const [sidebardata, setSidebardata] = useState({
    searchTerm: '',
    type: 'all',
    sort: 'createdAt',
    order: 'desc',
  });

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);

  // Filter categories with their corresponding images
  const filterCategories = [
    { 
      id: 'all', 
      name: all, 
      image: null, 
      value: 'all' 
    },
    { 
      id: 'paintings', 
      name: paintingsDrawings, 
      image: '/mediassets/Filter01.png', 
      value: 'Paintings & Drawings' 
    },
    { 
      id: 'sculptures', 
      name: sculptures3DArt, 
      image: '/mediassets/Filter02.png', 
      value: 'Sculptures & 3D Art' 
    },
    { 
      id: 'antiques', 
      name: antiquesCollectibles, 
      image: '/mediassets/Filter03.png', 
      value: 'Antiques & Collectibles' 
    },
    { 
      id: 'clothing', 
      name: clothingWearables, 
      image: '/mediassets/Filter04.png', 
      value: 'Clothing & Wearables' 
    },
    { 
      id: 'homedecor', 
      name: homeDecor, 
      image: '/mediassets/Filter05.png', 
      value: 'Home Décor' 
    },
    { 
      id: 'accessories', 
      name: accessories, 
      image: '/mediassets/Filter06.png', 
      value: 'Accessories' 
    },
    { 
      id: 'prints', 
      name: printsPoster, 
      image: '/mediassets/Filter07.png', 
      value: 'Prints & Posters' 
    }
  ];

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      const urlParams = new URLSearchParams(location.search);
      const searchQuery = urlParams.toString();

      try {
        console.log('🔍 Search: About to call smartFetch...');
        const data = await smartFetch(`api/listing/get?${searchQuery}`);
        console.log('🔍 Search: smartFetch completed successfully');
        console.log('🔍 RAW listings response:', data);
        console.log('💡 Listings data:', data);
        console.log('✅ Is Array:', Array.isArray(data));
        console.log('📊 Data type:', typeof data);
        console.log('🔢 Data length:', data?.length || 'N/A');
        
        // Handle both array and object responses
        const listings = Array.isArray(data) ? data : (data.listings || []);
        console.log('🎯 Final listings to set:', listings);
        console.log('🎯 Final listings is array:', Array.isArray(listings));
        
        setListings(listings);
        setShowMore(listings.length === 9);
      } catch (error) {
        console.error('❌ Search: Error fetching listings:', error);
        console.error('❌ Search: Error stack:', error.stack);
        console.error('❌ Search: Error message:', error.message);
        setListings([]);
      } finally {
        setLoading(false);
      }

      setSidebardata({
        searchTerm: urlParams.get('searchTerm') || '',
        type: urlParams.get('type') || 'all',
        sort: urlParams.get('sort') || 'createdAt',
        order: urlParams.get('order') || 'desc',
      });
    };

    fetchListings();
  }, [location.search]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setSidebardata((prev) => ({ ...prev, [id]: value }));
  };

  const handleFilterSelect = (filterValue) => {
    setSidebardata((prev) => ({ ...prev, type: filterValue }));
    const params = new URLSearchParams({ ...sidebardata, type: filterValue });
    navigate(`/search?${params.toString()}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(sidebardata);
    navigate(`/search?${params.toString()}`);
  };

  const onShowMoreClick = async () => {
    const startIndex = listings.length;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('startIndex', startIndex);

    try {
      const res = await fetch(getApiUrl(`api/listing/get?${urlParams.toString()}`));
      if (!res.ok) {
        throw new Error('Failed to fetch additional listings.');
      }
      const data = await res.json();
      setListings((prev) => [...prev, ...data]);
      setShowMore(data.length === 9);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div 
      className={`min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-300 ${
        isArabic ? 'font-noto' : 'font-nt'
      }`}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-8 md:py-12">
        <div className="max-w-3xl">
          <h1 className={`text-2xl md:text-4xl font-bold mb-2 ${
            isArabic ? 'font-amiri' : 'font-nt-bold'
          }`}>
            {title}
          </h1>
          <p className={`text-gray-600 dark:text-white/80 mb-8 md:mb-12 text-sm md:text-lg ${
            isArabic ? 'font-noto' : 'font-nt'
          }`}>
            {subtitle}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 md:gap-8">
          {/* Enhanced Filters Sidebar */}
          <aside className="lg:w-[350px] shrink-0">
            <div className="sticky top-[100px] bg-gray-100/90 dark:bg-black/30 backdrop-blur border border-[#db2b2e] dark:border-white/10 p-4 md:p-6">
              <h2 className={`text-lg md:text-xl font-bold mb-4 md:mb-6 ${
                isArabic ? 'font-amiri' : 'font-nt-bold'
              }`}>
                {filters}
              </h2>
              
              {/* Visual Filter Categories */}
              <div className="mb-6">
                <label className={`text-xs md:text-sm font-semibold block text-gray-700 dark:text-white/80 mb-3 ${
                  isArabic ? 'font-noto' : 'font-nt'
                }`}>
                  {type}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {filterCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleFilterSelect(category.value)}
                      className={`relative p-3 border-2 transition-all duration-300 hover:scale-105 h-24 ${
                        sidebardata.type === category.value
                          ? 'border-[#db2b2e] bg-[#db2b2e]/10 dark:bg-[#db2b2e]/20'
                          : 'border-gray-300 dark:border-white/20 hover:border-[#db2b2e]/50'
                      } bg-white dark:bg-black/50`}
                    >
                      {category.image ? (
                        <div className="flex flex-col items-center space-y-1">
                          <div className="w-12 h-12 flex items-center justify-center">
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <span className={`text-[8px] md:text-[9px] text-center font-medium leading-tight px-1 ${
                            isArabic ? 'font-noto' : 'font-nt'
                          } ${
                            sidebardata.type === category.value
                              ? 'text-[#db2b2e]'
                              : 'text-gray-700 dark:text-white/80'
                          } break-words overflow-hidden`}>
                            {category.name}
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center space-y-1">
                          <div className="w-12 h-12 flex items-center justify-center">
                            <div className={`w-12 h-12 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center`}>
                              <span className="text-gray-500 dark:text-gray-400 text-lg">
                                {category.name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <span className={`text-[8px] md:text-[9px] text-center font-medium leading-tight px-1 ${
                            isArabic ? 'font-noto' : 'font-nt'
                          } ${
                            sidebardata.type === category.value
                              ? 'text-[#db2b2e]'
                              : 'text-gray-700 dark:text-white/80'
                          } break-words overflow-hidden`}>
                            {category.name}
                          </span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort and Apply Filters */}
              <div className="mt-6">
                <h3 className={`text-xs md:text-sm font-semibold mb-3 ${
                  isArabic ? 'font-noto' : 'font-nt'
                }`}>
                  {sortBy}
                </h3>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleChange({ id: 'sort', value: 'createdAt' })}
                    className={`p-2 border-2 transition-all duration-300 hover:scale-105 ${
                      sidebardata.sort === 'createdAt'
                        ? 'border-[#db2b2e] bg-[#db2b2e]/10 dark:bg-[#db2b2e]/20'
                        : 'border-gray-300 dark:border-white/20 hover:border-[#db2b2e]/50'
                    }`}
                  >
                    {latest}
                  </button>
                  <button
                    onClick={() => handleChange({ id: 'sort', value: 'createdAt', order: 'asc' })}
                    className={`p-2 border-2 transition-all duration-300 hover:scale-105 ${
                      sidebardata.sort === 'createdAt' && sidebardata.order === 'asc'
                        ? 'border-[#db2b2e] bg-[#db2b2e]/10 dark:bg-[#db2b2e]/20'
                        : 'border-gray-300 dark:border-white/20 hover:border-[#db2b2e]/50'
                    }`}
                  >
                    {oldest}
                  </button>
                </div>

                <button
                  onClick={handleSubmit}
                  className="mt-6 w-full p-3 bg-[#db2b2e] text-white rounded-md hover:bg-[#c02629] transition-colors duration-300"
                >
                  {applyFilters}
                </button>
              </div>
            </div>
          </aside>

          {/* Listings Grid */}
          <main className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <GE02Loader />
              ) : listings.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <h3 className={`text-lg md:text-xl font-bold mb-4 ${
                    isArabic ? 'font-amiri' : 'font-nt-bold'
                  }`}>
                    {noResults}
                  </h3>
                  <p className={`text-gray-600 dark:text-white/80 text-sm md:text-lg ${
                    isArabic ? 'font-noto' : 'font-nt'
                  }`}>
                    {noResultsSubtitle}
                  </p>
                </div>
              ) : (
                listings.map((listing) => (
                  <ListingItem key={listing._id} listing={listing} />
                ))
              )}
            </div>

            {showMore && (
              <div className="text-center py-8">
                <button
                  onClick={onShowMoreClick}
                  className="p-3 bg-[#db2b2e] text-white rounded-md hover:bg-[#c02629] transition-colors duration-300"
                >
                  {loadMore}
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}