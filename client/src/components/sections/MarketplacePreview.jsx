import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ListingItem from '../ListingItem';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslation } from '../../locales/translations';
import { publicApiCall } from '../../utils/apiConfig';

export default function MarketplacePreview() {
  const { currentLang, isArabic } = useLanguage();
  
  // Get translations
  const marketplaceTitle = useTranslation('home', 'marketplace', currentLang);
  const marketplaceSubtitle = useTranslation('home', 'exploreArtworks', currentLang);
  const marketplaceDescription = useTranslation('home', 'fromWallToWearable', currentLang);
  const seeMoreListings = useTranslation('home', 'seeMoreListings', currentLang);
  const tryAgain = useTranslation('home', 'tryAgain', currentLang);

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 MarketplacePreview: Fetching listings...');
        // Reduced limit from 1000 to 12 for better performance
        const endpoint = `api/listing/get?limit=12&cadremarketsService=true`;
        console.log('🔍 Endpoint:', endpoint);
        
        // Fetch listings with cadremarketsService: true using publicApiCall
        const data = await publicApiCall(endpoint);
        console.log('💡 MarketplacePreview data:', data);
        console.log('✅ MarketplacePreview Is Array:', Array.isArray(data));
        console.log('📊 MarketplacePreview Data type:', typeof data);
        console.log('🔢 MarketplacePreview Data length:', data?.length || 'N/A');
        
        // Handle both array and object responses
        const listings = Array.isArray(data) ? data : (data.listings || []);
        console.log('🎯 MarketplacePreview Final listings:', listings);
        console.log('✅ MarketplacePreview Successfully fetched', listings.length, 'listings');
        setListings(listings);
      } catch (err) {
        console.error('❌ MarketplacePreview: Error fetching listings:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  return (
    <section
      className="w-full max-w-7xl mx-auto px-3 py-6 md:py-12"
      dir="ltr" // Keep LTR direction even in Arabic mode
    >
      <div
        className={`mb-8 ${isArabic ? 'text-right' : 'text-left'}`}
      >
        <h2 className={`text-4xl text-black dark:text-white mb-3 ${isArabic ? 'font-amiri font-bold' : 'font-nt-bold'}`}>{marketplaceTitle}</h2>
        <p className={`text-black dark:text-white text-lg mb-2 ${isArabic ? 'font-noto' : 'font-nt'}`}>
          {marketplaceSubtitle}
        </p>
        <p className={`text-primary text-lg ${isArabic ? 'font-noto' : 'font-nt'}`}>
          {marketplaceDescription}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 justify-items-center md:justify-items-start">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="w-full max-w-[265px] animate-pulse">
              <div className="aspect-square w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="p-3 sm:p-4 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">
          <p className="font-nt">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className={`mt-4 text-primary hover:underline ${isArabic ? 'font-amiri' : 'font-nt'}`}
          >
            {tryAgain}
          </button>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-6">
            <img 
              src="/mediassets/Filter05.png" 
              alt="" 
              className="w-32 h-32 mx-auto opacity-20 mb-4"
            />
          </div>
          <p className={`text-lg text-black dark:text-white mb-2 ${isArabic ? 'font-amiri font-bold' : 'font-nt-bold'}`}>
            {isArabic ? 'لا توجد إعلانات متاحة حالياً' : 'No Listings Currently Available'}
          </p>
          <p className={`text-sm text-gray-600 dark:text-gray-400 ${isArabic ? 'font-noto' : 'font-nt'}`}>
            {isArabic ? 'نعمل على إضافة المزيد من الأعمال الفنية الرائعة قريباً' : 'We\'re working on adding more amazing artworks soon'}
          </p>
        </div>
      ) : (
        <>
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 justify-items-center md:justify-items-start"
          >
            {listings.map((listing) => (
              <div
                key={listing._id}
              >
                <ListingItem listing={listing} />
              </div>
            ))}
          </div>

          {/* See More Listings Button */}
          <div
            className="flex justify-center mt-12"
          >
            <Link
              to="/search"
              className={`inline-flex items-center px-8 py-3 bg-primary text-white font-semibold hover:bg-primary/90 transition-colors duration-300 border border-primary hover:border-primary/90 ${isArabic ? 'font-amiri' : 'font-nt'}`}
            >
              {seeMoreListings}
              <svg 
                className={`${isArabic ? 'mr-2 rotate-180' : 'ml-2'} w-5 h-5`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M17 8l4 4m0 0l-4 4m4-4H3" 
                />
              </svg>
            </Link>
          </div>
        </>
      )}
    </section>
  );
} 