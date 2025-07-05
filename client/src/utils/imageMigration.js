/**
 * Image Migration Utility
 * This utility helps migrate existing local server images to Firebase Storage
 */

import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { app } from '../firebase';

/**
 * Upload a local image to Firebase Storage
 * @param {string} localImageUrl - The local image URL to migrate
 * @param {string} listingId - The listing ID for organization
 * @returns {Promise<string>} - The new Firebase Storage URL
 */
export const migrateImageToFirebase = async (localImageUrl, listingId) => {
  try {
    // Check if it's already a Firebase URL
    if (localImageUrl.includes('firebasestorage.app') || localImageUrl.includes('firebase.com')) {
      return localImageUrl;
    }

    // Fetch the image from the local server
    const response = await fetch(localImageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const blob = await response.blob();
    
    // Get current user for organization
    const auth = getAuth(app);
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error('User must be authenticated to migrate images');
    }

    // Create a unique filename
    const filename = `migrated/${currentUser.uid}/${listingId}/${Date.now()}-${localImageUrl.split('/').pop()}`;
    
    // Upload to Firebase Storage
    const storage = getStorage(app);
    const storageRef = ref(storage, filename);
    
    await uploadBytes(storageRef, blob);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    console.log(`Successfully migrated image: ${localImageUrl} -> ${downloadURL}`);
    return downloadURL;
    
  } catch (error) {
    console.error('Failed to migrate image:', error);
    throw error;
  }
};

/**
 * Migrate all images for a listing
 * @param {Object} listing - The listing object with imageUrls array
 * @returns {Promise<Object>} - The listing with updated imageUrls
 */
export const migrateListingImages = async (listing) => {
  if (!listing.imageUrls || !Array.isArray(listing.imageUrls)) {
    return listing;
  }

  const migratedUrls = [];
  
  for (const imageUrl of listing.imageUrls) {
    try {
      const newUrl = await migrateImageToFirebase(imageUrl, listing._id);
      migratedUrls.push(newUrl);
    } catch (error) {
      console.error(`Failed to migrate image ${imageUrl}:`, error);
      // Keep the original URL if migration fails
      migratedUrls.push(imageUrl);
    }
  }

  return {
    ...listing,
    imageUrls: migratedUrls
  };
};

/**
 * Check if an image URL needs migration
 * @param {string} imageUrl - The image URL to check
 * @returns {boolean} - True if the image needs migration
 */
export const needsMigration = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') return false;
  
  // Check if it's a local server URL
  return imageUrl.startsWith('/uploads/') || 
         imageUrl.includes('localhost') || 
         imageUrl.includes('127.0.0.1') ||
         imageUrl.includes('cadremarkets.vercel.app');
}; 