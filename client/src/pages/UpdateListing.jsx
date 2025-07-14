import { useEffect, useState } from 'react';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
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

const calculateSellerProfit = (price, usesCadreService, servicePaymentMethod) => {
  const platformFee = price * 0.10; // 10% platform fee
  const serviceFee = usesCadreService && servicePaymentMethod === 'deductFromProfit' ? 400 : 0;
  return price - serviceFee - platformFee;
};

export default function UpdateListing() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const params = useParams();
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
    price: 1000,
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

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/listing/get/${params.listingId}`);
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
  }, [params.listingId]);

  const handleImageSubmit = () => {
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
      // Validate file sizes before upload
      const filesArray = Array.from(files);
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
      const promises = [];

      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }
      Promise.all(promises)
        .then((urls) => {
          setFormData({
            ...formData,
            imageUrls: formData.imageUrls.concat(urls),
          });
          setImageUploadError(false);
          setUploading(false);
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
        });
    } else {
      setImageUploadError('You can only upload up to 6 images.');
      setUploading(false);
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
        () => {
          // Optional: You can add progress tracking here if needed
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

      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/listing/update/${params.listingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });
  
      const data = await res.json();
      setLoading(false);
    
      if (!data.success === false) {
        setError(data.message || 'Failed to update the listing.');
        return;
      }
    
      navigate(`/listing/${params.listingId}`);
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
                    min="1000"
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
                <input
                  type="tel"
                  placeholder="Phone Number"
                  id="phoneNumber"
                  pattern="[0-9]{10,15}"
                  required
                  value={formData.phoneNumber}
                  onChange={handleChange}
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
