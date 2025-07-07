import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ListingItem from '../components/ListingItem';
import GE02Loader from '../components/GE02Loader';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../locales/translations';
import { authenticatedFetch } from '../utils/authenticatedFetch';

export default function Search() {
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
  const search = useTranslation('search', 'search', currentLang);
  const searchPlaceholder = useTranslation('search', 'searchPlaceholder', currentLang);
  const applyFilters = useTranslation('search', 'applyFilters', currentLang);
  const sortBy = useTranslation('search', 'sortBy', currentLang);
  const priceHighToLow = useTranslation('search', 'priceHighToLow', currentLang);
  const priceLowToHigh = useTranslation('search', 'priceLowToHigh', currentLang);
  const latest = useTranslation('search', 'latest', currentLang);
  const oldest = useTranslation('search', 'oldest', currentLang);
  const product = useTranslation('search', 'product', currentLang);
  const products = useTranslation('search', 'products', currentLang);
  const productsFound = useTranslation('search', 'productsFound', currentLang);
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
        const res = await authenticatedFetch(`/api/listing/get?${searchQuery}`);
        if (!res.ok) {
          throw new Error('Failed to fetch listings.');
        }
        const data = await res.json();
        setListings(data);
        setShowMore(data.length === 9);
      } catch (error) {
        console.error(error);
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
      const res = await authenticatedFetch(`/api/listing/get?${urlParams.toString()}`);
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
                            <div className={`w-8 h-8 rounded-full border-2 ${
                              sidebardata.type === category.value
                                ? 'border-[#db2b2e] bg-[#db2b2e]/20'
                                : 'border-gray-400 dark:border-white/40'
                            }`} />
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
                      
                      {/* Selected indicator */}
                      {sidebardata.type === category.value && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#db2b2e] rounded-full flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:gap-6">
                <div className="space-y-2 md:space-y-3">
                  <label className={`text-xs md:text-sm font-semibold block text-gray-700 dark:text-white/80 ${
                    isArabic ? 'font-noto' : 'font-nt'
                  }`}>
                    {search}
                  </label>
                  <input
                    type="text"
                    id="searchTerm"
                    placeholder={searchPlaceholder}
                    value={sidebardata.searchTerm}
                    onChange={handleChange}
                    className={`w-full p-2 md:p-3 text-sm md:text-base border border-[#db2b2e] dark:border-white/20 bg-white dark:bg-black/50 text-black dark:text-white focus:border-primary transition-colors ${
                      isArabic ? 'font-noto' : 'font-nt'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full bg-primary text-black font-bold py-2 md:py-3 px-4 text-sm md:text-base hover:opacity-90 transition-opacity mt-3 md:mt-4 ${
                    isArabic ? 'font-amiri' : 'font-nt'
                  }`}
                >
                  {applyFilters}
                </button>
              </form>
            </div>
          </aside>

          {/* Results Section */}
          <div className="flex-1">
            {/* Sort & Count */}
            <div className="bg-gray-100/90 dark:bg-black/30 backdrop-blur border border-[#db2b2e] dark:border-white/10 p-4 md:p-6 mb-6 md:mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                  <label className={`text-xs md:text-sm font-semibold text-gray-700 dark:text-white/80 ${
                    isArabic ? 'font-noto' : 'font-nt'
                  }`}>
                    {sortBy}
                  </label>
                  <select
                    id="sort_order"
                    value={`${sidebardata.sort}_${sidebardata.order}`}
                    onChange={(e) => {
                      const [sort, order] = e.target.value.split('_');
                      setSidebardata((prev) => ({ ...prev, sort, order }));
                    }}
                    className={`p-2 text-sm md:text-base bg-white dark:bg-black/50 text-black dark:text-white border border-[#db2b2e] dark:border-white/20 focus:border-primary transition-colors ${
                      isArabic ? 'font-noto' : 'font-nt'
                    }`}
                  >
                    <option value="regularPrice_desc">{priceHighToLow}</option>
                    <option value="regularPrice_asc">{priceLowToHigh}</option>
                    <option value="createdAt_desc">{latest}</option>
                    <option value="createdAt_asc">{oldest}</option>
                  </select>
                </div>
                <p className={`text-xs md:text-sm text-gray-600 dark:text-white/60 ${
                  isArabic ? 'font-noto' : 'font-nt'
                }`}>
                  {listings.length} {listings.length === 1 ? product : products} {productsFound}
                </p>
              </div>
            </div>

            {/* Listings Grid */}
            <div className="bg-gray-100/90 dark:bg-black/30 backdrop-blur border border-[#db2b2e] dark:border-white/10 p-4 md:p-6">
              {loading ? (
                <div className="flex justify-center items-center min-h-[300px]">
                  <GE02Loader size="large" message="Searching listings..." />
                </div>
              ) : listings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mb-6">
                    <img 
                      src="/mediassets/Filter03.png" 
                      alt="" 
                      className="w-32 h-32 mx-auto opacity-20 mb-4"
                    />
                  </div>
                  <p className={`text-lg text-gray-600 dark:text-white/60 ${
                    isArabic ? 'font-noto' : 'font-nt'
                  }`}>
                    {noResults}
                  </p>
                  <p className={`text-sm text-gray-500 dark:text-white/40 mt-2 ${
                    isArabic ? 'font-noto' : 'font-nt'
                  }`}>
                    {noResultsSubtitle}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 md:gap-6">
                  {listings.map((listing) => (
                    <ListingItem key={listing._id} listing={listing} />
                  ))}
                </div>
              )}

              {/* Load More */}
              {showMore && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={onShowMoreClick}
                    className={`bg-primary text-black font-bold py-3 px-6 hover:opacity-90 transition-opacity ${
                      isArabic ? 'font-amiri' : 'font-nt'
                    }`}
                  >
                    {loadMore}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}