/**
 * Utility functions for handling image URLs in listings
 */

/**
 * Check if an image URL is a local server URL (needs to be converted)
 * @param {string} url - The image URL to check
 * @returns {boolean} - True if it's a local server URL
 */
export const isLocalServerUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  // Check if it's a relative path starting with /uploads/
  if (url.startsWith('/uploads/')) return true;
  
  // Check if it's a local server URL (localhost or specific domain)
  const localDomains = [
    'localhost',
    '127.0.0.1',
    'cadremarkets.vercel.app' // This domain doesn't serve local files
  ];
  
  try {
    const urlObj = new URL(url);
    return localDomains.some(domain => urlObj.hostname.includes(domain));
  } catch {
    // If URL parsing fails, assume it's a relative path
    return url.startsWith('/');
  }
};

/**
 * Get a placeholder image URL for missing images
 * @returns {string} - Placeholder image URL
 */
export const getPlaceholderImageUrl = () => {
  return 'https://via.placeholder.com/400x300?text=Image+Not+Available';
};

/**
 * Process image URLs to handle missing images gracefully
 * @param {string} imageUrl - The original image URL
 * @returns {string} - Processed image URL or placeholder
 */
export const processImageUrl = (imageUrl) => {
  if (!imageUrl) return getPlaceholderImageUrl();
  
  // If it's a local server URL, return placeholder
  if (isLocalServerUrl(imageUrl)) {
    console.warn('Local server image URL detected, using placeholder:', imageUrl);
    return getPlaceholderImageUrl();
  }
  
  return imageUrl;
};

/**
 * Process an array of image URLs for a listing
 * @param {string[]} imageUrls - Array of image URLs
 * @returns {string[]} - Processed array of image URLs
 */
export const processImageUrls = (imageUrls) => {
  if (!Array.isArray(imageUrls)) return [getPlaceholderImageUrl()];
  
  return imageUrls.map(url => processImageUrl(url)).filter(url => url);
};

/**
 * Get the main image URL for a listing (first image or placeholder)
 * @param {string[]} imageUrls - Array of image URLs
 * @returns {string} - Main image URL
 */
export const getMainImageUrl = (imageUrls) => {
  if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
    return getPlaceholderImageUrl();
  }
  
  const processedUrl = processImageUrl(imageUrls[0]);
  return processedUrl;
}; 