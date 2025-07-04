const path = require('path');
const fs = require('fs').promises;

const uploadImage = async (file) => {
  try {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../../public/uploads/projects/images');
    await fs.mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    const filepath = path.join(uploadsDir, filename);

    // Write file to disk
    await fs.writeFile(filepath, file.buffer);

    // Return the URL path that will be accessible from the frontend
    return `/uploads/projects/images/${filename}`;
  } catch (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

const uploadVideo = async (file) => {
  try {
    // Create videos directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../../public/uploads/projects/videos');
    await fs.mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    const filepath = path.join(uploadsDir, filename);

    // Write file to disk
    await fs.writeFile(filepath, file.buffer);

    // Get video file extension
    const fileExt = path.extname(file.originalname).toLowerCase().slice(1);

    // Return the URL path and video type
    return {
      url: `/uploads/projects/videos/${filename}`,
      type: fileExt
    };
  } catch (error) {
    throw new Error(`Failed to upload video: ${error.message}`);
  }
};

// Helper function to validate video file type
const isValidVideoType = (mimetype) => {
  const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
  return validTypes.includes(mimetype);
};

module.exports = { uploadImage, uploadVideo, isValidVideoType }; 