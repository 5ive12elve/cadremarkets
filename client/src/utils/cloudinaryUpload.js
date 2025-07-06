/**
 * Cloudinary Upload Utility
 * Replaces Firebase Storage with Cloudinary for image uploads
 */

// Cloudinary configuration for unsigned uploads
const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dt7c4jpgf',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'cadremarkets'
};

/**
 * Upload a single image to Cloudinary
 * @param {File} file - The file to upload
 * @param {string} folder - The folder to upload to (e.g., 'listings', 'profiles')
 * @param {Function} onProgress - Progress callback function
 * @returns {Promise<string>} - The uploaded image URL
 */
export const uploadToCloudinary = (file, folder = 'listings', onProgress = null) => {
  return new Promise((resolve, reject) => {
    // Validate file
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    // Check file size (Cloudinary free tier: 10MB per file)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      reject(new Error('File size too large. Maximum size is 10MB.'));
      return;
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      reject(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'));
      return;
    }

    // Create FormData for upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    
    // Add folder if specified
    if (folder) {
      formData.append('folder', folder);
    }

    // Create XMLHttpRequest for progress tracking
    const xhr = new XMLHttpRequest();

    // Progress tracking
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = (event.loaded / event.total) * 100;
        onProgress(Math.round(progress));
      }
    });

    // Success handler
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          console.log('Cloudinary upload success:', response);
          resolve(response.secure_url);
        } catch {
          reject(new Error('Failed to parse upload response'));
        }
      } else {
        console.error('Cloudinary upload error response:', xhr.responseText);
        reject(new Error(`Upload failed with status: ${xhr.status} - ${xhr.responseText}`));
      }
    });

    // Error handler
    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed. Please check your internet connection.'));
    });

    // Abort handler
    xhr.addEventListener('abort', () => {
      reject(new Error('Upload was cancelled.'));
    });

    // Send the request
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`);
    xhr.send(formData);
  });
};

/**
 * Upload multiple images to Cloudinary
 * @param {File[]} files - Array of files to upload
 * @param {string} folder - The folder to upload to
 * @param {Function} onProgress - Progress callback for each file
 * @returns {Promise<string[]>} - Array of uploaded image URLs
 */
export const uploadMultipleToCloudinary = async (files, folder = 'listings', onProgress = null) => {
  const uploadPromises = files.map((file, index) => {
    return uploadToCloudinary(file, folder, (progress) => {
      if (onProgress) {
        onProgress(index, progress);
      }
    });
  });

  return Promise.all(uploadPromises);
};

/**
 * Delete an image from Cloudinary (if needed)
 * @param {string} publicId - The public ID of the image
 * @returns {Promise<boolean>} - Success status
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    const response = await fetch(`/api/cloudinary/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete image');
    }

    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};

/**
 * Get optimized image URL with transformations
 * @param {string} imageUrl - The original Cloudinary URL
 * @param {Object} options - Transformation options
 * @returns {string} - Optimized image URL
 */
export const getOptimizedImageUrl = (imageUrl, options = {}) => {
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
    return imageUrl;
  }

  const {
    width = 400,
    height = 300,
    quality = 'auto',
    format = 'auto',
    crop = 'fill'
  } = options;

  // Parse the Cloudinary URL and add transformations
  const baseUrl = imageUrl.split('/upload/')[0] + '/upload/';
  const imagePath = imageUrl.split('/upload/')[1];
  
  const transformations = `f_${format},q_${quality},w_${width},h_${height},c_${crop}`;
  
  return `${baseUrl}${transformations}/${imagePath}`;
};

/**
 * Check if a URL is from Cloudinary
 * @param {string} url - The URL to check
 * @returns {boolean} - True if it's a Cloudinary URL
 */
export const isCloudinaryUrl = (url) => {
  return url && url.includes('cloudinary.com');
};

/**
 * Migrate existing Firebase URLs to Cloudinary (if needed)
 * @param {string} firebaseUrl - The Firebase Storage URL
 * @returns {Promise<string>} - The new Cloudinary URL
 */
export const migrateFromFirebase = async (firebaseUrl) => {
  try {
    // Fetch the image from Firebase
    const response = await fetch(firebaseUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch image from Firebase');
    }

    const blob = await response.blob();
    const file = new File([blob], 'migrated-image.jpg', { type: blob.type });
    
    // Upload to Cloudinary
    const cloudinaryUrl = await uploadToCloudinary(file, 'migrated');
    
    console.log(`Successfully migrated: ${firebaseUrl} -> ${cloudinaryUrl}`);
    return cloudinaryUrl;
  } catch (error) {
    console.error('Failed to migrate image:', error);
    throw error;
  }
}; 