import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ListingItem from '../ListingItem';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslation } from '../../locales/translations';
import { getApiUrl } from '../../utils/apiConfig';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

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
        const endpoint = `api/listing/get?limit=1000&cadremarketsService=true`;
        console.log('🔍 Endpoint:', endpoint);
        
        // Fetch listings with cadremarketsService: true using plain fetch
        const res = await fetch(getApiUrl(endpoint));
        
        if (!res.ok) {
          throw new Error('Failed to fetch listings');
        }

        const data = await res.json();
        console.log('✅ MarketplacePreview: Successfully fetched', data.length, 'listings');
        setListings(data);
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
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ margin: "-50px" }}
      variants={containerVariants}
      className="w-full max-w-7xl mx-auto px-3 py-6 md:py-12"
      dir="ltr" // Keep LTR direction even in Arabic mode
    >
      <motion.div
        variants={itemVariants}
        className={`mb-8 ${isArabic ? 'text-right' : 'text-left'}`}
      >
        <h2 className={`text-4xl text-black dark:text-white mb-3 ${isArabic ? 'font-amiri font-bold' : 'font-nt-bold'}`}>{marketplaceTitle}</h2>
        <p className={`text-black dark:text-white text-lg mb-2 ${isArabic ? 'font-noto' : 'font-nt'}`}>
          {marketplaceSubtitle}
        </p>
        <p className={`text-primary text-lg ${isArabic ? 'font-noto' : 'font-nt'}`}>
          {marketplaceDescription}
        </p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 justify-items-center md:justify-items-start"
          >
            {listings.map((listing) => (
              <motion.div
                key={listing._id}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
              >
                <ListingItem listing={listing} />
              </motion.div>
            ))}
          </motion.div>

          {/* See More Listings Button */}
          <motion.div
            variants={itemVariants}
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
          </motion.div>
        </>
      )}
    </motion.section>
  );
} 