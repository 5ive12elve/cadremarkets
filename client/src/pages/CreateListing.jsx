import { useState, useEffect } from 'react';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiCheck, FiArrowLeft, FiUpload, FiX, FiImage, FiTrash2 } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../locales/translations';
import { getAuth } from 'firebase/auth';

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

const calculateSellerProfit = (price, usesCadreService) => {
  const serviceFee = usesCadreService ? 400 : 0;
  const platformFee = price * 0.10; // 10% platform fee
  return price - serviceFee - platformFee;
};

export default function CreateListing() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const { isArabic } = useLanguage();
  
  // Helper text translations
  const helperText = {
    images: useTranslation('createListingHelpers', 'images', isArabic ? 'ar' : 'en'),
    name: useTranslation('createListingHelpers', 'name', isArabic ? 'ar' : 'en'),
    description: useTranslation('createListingHelpers', 'description', isArabic ? 'ar' : 'en'),
    type: useTranslation('createListingHelpers', 'type', isArabic ? 'ar' : 'en'),
    sizes: useTranslation('createListingHelpers', 'sizes', isArabic ? 'ar' : 'en'),
    dimensions: useTranslation('createListingHelpers', 'dimensions', isArabic ? 'ar' : 'en'),
    width: useTranslation('createListingHelpers', 'width', isArabic ? 'ar' : 'en'),
    height: useTranslation('createListingHelpers', 'height', isArabic ? 'ar' : 'en'),
    depth: useTranslation('createListingHelpers', 'depth', isArabic ? 'ar' : 'en'),
    address: useTranslation('createListingHelpers', 'address', isArabic ? 'ar' : 'en'),
    city: useTranslation('createListingHelpers', 'city', isArabic ? 'ar' : 'en'),
    district: useTranslation('createListingHelpers', 'district', isArabic ? 'ar' : 'en'),
    price: useTranslation('createListingHelpers', 'price', isArabic ? 'ar' : 'en'),
    service: useTranslation('createListingHelpers', 'service', isArabic ? 'ar' : 'en'),
    contact: useTranslation('createListingHelpers', 'contact', isArabic ? 'ar' : 'en'),
    phone: useTranslation('createListingHelpers', 'phone', isArabic ? 'ar' : 'en'),
    quantity: useTranslation('createListingHelpers', 'quantity', isArabic ? 'ar' : 'en'),
  };

  // Success toast translations
  const successToastTexts = {
    listingCreated: isArabic ? 'تم إنشاء الإعلان!' : 'Listing created!',
    pendingApproval: isArabic ? 'إعلانك الآن قيد المراجعة' : 'Your listing is now pending approval',
  };
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
    'Paintings & Drawings',
    'Sculptures & 3D Art',
    'Antiques & Collectibles',
    'Clothing & Wearables',
    'Home Décor',
    'Accessories',
    'Prints & Posters',
  ];

  const cairoDistricts = [
    'Maadi',
    'Heliopolis',
    'Nasr City',
    'New Cairo',
    'Zamalek',
    'Garden City',
    'Downtown Cairo',
    'Dokki',
    'Mohandessin',
    '6th of October',
    'Sheikh Zayed',
    'Giza',
    'Haram',
    'Shoubra',
    'Ain Shams',
    'El Matareya',
    'Madinaty',
    'El Rehab',
    'El Tagamoa El Khames',
    'Other'
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

  const handleImageSubmit = (selectedFiles = files) => {
    // Convert FileList to Array if needed
    const filesArray = selectedFiles ? Array.from(selectedFiles) : [];
    
    if (filesArray.length === 0) {
      setImageUploadError('Please select images to upload.');
      return;
    }

    if (filesArray.length + formData.imageUrls.length > 6) {
      setImageUploadError(`You can only upload up to 6 images total. You currently have ${formData.imageUrls.length} uploaded, so you can add ${6 - formData.imageUrls.length} more.`);
      return;
    }

    // Validate file sizes before upload
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

    for (let i = 0; i < filesArray.length; i++) {
      promises.push(storeImage(filesArray[i]));
    }
    Promise.all(promises)
      .then((urls) => {
        setFormData({
          ...formData,
          imageUrls: formData.imageUrls.concat(urls),
        });
        setImageUploadError(false);
        setUploading(false);
        setUploadProgress(0);
        setFiles([]);
      })
      .catch((error) => {
        console.error('Upload error:', error);
        let errorMessage = 'Image upload failed.';
        
        if (error.code) {
          switch (error.code) {
            case 'storage/unauthorized':
              errorMessage = 'Upload failed: You are not authorized to upload images.';
              break;
            case 'storage/canceled':
              errorMessage = 'Upload was canceled.';
              break;
            case 'storage/unknown':
              errorMessage = 'Upload failed: An unknown error occurred.';
              break;
            case 'storage/object-not-found':
              errorMessage = 'Upload failed: Storage location not found.';
              break;
            case 'storage/quota-exceeded':
              errorMessage = 'Upload failed: Storage quota exceeded.';
              break;
            case 'storage/unauthenticated':
              errorMessage = 'Upload failed: Please sign in to upload images.';
              break;
            case 'storage/retry-limit-exceeded':
              errorMessage = 'Upload failed: Too many attempts. Please try again later.';
              break;
            default:
              errorMessage = `Upload failed: ${error.message || 'Unknown error'}`;
          }
        } else if (error.message) {
          errorMessage = `Upload failed: ${error.message}`;
        }
        
        setImageUploadError(errorMessage);
        setUploading(false);
        setUploadProgress(0);
      });
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
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const fileArray = Array.from(droppedFiles);
      const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
      
      if (imageFiles.length !== fileArray.length) {
        setImageUploadError('Only image files are allowed.');
        return;
      }
      
      if (imageFiles.length + formData.imageUrls.length > 6) {
        setImageUploadError('You can only upload up to 6 images total.');
        return;
      }
      
      // Convert array back to FileList-like object for consistency
      const dataTransfer = new DataTransfer();
      imageFiles.forEach(file => dataTransfer.items.add(file));
      setFiles(dataTransfer.files);
      handleImageSubmit(dataTransfer.files);
    }
  };

  const storeImage = (file) => {
    return new Promise((resolve, reject) => {
      // Double-check file size before Firebase upload
      if (file.size > 2 * 1024 * 1024) {
        reject(new Error(`File "${file.name}" is ${(file.size / (1024 * 1024)).toFixed(2)}MB, which exceeds the 2MB limit.`));
        return;
      }

      // Check if user is authenticated
      const storage = getStorage(app);
      const auth = getAuth(app);
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        // User not authenticated - require authentication for uploads
        reject(new Error('Please sign in to upload images.'));
        return;
      }

      // Use a more specific path structure for better organization
      const fileName = `listings/${currentUser.uid}/${new Date().getTime()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (error) => {
          console.error('Firebase Storage Error Details:', {
            code: error.code,
            message: error.message,
            serverResponse: error.serverResponse,
            customMetadata: error.customMetadata
          });
          
          // Enhanced error handling with better error messages
          let errorMessage = 'Upload failed';
          
          switch (error.code) {
            case 'storage/unauthorized':
              errorMessage = 'Upload failed: You are not authorized to upload images.';
              break;
            case 'storage/canceled':
              errorMessage = 'Upload was canceled.';
              break;
            case 'storage/unknown':
              errorMessage = 'Upload failed: An unknown error occurred. Please try again.';
              break;
            case 'storage/object-not-found':
              errorMessage = 'Upload failed: Storage location not found.';
              break;
            case 'storage/quota-exceeded':
              errorMessage = 'Upload failed: Storage quota exceeded.';
              break;
            case 'storage/unauthenticated':
              errorMessage = 'Upload failed: Please sign in to upload images.';
              break;
            case 'storage/retry-limit-exceeded':
              errorMessage = 'Upload failed: Too many attempts. Please try again later.';
              break;
            default:
              errorMessage = `Upload failed: ${error.message || 'Unknown error'}`;
          }
          
          reject(new Error(errorMessage));
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              // Upload successful
              resolve(downloadURL);
            })
            .catch((error) => {
              console.error('Error getting download URL:', error);
              reject(new Error('Upload completed but failed to get download URL. Please try again.'));
            });
        }
      );
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
    } else if (id === 'initialQuantity') {
      const quantity = parseInt(value) || 1;
      setFormData({
        ...formData,
        initialQuantity: quantity,
        currentQuantity: quantity,
        listingType: quantity === 1 ? 'unique' : 'stock',
      });
    } else if (id === 'type') {
      // Reset dimensions and sizes when type changes
      setFormData({
        ...formData,
        type: value,
        dimensions: '2D',
        width: '',
        height: '',
        depth: '',
        availableSizes: [],
      });
    } else if (type === 'checkbox') {
      setFormData({
        ...formData,
        [id]: checked,
      });
    } else if (id === 'price') {
      const price = parseFloat(value) || 0;
      setFormData({
        ...formData,
        price: price,
        cadremarketsService: price >= 400 ? formData.cadremarketsService : false,
      });
    } else {
      setFormData({
        ...formData,
        [id]: value,
      });
    }
  };

  const handleSizeToggle = (size) => {
    const currentSizes = formData.availableSizes;
    const isSelected = currentSizes.includes(size);
    
    if (isSelected) {
      setFormData({
        ...formData,
        availableSizes: currentSizes.filter(s => s !== size),
      });
    } else {
      setFormData({
        ...formData,
        availableSizes: [...currentSizes, size],
      });
    }
  };
  
  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
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
        setError('Please select at least one available size for clothing items');
        return false;
      }
    } else {
      // Validate dimensions for non-clothing items
      if (!formData.width || !formData.height) {
        setError('Width and height are required for non-clothing items');
        return false;
      }
      if (formData.dimensions === '3D' && !formData.depth) {
        setError('Depth is required for 3D items');
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

      // Prepare data based on listing type
      const submitData = {
        ...formData,
        userRef: currentUser._id,
        status: 'Pending',
        listingType: formData.initialQuantity === 1 ? 'unique' : 'stock',
        currentQuantity: formData.initialQuantity,
        soldQuantity: 0,
        cadreProfit: formData.price * 0.10, // 10% platform fee
      };

      // Remove dimensions/sizes fields based on type
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

      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/listing/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });
  
      const data = await res.json();
      setLoading(false);
    
      if (!data.success) {
        return setError(data.message || 'Failed to create the listing.');
      }
    
      if (!data.id) {
        console.error('Missing listing ID in response:', data);
        return setError('Listing created, but no ID returned. Please check the server.');
      }

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
                {successToastTexts.listingCreated || 'Listing created!'}
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
    
      navigate(`/listing/${data.id}`);
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
      className="p-3 max-w-4xl mx-auto min-h-screen py-16 bg-white dark:bg-black text-black dark:text-white transition-colors duration-300"
      dir="ltr"
    >
      <div className="bg-gray-50 dark:bg-black/50 p-8 border border-[#db2b2e] dark:border-primary">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 border border-[#db2b2e] dark:border-primary text-[#db2b2e] dark:text-primary hover:bg-[#db2b2e] dark:hover:bg-primary hover:text-white dark:hover:text-black transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-4xl font-bold font-nt text-black dark:text-white">
            Create a Listing
          </h1>
        </div>
        <div className="border-b border-[#db2b2e] dark:border-primary mb-8"></div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8 text-black dark:text-white font-nt">
          {/* Enhanced Images Section */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <FiImage className="text-2xl text-[#db2b2e] dark:text-primary" />
              <h2 className="text-xl font-semibold">Images</h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({formData.imageUrls.length}/6)
              </span>
              {isArabic && (
                <span className="text-xs text-gray-400 dark:text-gray-500 opacity-60">
                  {helperText.images}
                </span>
              )}
            </div>
            
            {/* Drag & Drop Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 transition-all duration-300 ${
                dragActive
                  ? 'border-[#db2b2e] dark:border-primary bg-[#db2b2e]/5 dark:bg-primary/5'
                  : 'border-gray-300 dark:border-gray-600 hover:border-[#db2b2e] dark:hover:border-primary'
              } ${formData.imageUrls.length >= 6 ? 'opacity-50 pointer-events-none' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
                             <input
                 type="file"
                 id="images"
                 accept="image/*"
                 multiple
                 onChange={(e) => setFiles(e.target.files)}
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                 disabled={formData.imageUrls.length >= 6}
               />
              
              <div className="text-center">
                <FiUpload className="mx-auto text-4xl text-gray-400 dark:text-gray-500 mb-4" />
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {dragActive ? 'Drop images here' : 'Drag & drop images here'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  or click to browse files
                </p>
                <div className="flex flex-col sm:flex-row gap-2 items-center justify-center">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    PNG, JPG, JPEG up to 2MB each
                  </span>
                  <span className="hidden sm:inline text-gray-400 dark:text-gray-500">•</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    Maximum 6 images
                  </span>
                </div>
              </div>
            </div>

                         {/* Selected files preview (before upload) */}
             {files && files.length > 0 && !uploading && (
               <div className="flex flex-col gap-3">
                 <div className="flex items-center justify-between">
                   <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                     Selected Files ({files.length})
                   </h3>
                   <button
                     type="button"
                     onClick={() => handleImageSubmit()}
                     className="flex items-center gap-2 px-4 py-2 bg-[#db2b2e] dark:bg-primary text-white dark:text-black hover:bg-[#db2b2e]/90 dark:hover:bg-primary/90 transition-colors text-sm font-medium"
                   >
                     <FiUpload className="text-sm" />
                     Upload {files.length} image{files.length > 1 ? 's' : ''}
                   </button>
                 </div>
                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                   {Array.from(files).map((file, index) => (
                     <div key={index} className="relative">
                       <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                         <FiImage className="text-2xl text-gray-400 dark:text-gray-500" />
                       </div>
                       <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                         {file.name}
                       </p>
                     </div>
                   ))}
                 </div>
               </div>
             )}

            {/* Upload Progress */}
            {uploading && (
              <div className="bg-gray-50 dark:bg-black/50 p-4 border border-[#db2b2e] dark:border-primary">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-4 h-4 border-2 border-[#db2b2e] dark:border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-medium text-[#db2b2e] dark:text-primary">
                    Uploading images...
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-[#db2b2e] dark:bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {imageUploadError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                <div className="flex items-center gap-2">
                  <FiX className="text-red-500 dark:text-red-400" />
                  <p className="text-red-700 dark:text-red-400 text-sm font-medium">
                    {imageUploadError}
                  </p>
                </div>
              </div>
            )}

            {/* Uploaded Images Preview */}
            {formData.imageUrls.length > 0 && (
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  Uploaded Images ({formData.imageUrls.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.imageUrls.map((url, index) => (
                    <div key={url} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img
                          src={url}
                          alt={`listing ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                        title="Remove image"
                      >
                        <FiTrash2 className="text-sm" />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 bg-[#db2b2e] dark:bg-primary text-white dark:text-black px-2 py-1 text-xs font-medium rounded">
                          Main Image
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  The first image will be used as the main listing image. Drag to reorder.
                </p>
              </div>
            )}
          </div>

          {/* Basic Information */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Basic Information</h2>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Listing Name"
                id="name"
                required
                minLength="4"
                maxLength="62"
                value={formData.name}
                onChange={handleChange}
                className="border border-[#db2b2e] dark:border-primary bg-white dark:bg-black/50 p-3 w-full focus:outline-none focus:border-[#db2b2e] dark:focus:border-primary-light text-black dark:text-white"
              />
              {isArabic && (
                <span className="text-xs text-gray-400 dark:text-gray-500 opacity-60 font-noto">
                  {helperText.name}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <textarea
                placeholder="Description"
                id="description"
                required
                value={formData.description}
                onChange={handleChange}
                className="border border-[#db2b2e] dark:border-primary bg-white dark:bg-black/50 p-3 w-full focus:outline-none focus:border-[#db2b2e] dark:focus:border-primary-light min-h-[150px] text-black dark:text-white"
              />
              {isArabic && (
                <span className="text-xs text-gray-400 dark:text-gray-500 opacity-60 font-noto">
                  {helperText.description}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <select
                id="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="border border-[#db2b2e] dark:border-primary bg-white dark:bg-black/50 p-3 w-full focus:outline-none focus:border-[#db2b2e] dark:focus:border-primary-light text-black dark:text-white"
              >
                {artTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {isArabic && (
                <span className="text-xs text-gray-400 dark:text-gray-500 opacity-60 font-noto">
                  {helperText.type}
                </span>
              )}
            </div>
          </div>

          {/* Dimensions or Sizes based on type */}
          {formData.type === 'Clothing & Wearables' ? (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold">Available Sizes</h2>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Select all available sizes for this clothing item:</p>
                  {isArabic && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 opacity-60 font-noto">
                      {helperText.sizes}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {clothingSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleSizeToggle(size)}
                      className={`p-3 border text-center transition-colors ${
                        formData.availableSizes.includes(size)
                          ? 'bg-[#db2b2e] dark:bg-primary text-white dark:text-black border-[#db2b2e] dark:border-primary'
                          : 'bg-white dark:bg-black/50 text-black dark:text-white border-[#db2b2e] dark:border-primary hover:bg-[#db2b2e]/20 dark:hover:bg-primary/20'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {formData.availableSizes.length > 0 && (
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Selected sizes: {formData.availableSizes.join(', ')}
                  </div>
                )}
              </div>
            </div>
          ) : (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Dimensions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <select
                  id="dimensions"
                  value={formData.dimensions}
                  onChange={handleChange}
                  className="border border-[#db2b2e] dark:border-primary bg-white dark:bg-black/50 p-3 w-full focus:outline-none focus:border-[#db2b2e] dark:focus:border-primary-light text-black dark:text-white"
                >
                  <option value="2D">2D</option>
                  <option value="3D">3D</option>
                </select>
                {isArabic && (
                  <span className="text-xs text-gray-400 dark:text-gray-500 opacity-60 font-noto">
                    {helperText.dimensions}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <input
                    type="number"
                    placeholder="Width (cm)"
                    id="width"
                    required
                    min="1"
                    value={formData.width}
                    onChange={handleChange}
                    className="border border-[#db2b2e] dark:border-primary bg-white dark:bg-black/50 p-3 w-full focus:outline-none focus:border-[#db2b2e] dark:focus:border-primary-light text-black dark:text-white"
                  />
                  {isArabic && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 opacity-60 font-noto">
                      {helperText.width}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <input
                    type="number"
                    placeholder="Height (cm)"
                    id="height"
                    required
                    min="1"
                    value={formData.height}
                    onChange={handleChange}
                    className="border border-[#db2b2e] dark:border-primary bg-white dark:bg-black/50 p-3 w-full focus:outline-none focus:border-[#db2b2e] dark:focus:border-primary-light text-black dark:text-white"
                  />
                  {isArabic && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 opacity-60 font-noto">
                      {helperText.height}
                    </span>
                  )}
                </div>
                {formData.dimensions === '3D' && (
                  <div className="flex flex-col gap-1">
                    <input
                      type="number"
                      placeholder="Depth (cm)"
                      id="depth"
                      required
                      min="1"
                      value={formData.depth}
                      onChange={handleChange}
                      className="border border-[#db2b2e] dark:border-primary bg-white dark:bg-black/50 p-3 w-full focus:outline-none focus:border-[#db2b2e] dark:focus:border-primary-light text-black dark:text-white"
                    />
                    {isArabic && (
                      <span className="text-xs text-gray-400 dark:text-gray-500 opacity-60 font-noto">
                        {helperText.depth}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          )}

          {/* Location */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Location</h2>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Address"
                id="address"
                required
                value={formData.address}
                onChange={handleChange}
                className="border border-[#db2b2e] dark:border-primary bg-white dark:bg-black/50 p-3 w-full focus:outline-none focus:border-[#db2b2e] dark:focus:border-primary-light text-black dark:text-white"
              />
              {isArabic && (
                <span className="text-xs text-gray-400 dark:text-gray-500 opacity-60 font-noto">
                  {helperText.address}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <select
                id="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="border border-[#db2b2e] dark:border-primary bg-white dark:bg-black/50 p-3 w-full focus:outline-none focus:border-[#db2b2e] dark:focus:border-primary-light text-black dark:text-white"
              >
                <option value="">Select City</option>
                <option value="Cairo">Cairo</option>
                <option value="Other">Other</option>
              </select>
              {isArabic && (
                <span className="text-xs text-gray-400 dark:text-gray-500 opacity-60 font-noto">
                  {helperText.city}
                </span>
              )}
            </div>
            {formData.city === 'Cairo' && (
              <div className="flex flex-col gap-2">
                <select
                  id="district"
                  value={formData.district}
                  onChange={handleChange}
                  required
                  className="border border-[#db2b2e] dark:border-primary bg-white dark:bg-black/50 p-3 w-full focus:outline-none focus:border-[#db2b2e] dark:focus:border-primary-light text-black dark:text-white"
                >
                  <option value="">Select District</option>
                  {cairoDistricts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
                {isArabic && (
                  <span className="text-xs text-gray-400 dark:text-gray-500 opacity-60 font-noto">
                    {helperText.district}
                  </span>
                )}
              </div>
            )}
            {formData.city === 'Other' && (
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Enter your district"
                  id="district"
                  required
                  value={formData.district}
                  onChange={handleChange}
                  className="border border-[#db2b2e] dark:border-primary bg-white dark:bg-black/50 p-3 w-full focus:outline-none focus:border-[#db2b2e] dark:focus:border-primary-light text-black dark:text-white"
                />
                {isArabic && (
                  <span className="text-xs text-gray-400 dark:text-gray-500 opacity-60 font-noto">
                    {helperText.district}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Price & Service Section */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold border-b border-[#db2b2e] dark:border-primary pb-2">Pricing & Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Price Column */}
              <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-300">Price (EGP)</label>
                  <input
                    type="number"
                    placeholder="Price (EGP)"
                    id="price"
                    required
                    min="100"
                    value={formData.price}
                    onChange={handleChange}
                    className="border border-[#db2b2e] dark:border-primary bg-white dark:bg-black/50 p-3 w-full focus:outline-none focus:border-[#db2b2e] dark:focus:border-primary-light text-black dark:text-white"
                  />
                  {isArabic && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 opacity-60 font-noto">
                      {helperText.price}
                    </span>
                  )}
                </div>
                
                <div className="text-sm space-y-2">
                  <div className="text-gray-600 dark:text-gray-400">
                    Platform Fee (10%): <span className="text-black dark:text-white">{(formData.price * 0.10).toLocaleString()} EGP</span>
                  </div>
                  {formData.cadremarketsService && (
                    <div className="text-gray-600 dark:text-gray-400">
                      Service Fee: <span className="text-black dark:text-white">400 EGP</span>
                    </div>
                  )}
                  <div className="text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-300 dark:border-gray-700">
                    Your Profit: <span className="text-black dark:text-white">{calculateSellerProfit(formData.price, formData.cadremarketsService).toLocaleString()} EGP</span>
                  </div>
                </div>
              </div>
              
              {/* CadreMarkets Service Column */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-600 dark:text-gray-300">CadreMarkets Service</label>
                <div className="relative">
                  <label className={`flex items-center ${formData.price < 400 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                    <div className="relative">
                      <input
                        type="checkbox"
                        id="cadremarketsService"
                        checked={formData.cadremarketsService}
                        onChange={handleChange}
                        disabled={formData.price < 400}
                        className="sr-only"
                      />
                      <div className="w-14 h-7 bg-gray-300 dark:bg-gray-700 border border-[#db2b2e] dark:border-primary">
                        <div
                          className={`absolute left-0 top-0 w-7 h-7 transition-transform transform ${
                            formData.cadremarketsService ? 'translate-x-7 bg-[#db2b2e] dark:bg-primary' : 'translate-x-0 bg-gray-400 dark:bg-gray-500'
                          }`}
                        ></div>
                      </div>
                    </div>
                    <div className="ml-3 flex flex-col">
                        <span className="font-medium">Enable Service</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">+400 EGP</span>
                    </div>
                  </label>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  {formData.price < 400 && (
                    <p className="text-red-500 font-medium">• Service requires minimum price of 400 EGP</p>
                  )}
                  <p>• Featured placement among our 12 homepage slots</p>
                  <p>• Priority positioning above regular listings</p>
                  <p>• Professional photoshoot + 5 high-quality images</p>
                  {isArabic && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 opacity-60 font-noto mt-2 block">
                      {helperText.service}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold border-b border-[#db2b2e] dark:border-primary pb-2">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-300">Contact Preference</label>
                <select
                  id="contactPreference"
                  value={formData.contactPreference}
                  onChange={handleChange}
                  className="border border-[#db2b2e] dark:border-primary bg-white dark:bg-black/50 p-3 w-full focus:outline-none focus:border-[#db2b2e] dark:focus:border-primary-light text-black dark:text-white"
                >
                  <option value="Phone Number">Phone Number</option>
                  <option value="Email">Email</option>
                </select>
                {isArabic && (
                  <span className="text-xs text-gray-400 dark:text-gray-500 opacity-60 font-noto">
                    {helperText.contact}
                  </span>
                )}
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-300">Phone Number</label>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  id="phoneNumber"
                  pattern="[0-9]{10,15}"
                  required
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="border border-[#db2b2e] dark:border-primary bg-white dark:bg-black/50 p-3 w-full focus:outline-none focus:border-[#db2b2e] dark:focus:border-primary-light text-black dark:text-white"
                />
                {isArabic && (
                  <span className="text-xs text-gray-400 dark:text-gray-500 opacity-60 font-noto">
                    {helperText.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quantity Information */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold border-b border-[#db2b2e] dark:border-primary pb-2">Quantity Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-300">Initial Quantity</label>
                <input
                  type="number"
                  placeholder="Initial Quantity"
                  id="initialQuantity"
                  min="1"
                  value={formData.initialQuantity}
                  onChange={handleChange}
                  className="border border-[#db2b2e] dark:border-primary bg-white dark:bg-black/50 p-3 w-full focus:outline-none focus:border-[#db2b2e] dark:focus:border-primary-light text-black dark:text-white"
                />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Listing Type: <span className="text-black dark:text-white ml-2">{formData.initialQuantity === 1 ? 'Unique' : 'Stock'}</span>
                </div>
              </div>
              {formData.initialQuantity > 1 && (
                <div className="flex flex-col gap-2">
                  <div className="p-3 border border-[#db2b2e] dark:border-primary">
                    <h3 className="font-medium mb-2">Stock Information</h3>
                    <div className="space-y-1 text-sm">
                      <p>Initial Quantity: {formData.initialQuantity}</p>
                      <p>Current Quantity: {formData.initialQuantity}</p>
                      <p>Sold Quantity: 0</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-center">
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="bg-[#db2b2e] dark:bg-primary border border-[#db2b2e] dark:border-primary text-white dark:text-black p-3 uppercase hover:bg-transparent dark:hover:bg-transparent hover:text-[#db2b2e] dark:hover:text-primary transition-colors disabled:opacity-80 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Listing'}
          </button>
        </form>
      </div>
    </motion.main>
  );
}