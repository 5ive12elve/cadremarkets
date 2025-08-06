import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { uploadToCloudinary } from '../utils/cloudinaryUpload';
import { authenticatedFetch, isAuthenticated } from '../utils/apiUtils';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiCheck, FiArrowLeft, FiUpload, FiX, FiImage, FiTrash2 } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../locales/translations';
import PhoneInput from '../components/shared/PhoneInput';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const calculateSellerProfit = (price, usesCadreService, servicePaymentMethod) => {
  const platformFee = price * 0.10; // 10% platform fee
  const serviceFee = usesCadreService && servicePaymentMethod === 'deductFromProfit' ? 400 : 0;
  return price - serviceFee - platformFee;
};

export default function UpdateListing() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const params = useParams();
  const { isArabic, currentLang } = useLanguage();

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/signin', { state: { from: '/update-listing' } });
    }
  }, [navigate]);
  
  // Helper text translations
  const helperText = {
    images: useTranslation('createListingHelpers', 'images', currentLang),
    name: useTranslation('createListingHelpers', 'name', currentLang),
    description: useTranslation('createListingHelpers', 'description', currentLang),
    type: useTranslation('createListingHelpers', 'type', currentLang),
    sizes: useTranslation('createListingHelpers', 'sizes', currentLang),
    dimensions: useTranslation('createListingHelpers', 'dimensions', currentLang),
    width: useTranslation('createListingHelpers', 'width', currentLang),
    height: useTranslation('createListingHelpers', 'height', currentLang),
    depth: useTranslation('createListingHelpers', 'depth', currentLang),
    address: useTranslation('createListingHelpers', 'address', currentLang),
    city: useTranslation('createListingHelpers', 'city', currentLang),
    district: useTranslation('createListingHelpers', 'district', currentLang),
    price: useTranslation('createListingHelpers', 'price', currentLang),
    service: useTranslation('createListingHelpers', 'service', currentLang),
    contact: useTranslation('createListingHelpers', 'contact', currentLang),
    phone: useTranslation('createListingHelpers', 'phone', currentLang),
    quantity: useTranslation('createListingHelpers', 'quantity', currentLang),
  };

  // Success toast translations
  const successToastTexts = {
    listingUpdated: useTranslation('updateListing', 'title', currentLang) + '!',
    pendingApproval: isArabic ? 'إعلانك الآن قيد المراجعة' : 'Your listing is now pending approval',
  };

  // Additional translation variables
  const dropImagesHereText = useTranslation('createListing', 'dropImagesHere', currentLang);
  const dragDropText = useTranslation('createListing', 'dragDrop', currentLang);
  const browseText = useTranslation('createListing', 'browse', currentLang);
  const fileTypesText = useTranslation('createListing', 'fileTypes', currentLang);
  const maxImagesText = useTranslation('createListing', 'maxImages', currentLang);
  const selectedFilesText = useTranslation('createListing', 'selectedFiles', currentLang);
  const uploadText = useTranslation('createListing', 'upload', currentLang);
  const uploadingText = useTranslation('createListing', 'uploading', currentLang);
  const uploadedImagesText = useTranslation('createListing', 'uploadedImages', currentLang);
  const mainImageText = useTranslation('createListing', 'mainImage', currentLang);
  const firstImageMainText = useTranslation('createListing', 'firstImageMain', currentLang);
  const basicInfoText = useTranslation('createListing', 'basicInfo', currentLang);
  const listingNameText = useTranslation('createListing', 'listingName', currentLang);
  const descriptionText = useTranslation('createListing', 'description', currentLang);
  const updatingText = useTranslation('updateListing', 'updating', currentLang);
  const submitText = useTranslation('updateListing', 'submit', currentLang);
  const availableSizesText = useTranslation('createListing', 'sizes', currentLang);
  const selectSizesText = useTranslation('createListing', 'selectSizes', currentLang);
  const selectedSizesText = useTranslation('createListing', 'selectedSizes', currentLang);
  const dimensionsText = useTranslation('createListing', 'dimensions', currentLang);
  const widthText = useTranslation('createListing', 'width', currentLang);
  const heightText = useTranslation('createListing', 'height', currentLang);
  const depthText = useTranslation('createListing', 'depth', currentLang);
  const locationText = useTranslation('createListing', 'location', currentLang);
  const addressText = useTranslation('createListing', 'address', currentLang);
  const selectCityText = useTranslation('createListing', 'selectCity', currentLang);
  const selectDistrictText = useTranslation('createListing', 'selectDistrict', currentLang);
  const enterDistrictText = useTranslation('createListing', 'enterDistrict', currentLang);
  const pricingText = useTranslation('createListing', 'pricing', currentLang);
  const priceText = useTranslation('createListing', 'price', currentLang);
  const platformFeeText = useTranslation('createListing', 'platformFee', currentLang);
  const serviceFeeText = useTranslation('createListing', 'serviceFee', currentLang);
  const yourProfitText = useTranslation('createListing', 'yourProfit', currentLang);
  const cadremarketsServiceText = useTranslation('createListing', 'cadremarketsService', currentLang);
  const enableServiceText = useTranslation('createListing', 'enableService', currentLang);
  const featuredPlacementText = useTranslation('createListing', 'featuredPlacement', currentLang);
  const priorityPositioningText = useTranslation('createListing', 'priorityPositioning', currentLang);
  const professionalPhotoshootText = useTranslation('createListing', 'professionalPhotoshoot', currentLang);
  const contactText = useTranslation('createListing', 'contact', currentLang);
  const contactPreferenceText = useTranslation('createListing', 'contactPreference', currentLang);
  const phoneNumberText = useTranslation('createListing', 'phoneNumber', currentLang);
  const quantityText = useTranslation('createListing', 'quantity', currentLang);
  const initialQuantityText = useTranslation('createListing', 'initialQuantity', currentLang);
  const listingTypeText = useTranslation('createListing', 'listingType', currentLang);
  const uniqueText = useTranslation('createListing', 'unique', currentLang);
  const stockText = useTranslation('createListing', 'stock', currentLang);
  const stockInfoText = useTranslation('createListing', 'stockInfo', currentLang);
  const currentQuantityText = useTranslation('createListing', 'currentQuantity', currentLang);
  const soldQuantityText = useTranslation('createListing', 'soldQuantity', currentLang);
  const cairoText = useTranslation('createListing', 'cairo', currentLang);
  const otherText = useTranslation('createListing', 'other', currentLang);
  const servicePaymentMethodText = useTranslation('createListing', 'servicePaymentMethod', currentLang);
  const deductFromProfitText = useTranslation('createListing', 'deductFromProfit', currentLang);
  const paySeparatelyText = useTranslation('createListing', 'paySeparately', currentLang);
  const deductFromProfitDescText = useTranslation('createListing', 'deductFromProfitDesc', currentLang);
  const paySeparatelyDescText = useTranslation('createListing', 'paySeparatelyDesc', currentLang);
  
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: '',
    description: '',
    address: '',
    phoneNumber: '',
    city: '',
    district: '',
    type: 'Paintings & Drawings',
    dimensions: '2D',
    width: '',
    height: '',
    depth: '',
    price: 100,
    contactPreference: 'Phone Number',
    initialQuantity: 1,
    currentQuantity: 1,
    soldQuantity: 0,
    listingType: 'unique',
    status: 'Pending',
    cadremarketsService: false,
    servicePaymentMethod: 'deductFromProfit', // 'deductFromProfit' or 'paySeparately'
    availableSizes: [],
  });

  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clothingSizes, setClothingSizes] = useState([]);

  const artTypes = [
    useTranslation('createListing', 'paintingsDrawings', currentLang),
    useTranslation('createListing', 'sculptures3DArt', currentLang),
    useTranslation('createListing', 'antiquesCollectibles', currentLang),
    useTranslation('createListing', 'clothingWearables', currentLang),
    useTranslation('createListing', 'homeDecor', currentLang),
    useTranslation('createListing', 'accessories', currentLang),
    useTranslation('createListing', 'printsPoster', currentLang),
  ];

  const cairoDistricts = [
    useTranslation('createListing', 'maadi', currentLang),
    useTranslation('createListing', 'heliopolis', currentLang),
    useTranslation('createListing', 'nasrCity', currentLang),
    useTranslation('createListing', 'newCairo', currentLang),
    useTranslation('createListing', 'zamalek', currentLang),
    useTranslation('createListing', 'gardenCity', currentLang),
    useTranslation('createListing', 'downtownCairo', currentLang),
    useTranslation('createListing', 'dokki', currentLang),
    useTranslation('createListing', 'mohandessin', currentLang),
    useTranslation('createListing', 'sixthOfOctober', currentLang),
    useTranslation('createListing', 'sheikhZayed', currentLang),
    useTranslation('createListing', 'giza', currentLang),
    useTranslation('createListing', 'haram', currentLang),
    useTranslation('createListing', 'shoubra', currentLang),
    useTranslation('createListing', 'ainShams', currentLang),
    useTranslation('createListing', 'elMatareya', currentLang),
    useTranslation('createListing', 'madinaty', currentLang),
    useTranslation('createListing', 'elRehab', currentLang),
    useTranslation('createListing', 'elTagamoaElKhames', currentLang),
    useTranslation('createListing', 'other', currentLang)
  ];

  // Fetch available clothing sizes on component mount
  useEffect(() => {
    const fetchClothingSizes = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/listing/clothing/sizes`);
        const data = await response.json();
        if (data.success) {
          setClothingSizes(data.sizes);
        }
      } catch (error) {
        console.error('Error fetching clothing sizes:', error);
      }
    };

    fetchClothingSizes();
  }, []);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        console.log('🔍 UpdateListing: params =', params);
        console.log('🔍 UpdateListing: params.id =', params.id);
        
        if (!params.id) {
          console.error('🔍 UpdateListing: No listing ID found in params');
          setError('No listing ID provided');
          return;
        }
        
        const listingId = params.id;
        console.log('🔍 UpdateListing: Using listing ID =', listingId);
        
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/listing/get/${listingId}`);
        const data = await res.json();
        if (data.success === false) {
          console.error(data.message);
          setError('Failed to fetch listing details');
          return;
        }
        setFormData(data);
      } catch (err) {
        console.error('Error fetching listing:', err);
        setError('Failed to fetch listing details');
      }
    };

    fetchListing();
  }, [params.id]);

  const handleImageSubmit = (selectedFiles = files) => {
    if (selectedFiles.length > 0 && selectedFiles.length + formData.imageUrls.length < 7) {
      // Validate file sizes before upload
      const filesArray = Array.from(selectedFiles);
      const oversizedFiles = filesArray.filter(file => file.size > 2 * 1024 * 1024); // 2MB
      if (oversizedFiles.length > 0) {
        setImageUploadError(`The following files are too large (max 2MB): ${oversizedFiles.map(f => f.name).join(', ')}`);
        return;
      }

      // Validate file types
      const invalidFiles = filesArray.filter(file => !file.type.startsWith('image/'));
      if (invalidFiles.length > 0) {
        setImageUploadError(`Invalid file types detected. Please select only image files.`);
        return;
      }

      setUploading(true);
      setImageUploadError(false);
      setUploadProgress(0);
      const promises = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        promises.push(storeImage(selectedFiles[i]));
      }
      Promise.all(promises)
        .then((urls) => {
          setFormData({
            ...formData,
            imageUrls: formData.imageUrls.concat(urls),
          });
          setImageUploadError(false);
          setUploading(false);
          setUploadProgress(100);
          setFiles([]); // Clear selected files after successful upload
        })
        .catch((error) => {
          console.error('Upload error:', error);
          let errorMessage = 'Image upload failed.';
          
          if (error.message) {
            errorMessage = `Upload failed: ${error.message}`;
          }
          
          setImageUploadError(errorMessage);
          setUploading(false);
          setUploadProgress(0);
        });
    } else {
      setImageUploadError('You can only upload up to 6 images.');
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const validFiles = droppedFiles.filter(file => 
        file.type.startsWith('image/') && file.size <= 2 * 1024 * 1024
      );
      
      if (validFiles.length !== droppedFiles.length) {
        setImageUploadError('Some files were invalid. Only image files under 2MB are allowed.');
      }
      
      if (validFiles.length > 0) {
        setFiles(validFiles);
      }
    }
  };

  const storeImage = (file) => {
    return new Promise((resolve, reject) => {
      // Double-check file size before upload
      if (file.size > 2 * 1024 * 1024) {
        reject(new Error(`File "${file.name}" is ${(file.size / (1024 * 1024)).toFixed(2)}MB, which exceeds the 2MB limit.`));
        return;
      }

      // Use Cloudinary upload
      uploadToCloudinary(file)
        .then((url) => {
          resolve(url);
        })
        .catch((error) => {
          console.error('Cloudinary upload error:', error);
          reject(error);
        });
    });
  };

  const handleChange = (e) => {
    const { id, value, checked, type } = e.target;
  
    if (id === 'city') {
      setFormData({
        ...formData,
        city: value,
        district: '',
      });
    } else if (type === 'checkbox') {
      setFormData({
        ...formData,
        [id]: checked,
      });
    } else {
      setFormData({
        ...formData,
        [id]: value,
      });
    }
  };

  const handlePhoneChange = (value) => {
    setFormData({
      ...formData,
      phoneNumber: value || ''
    });
  };
  
  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  const handleSizeToggle = (size) => {
    const currentSizes = formData.availableSizes;
    
    if (currentSizes.includes(size)) {
      // Remove size
      setFormData({
        ...formData,
        availableSizes: currentSizes.filter(s => s !== size),
      });
    } else {
      // Add size
      setFormData({
        ...formData,
        availableSizes: [...currentSizes, size],
      });
    }
  };

  const validateForm = () => {
    if (formData.imageUrls.length === 0) {
      setError('At least one image is required');
      return false;
    }
    if (formData.name.length < 4) {
      setError('Name must be at least 4 characters long');
      return false;
    }
    if (formData.description.length < 10) {
      setError('Description must be at least 10 characters long');
      return false;
    }
    
    // Validate clothing sizes
    if (formData.type === 'Clothing & Wearables') {
      if (formData.availableSizes.length === 0) {
        setError('Please select at least one size for clothing items');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(false);

      // Prepare submit data with conditional field handling
      const submitData = {
        ...formData,
        userRef: currentUser._id,
        cadreProfit: formData.price * 0.10, // 10% platform fee
      };

      // Remove fields that shouldn't be updated
      delete submitData._id;
      delete submitData.createdAt;
      delete submitData.__v;
      delete submitData.initialQuantity;
      delete submitData.currentQuantity;
      delete submitData.soldQuantity;
      delete submitData.listingType;

      if (formData.type === 'Clothing & Wearables') {
        // Remove dimension fields for clothing
        delete submitData.dimensions;
        delete submitData.width;
        delete submitData.height;
        delete submitData.depth;
      } else {
        // Remove sizes field for non-clothing
        delete submitData.availableSizes;
      }

      console.log('🔍 UpdateListing: Sending data:', JSON.stringify(submitData, null, 2));
      
      const res = await authenticatedFetch(`${import.meta.env.VITE_API_URL || ''}/api/listing/update/${params.id}`, {
        method: 'POST',
        body: JSON.stringify(submitData),
      });
  
      console.log('🔍 UpdateListing: Response received:', res);
      
      // authenticatedFetch already returns the parsed JSON response
      if (res.success === false) {
        console.error('🔍 UpdateListing: Error response:', res);
        setLoading(false);
        return setError(res.message || 'Failed to update the listing.');
      }
      
      console.log('🔍 UpdateListing: Success response:', res);
      setLoading(false);

      // Custom success toast
      toast.custom((toastData) => (
        <div
          className={`${
            toastData.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-[#f3eb4b] shadow-lg rounded-none pointer-events-auto flex items-center justify-between`}
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          <div className="flex items-center gap-2 p-4">
            <div className="bg-[#db2b2e] p-2">
              <FiCheck className="text-white text-xl" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className={`text-[#db2b2e] font-bold ${isArabic ? 'font-noto' : 'font-primary'}`}>
                {successToastTexts.listingUpdated || 'Listing updated!'}
              </h3>
              <p className={`text-[#db2b2e] text-sm ${isArabic ? 'font-noto' : 'font-secondary'}`}>
                {successToastTexts.pendingApproval || 'Your listing is now pending approval'}
              </p>
            </div>
          </div>
        </div>
      ), {
        duration: 3000,
        position: 'top-center',
      });
    
      navigate(`/listing/${params.id}`);
    } catch (err) {
      setLoading(false);
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    }
  };

  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-3 max-w-4xl mx-auto min-h-screen py-16"
    >
      <div className="bg-black/50 p-8 border border-[#db2b2e]">
        <h1 className="text-4xl font-bold text-left mb-8 font-nt text-white border-b border-[#db2b2e] pb-4">
          Update Listing
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8 text-white font-nt">
          {/* Images Section */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Images</h2>
            <div className="flex gap-4">
              <input
                type="file"
                id="images"
                accept="image/*"
                multiple
                onChange={(e) => setFiles(e.target.files)}
                className="p-3 border border-[#db2b2e] w-full"
              />
              <button
                type="button"
                onClick={handleImageSubmit}
                className="p-3 text-[#db2b2e] border border-[#db2b2e] uppercase hover:bg-[#db2b2e] hover:text-black transition-colors"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
            <p className="text-red-700 text-sm">
              {imageUploadError && imageUploadError}
            </p>
            {formData.imageUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {formData.imageUrls.map((url, index) => (
                  <div key={url} className="relative group">
                    <img
                      src={url}
                      alt="listing"
                      className="h-40 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Basic Information */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Basic Information</h2>
            <input
              type="text"
              placeholder="Listing Name"
              id="name"
              required
              minLength="4"
              maxLength="62"
              value={formData.name}
              onChange={handleChange}
              className="border border-[#db2b2e] bg-black/50 p-3 w-full focus:outline-none focus:border-[#db2b2e]/80"
            />
            <textarea
              placeholder="Description"
              id="description"
              required
              value={formData.description}
              onChange={handleChange}
              className="border border-[#db2b2e] bg-black/50 p-3 w-full focus:outline-none focus:border-[#db2b2e]/80 min-h-[150px]"
            />
            <select
              id="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="border border-[#db2b2e] bg-black/50 p-3 w-full focus:outline-none focus:border-[#db2b2e]/80"
            >
              {artTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Dimensions or Sizes based on type */}
          {formData.type === 'Clothing & Wearables' ? (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold">Available Sizes</h2>
              <div className="flex flex-col gap-3">
                <p className="text-sm text-gray-400">Select all available sizes for this clothing item:</p>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {clothingSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleSizeToggle(size)}
                      className={`p-3 border text-center transition-colors ${
                        formData.availableSizes.includes(size)
                          ? 'bg-[#db2b2e] text-white border-[#db2b2e]'
                          : 'bg-black/50 text-white border-[#db2b2e] hover:bg-[#db2b2e]/20'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {formData.availableSizes.length > 0 && (
                  <div className="text-sm text-gray-400">
                    Selected sizes: {formData.availableSizes.join(', ')}
                  </div>
                )}
              </div>
            </div>
          ) : (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Dimensions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                id="dimensions"
                value={formData.dimensions}
                onChange={handleChange}
                className="border border-[#db2b2e] bg-black/50 p-3 w-full focus:outline-none focus:border-[#db2b2e]/80"
              >
                <option value="2D">2D</option>
                <option value="3D">3D</option>
              </select>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <input
                  type="number"
                  placeholder="Width (cm)"
                  id="width"
                  required
                  min="1"
                  value={formData.width}
                  onChange={handleChange}
                  className="border border-[#db2b2e] bg-black/50 p-3 w-full focus:outline-none focus:border-[#db2b2e]/80"
                />
                <input
                  type="number"
                  placeholder="Height (cm)"
                  id="height"
                  required
                  min="1"
                  value={formData.height}
                  onChange={handleChange}
                  className="border border-[#db2b2e] bg-black/50 p-3 w-full focus:outline-none focus:border-[#db2b2e]/80"
                />
                {formData.dimensions === '3D' && (
                  <input
                    type="number"
                    placeholder="Depth (cm)"
                    id="depth"
                    required
                    min="1"
                    value={formData.depth}
                    onChange={handleChange}
                    className="border border-[#db2b2e] bg-black/50 p-3 w-full focus:outline-none focus:border-[#db2b2e]/80"
                  />
                )}
              </div>
            </div>
          </div>
          )}

          {/* Location */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Location</h2>
            <input
              type="text"
              placeholder="Address"
              id="address"
              required
              value={formData.address}
              onChange={handleChange}
              className="border border-[#db2b2e] bg-black/50 p-3 w-full focus:outline-none focus:border-[#db2b2e]/80"
            />
            <select
              id="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="border border-[#db2b2e] bg-black/50 p-3 w-full focus:outline-none focus:border-[#db2b2e]/80"
            >
              <option value="">Select City</option>
              <option value="Cairo">Cairo</option>
              <option value="Other">Other</option>
            </select>
            {formData.city === 'Cairo' && (
              <select
                id="district"
                value={formData.district}
                onChange={handleChange}
                required
                className="border border-[#db2b2e] bg-black/50 p-3 w-full focus:outline-none focus:border-[#db2b2e]/80"
              >
                <option value="">Select District</option>
                {cairoDistricts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            )}
            {formData.city === 'Other' && (
              <input
                type="text"
                placeholder="Enter your district"
                id="district"
                required
                value={formData.district}
                onChange={handleChange}
                className="border border-[#db2b2e] bg-black/50 p-3 w-full focus:outline-none focus:border-[#db2b2e]/80"
              />
            )}
          </div>

          {/* Price & Service Section */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold border-b border-[#db2b2e] pb-2">Pricing & Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-300">Price (EGP)</label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    placeholder="Price (EGP)"
                    id="price"
                    required
                    min="100"
                    value={formData.price}
                    onChange={handleChange}
                    className="border border-[#db2b2e] bg-black/50 p-3 w-full focus:outline-none focus:border-[#db2b2e]/80"
                  />
                </div>
                <div className="text-sm space-y-1">
                  <div className="text-gray-400">Platform Fee (10%): 
                    <span className="text-white ml-2">
                      {(formData.price * 0.10).toLocaleString()} EGP
                    </span>
                  </div>
                  {formData.cadremarketsService && (
                    <div className="text-gray-400">Service Fee: 
                      <span className="text-white ml-2">400 EGP</span>
                    </div>
                  )}
                  <div className="text-gray-400 pt-2 border-t border-gray-700">Your Profit: 
                    <span className="text-white ml-2">
                      {calculateSellerProfit(formData.price, formData.cadremarketsService, formData.servicePaymentMethod).toLocaleString()} EGP
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold border-b border-[#db2b2e] pb-2">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-300">Contact Preference</label>
                <select
                  id="contactPreference"
                  value={formData.contactPreference}
                  onChange={handleChange}
                  className="border border-[#db2b2e] bg-black/50 p-3 w-full focus:outline-none focus:border-[#db2b2e]/80"
                >
                  <option value="Phone Number">Phone Number</option>
                  <option value="Email">Email</option>
                </select>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-300">Phone Number</label>
                <PhoneInput
                  value={formData.phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="Phone Number"
                  className="border border-[#db2b2e] bg-black/50 p-3 w-full focus:outline-none focus:border-[#db2b2e]/80"
                />
              </div>
            </div>
          </div>

          {/* Quantity Information (Read-only for existing listings) */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold border-b border-[#db2b2e] pb-2">Quantity Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-3 border border-[#db2b2e]">
                <h3 className="font-medium mb-2">Stock Information</h3>
                <div className="space-y-1 text-sm">
                  <p>Initial Quantity: {formData.initialQuantity}</p>
                  <p>Current Quantity: {formData.currentQuantity}</p>
                  <p>Sold Quantity: {formData.soldQuantity}</p>
                  <p className="mt-2 pt-2 border-t border-[#db2b2e]/20">
                    Listing Type: {formData.listingType === 'unique' ? 'Unique' : 'Stock'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 border border-[#db2b2e] bg-[#db2b2e]/5">
              <p className="text-[#db2b2e] text-center">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="bg-[#db2b2e] border border-[#db2b2e] text-white p-3 uppercase hover:bg-transparent hover:text-[#db2b2e] transition-colors disabled:opacity-80 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Listing'}
          </button>
        </form>
      </div>
    </motion.main>
  );
}
