const fs = require('fs').promises;
const path = require('path');
const Project = require('../models/Project');

async function cleanupUploads() {
  try {
    // Get all project images and videos from the database
    const projects = await Project.find({}, 'images video');
    
    // Collect all active file URLs
    const activeImageUrls = new Set(
      projects.flatMap(project => project.images.map(img => img.url))
    );
    const activeVideoUrls = new Set(
      projects.filter(p => p.video?.url).map(p => p.video.url)
    );

    // Clean up images
    const imagesDir = path.join(__dirname, '../../public/uploads/projects/images');
    const videosDir = path.join(__dirname, '../../public/uploads/projects/videos');

    // Create directories if they don't exist
    await fs.mkdir(imagesDir, { recursive: true });
    await fs.mkdir(videosDir, { recursive: true });

    // Clean up image files
    try {
      const imageFiles = await fs.readdir(imagesDir);
      for (const file of imageFiles) {
        const fileUrl = `/uploads/projects/images/${file}`;
        if (!activeImageUrls.has(fileUrl)) {
          try {
            await fs.unlink(path.join(imagesDir, file));
            console.log(`Deleted unused image: ${file}`);
          } catch (error) {
            console.error(`Failed to delete image ${file}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up images:', error);
    }

    // Clean up video files
    try {
      const videoFiles = await fs.readdir(videosDir);
      for (const file of videoFiles) {
        const fileUrl = `/uploads/projects/videos/${file}`;
        if (!activeVideoUrls.has(fileUrl)) {
          try {
            await fs.unlink(path.join(videosDir, file));
            console.log(`Deleted unused video: ${file}`);
          } catch (error) {
            console.error(`Failed to delete video ${file}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up videos:', error);
    }

    console.log('Cleanup completed successfully');
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
}

// Export for use in cron job or manual cleanup
module.exports = cleanupUploads;

// Run cleanup if called directly
if (require.main === module) {
  cleanupUploads();
} 