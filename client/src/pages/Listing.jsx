import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore from 'swiper';
import { useDispatch } from 'react-redux';
import { Navigation } from 'swiper/modules';
import 'swiper/css/bundle';
import {
  FaShare,
  FaArrowLeft,
  FaBox,
  FaRegClock,
  FaShippingFast
} from 'react-icons/fa';

import GE02Loader from '../components/GE02Loader';
import { addToCart } from '../redux/cart/cartSlice';
import { setBannerMessage } from '../redux/banner/bannerSlice';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../locales/translations';
import { processImageUrls } from '../utils/imageUtils';
import { authenticatedFetch } from '../utils/authenticatedFetch';

export default function Listing() {
  SwiperCore.use([Navigation]);
  const navigate = useNavigate();
  const { currentLang, isArabic } = useLanguage();
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  const [currentSlide, setCurrentSlide] = useState(0);
  const params = useParams();

  const dispatch = useDispatch();

  // Get all translations at component level
  const pleaseSelectSizeText = useTranslation('listing', 'pleaseSelectSize', currentLang);
  const onlyAvailableText = useTranslation('listing', 'onlyAvailable', currentLang);
  const itemsAvailableText = useTranslation('listing', 'itemsAvailable', currentLang);
  const sizeText = useTranslation('listing', 'size', currentLang);
  const addedToCartText = useTranslation('listing', 'addedToCart', currentLang);
  const loadingListingText = useTranslation('listing', 'loadingListing', currentLang);
  const somethingWentWrongText = useTranslation('listing', 'somethingWentWrong', currentLang);
  const tryAgainText = useTranslation('listing', 'tryAgain', currentLang);
  const backText = useTranslation('listing', 'back', currentLang);
  const shareText = useTranslation('listing', 'share', currentLang);
  const copiedText = useTranslation('listing', 'copied', currentLang);
  const imageNotAvailableText = useTranslation('listing', 'imageNotAvailable', currentLang);
  const addToCartText = useTranslation('listing', 'addToCart', currentLang);
  const contactSellerText = useTranslation('listing', 'contactSeller', currentLang);
  const descriptionText = useTranslation('listing', 'description', currentLang);
  const priceText = useTranslation('listing', 'price', currentLang);
  const availableText = useTranslation('listing', 'available', currentLang);


  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const res = await authenticatedFetch(`/api/listing/get/${params.listingId}`);
        const data = await res.json();
        if (!data || data.error) {
          setError(true);
          setLoading(false);
          return;
        }
        
        // Process image URLs to handle missing images
        const processedListing = {
          ...data,
          imageUrls: processImageUrls(data.imageUrls)
        };
        
        setListing(processedListing);
        setLoading(false);
        setError(false);
      } catch {
        setError(true);
        setLoading(false);
      }
    };
    fetchListing();
  }, [params.listingId]);

  const handleAddToCart = () => {
    if (!listing) return;

    // Check if clothing item and size is required
    const isClothing = listing.type === 'Clothing & Wearables';
    if (isClothing && !selectedSize) {
      toast.error(pleaseSelectSizeText);
      return;
    }
  
    // Ensure the requested quantity does not exceed available quantity
    if (selectedQuantity > listing.currentQuantity) {
      toast.error(`${onlyAvailableText} ${listing.currentQuantity} ${itemsAvailableText}`);
      return;
    }
  
    const itemToAdd = {
      _id: listing._id,
      name: listing.name,
      price: listing.price,
      imageUrls: listing.imageUrls,
      quantity: selectedQuantity,
      currentQuantity: listing.currentQuantity,
      type: listing.type,
      listingType: listing.listingType,
      ...(isClothing && { selectedSize })
    };
  
    dispatch(addToCart(itemToAdd));
    dispatch(setBannerMessage(`${listing.name}${isClothing ? ` (${sizeText}: ${selectedSize})` : ''} ${addedToCartText}`));
  };

  if (loading) {
    return <GE02Loader fullScreen={true} size="xlarge" message={loadingListingText} />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className={`text-black dark:text-white text-2xl mb-4 ${isArabic ? 'font-amiri' : 'font-nt'}`}>
            {somethingWentWrongText}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className={`bg-primary text-white px-6 py-2 rounded hover:bg-primary/90 transition-colors ${isArabic ? 'font-amiri' : 'font-nt'}`}
          >
            {tryAgainText}
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className={`bg-white dark:bg-black text-black dark:text-white min-h-screen transition-colors duration-300 ${isArabic ? 'font-amiri' : 'font-nt'}`} dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Custom Swiper Navigation Styles */}
      <style>{`
        .swiper-button-next,
        .swiper-button-prev {
          display: none !important;
        }
        .swiper-button-next-custom:hover,
        .swiper-button-prev-custom:hover {
          transform: translateY(-50%) scale(1.05);
        }
      `}</style>
      {listing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Main Content */}
          <div className="max-w-6xl mx-auto p-3 sm:p-6 pt-16 sm:pt-24">
            {/* Navigation Buttons */}
            <div className={`flex justify-between items-center mb-4 sm:mb-8 ${isArabic ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={() => navigate(-1)}
                className={`flex items-center gap-1 sm:gap-2 text-sm sm:text-base text-black dark:text-white hover:text-[#db2b2e] transition-colors ${isArabic ? 'font-amiri flex-row-reverse' : 'font-nt'}`}
              >
                <FaArrowLeft className={`text-xs sm:text-sm ${isArabic ? 'rotate-180' : ''}`} /> {backText}
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setCopied(true);
                  setTimeout(() => {
                    setCopied(false);
                  }, 2000);
                }}
                className={`flex items-center gap-1 sm:gap-2 text-sm sm:text-base text-black dark:text-white hover:text-[#db2b2e] transition-colors ${isArabic ? 'font-amiri flex-row-reverse' : 'font-nt'}`}
              >
                <FaShare className="text-xs sm:text-sm" /> {copied ? copiedText : shareText}
              </button>
            </div>

            {/* Listing Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              {/* Left: Images */}
              <div className="w-full">
{listing.imageUrls && listing.imageUrls.length > 0 ? (
                  <Swiper 
                    navigation={{
                      nextEl: '.swiper-button-next-custom',
                      prevEl: '.swiper-button-prev-custom',
                    }}
                    onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex)}
                    className="bg-black border border-[#db2b2e]/20 relative"
                  >
                    {listing.imageUrls.map((url, index) => (
                    <SwiperSlide key={index}>
                        <div className="h-[300px] sm:h-[400px] md:h-[500px] flex items-center justify-center bg-black">
                          <img
                            src={url}
                            alt={`${listing.name} - Image ${index + 1}`}
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                              console.error(`Failed to load image: ${url}`);
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                            onLoad={(e) => {
                              e.target.nextSibling.style.display = 'none';
                            }}
                          />
                          <div className="hidden items-center justify-center w-full h-full bg-gray-900 border-2 border-dashed border-[#db2b2e]/30">
                            <div className="text-center text-gray-400">
                              <svg className="w-16 h-16 mx-auto mb-4 text-[#db2b2e]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p className={`text-sm ${isArabic ? 'font-amiri' : 'font-nt'}`}>{imageNotAvailableText}</p>
                            </div>
                          </div>
                        </div>
                    </SwiperSlide>
                  ))}
                    
                    {/* Custom Navigation Arrows */}
                    {listing.imageUrls && listing.imageUrls.length > 1 && (
                      <>
                        <div className="swiper-button-prev-custom absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-12 sm:h-12 bg-black/90 border-2 border-[#db2b2e] flex items-center justify-center cursor-pointer hover:bg-[#db2b2e] hover:text-white transition-all duration-300 group shadow-lg">
                          <svg className="w-4 h-4 sm:w-6 sm:h-6 text-[#db2b2e] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                          </svg>
                        </div>
                        <div className="swiper-button-next-custom absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-12 sm:h-12 bg-black/90 border-2 border-[#db2b2e] flex items-center justify-center cursor-pointer hover:bg-[#db2b2e] hover:text-white transition-all duration-300 group shadow-lg">
                          <svg className="w-4 h-4 sm:w-6 sm:h-6 text-[#db2b2e] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </>
                    )}
                    
                    {/* Image Counter */}
                    {listing.imageUrls && listing.imageUrls.length > 1 && (
                      <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-10 bg-black/80 border border-[#db2b2e]/50 px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm text-white">
                        <span className="text-[#db2b2e]">{currentSlide + 1}</span> / {listing.imageUrls.length}
                      </div>
                    )}
                </Swiper>
                ) : (
                  <div className="h-[300px] sm:h-[400px] md:h-[500px] bg-black border border-[#db2b2e]/20 flex items-center justify-center">
                    <div className="text-center text-gray-400 p-4">
                      <svg className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-2 sm:mb-4 text-[#db2b2e]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm sm:text-base md:text-lg font-medium font-nt">No Images Available</p>
                      <p className="text-xs sm:text-sm font-nt">This listing doesn&apos;t have any images yet</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Details */}
              <div className="w-full flex flex-col gap-4 md:gap-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black dark:text-white mb-2">
                    {listing.name}
                  </h1>
                  <p className="text-[#db2b2e] text-base sm:text-lg">{listing.type}</p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm border-y border-[#db2b2e]/20 py-3 sm:py-4">
                  <div className="flex items-center gap-2">
                    <FaBox className="text-[#db2b2e]" />
                    <span className="font-nt">{listing.listingType === 'unique' ? 'Unique Item' : 'Stock Item'}</span>
                  </div>
                  {listing.listingType === 'stock' && (
                                      <div className="flex items-center gap-2">
                    <FaRegClock className="text-[#db2b2e]" />
                    <span className={isArabic ? 'font-amiri' : 'font-nt'}>{listing.currentQuantity} {availableText}</span>
                  </div>
                  )}
                  {listing.cadremarketsService && (
                    <div className="flex items-center gap-2">
                      <FaShippingFast className="text-[#db2b2e]" />
                      <span className="font-nt">Shipping Available</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col">
                    <span className={`text-xs sm:text-sm text-gray-400 ${isArabic ? 'font-amiri' : 'font-nt'}`}>{priceText}</span>
                    <span className={`text-2xl sm:text-3xl font-bold ${isArabic ? 'font-amiri' : 'font-nt'}`}>
                      {listing.price?.toLocaleString()} EGP
                    </span>
                  </div>

                  {listing.type === 'Clothing & Wearables' ? (
                    <div className="flex flex-col gap-2">
                      <span className="text-xs sm:text-sm text-gray-400 font-nt">Available Sizes</span>
                      {listing.availableSizes && listing.availableSizes.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {listing.availableSizes.map((size) => (
                            <button
                              key={size}
                              onClick={() => setSelectedSize(size)}
                              className={`px-2 py-2 sm:px-3 sm:py-2 text-xs sm:text-sm border transition-colors ${
                                selectedSize === size
                                  ? 'bg-[#db2b2e] text-white border-[#db2b2e]'
                                  : 'border-[#db2b2e]/20 text-black dark:text-white hover:border-[#db2b2e] hover:text-[#db2b2e]'
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm text-gray-400 font-nt">No sizes available</p>
                      )}
                      {selectedSize && (
                        <p className="text-xs sm:text-sm text-[#db2b2e] font-nt">Selected size: {selectedSize}</p>
                      )}
                    </div>
                  ) : (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs sm:text-sm text-gray-400 font-nt">Dimensions</span>
                    <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
                      <span className="font-nt">Width: {listing.width}cm</span>
                      <span className="font-nt">Height: {listing.height}cm</span>
                      {listing.dimensions === '3D' && (
                        <span className="font-nt">Depth: {listing.depth}cm</span>
                      )}
                    </div>
                  </div>
                  )}
                </div>

                <div className="border-t border-[#db2b2e]/20 pt-3 sm:pt-4">
                  <h2 className={`text-xs sm:text-sm text-gray-400 mb-2 ${isArabic ? 'font-amiri' : 'font-nt'}`}>{descriptionText}</h2>
                  <p className={`text-sm sm:text-base text-black dark:text-white leading-relaxed ${isArabic ? 'font-amiri' : 'font-nt'}`}>{listing.description}</p>
                </div>

                <div className="flex flex-col gap-3 sm:gap-4">
                  {listing.listingType === 'stock' ? (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                      <div className="flex items-center border border-[#db2b2e] w-full sm:w-auto">
                        <button
                          className="px-3 py-2 sm:px-4 sm:py-2 text-[#db2b2e] hover:bg-[#db2b2e] hover:text-white transition-colors flex-1 sm:flex-none"
                          onClick={() => setSelectedQuantity((prev) => Math.max(1, prev - 1))}
                        >
                          −
                        </button>
                        <span className="px-3 py-2 sm:px-4 sm:py-2 border-x border-[#db2b2e] text-center flex-1 sm:flex-none">
                          {selectedQuantity}
                        </span>
                        <button
                          className="px-3 py-2 sm:px-4 sm:py-2 text-[#db2b2e] hover:bg-[#db2b2e] hover:text-white transition-colors flex-1 sm:flex-none"
                          onClick={() => setSelectedQuantity((prev) => 
                            Math.min(listing.currentQuantity, prev + 1)
                          )}
                          disabled={selectedQuantity >= listing.currentQuantity}
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={handleAddToCart}
                        className={`bg-[#db2b2e] text-white px-4 py-3 sm:px-6 sm:py-2 hover:bg-[#db2b2e]/90 transition-colors w-full sm:w-auto text-sm sm:text-base font-medium ${isArabic ? 'font-amiri' : 'font-nt'}`}
                      >
                        {addToCartText}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleAddToCart}
                      className={`bg-[#db2b2e] text-white px-4 py-3 sm:px-6 sm:py-2 hover:bg-[#db2b2e]/90 transition-colors w-full text-sm sm:text-base font-medium ${isArabic ? 'font-amiri' : 'font-nt'}`}
                    >
                      {addToCartText}
                    </button>
                  )}

                  <button
                    onClick={() => navigate('/#contact')}
                    className={`border border-[#db2b2e] text-[#db2b2e] px-4 py-3 sm:px-6 sm:py-2 hover:bg-[#db2b2e] hover:text-white transition-colors text-sm sm:text-base font-medium ${isArabic ? 'font-amiri' : 'font-nt'}`}
                  >
                    {contactSellerText}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </main>
  );
}