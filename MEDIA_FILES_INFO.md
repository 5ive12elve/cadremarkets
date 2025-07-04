# 📹 Media Files Information

## Excluded Video Files

The following large video files were excluded from the repository to enable successful GitHub upload:

### Removed Files:
- `client/public/mediassets/depscreeningfinal.mov` (120MB)
- `client/public/mediassets/Screening Anouncement.mp4` (22MB)

### Why were they excluded?
- GitHub has size limits for repositories and individual files
- Large video files were causing push failures with HTTP 408 timeout errors
- The repository is now optimized for deployment and collaboration

### How to add them back (if needed):
1. **Using Git LFS (Recommended):**
   ```bash
   git lfs track "*.mov" "*.mp4"
   git add .gitattributes
   # Add your video files back
   git add client/public/mediassets/
   git commit -m "Add video files via Git LFS"
   git push origin main
   ```

2. **Alternative hosting:**
   - Upload videos to a CDN (AWS S3, Cloudinary, etc.)
   - Update references in your code to point to the CDN URLs

### Current Status:
- ✅ Repository successfully uploaded to GitHub
- ✅ All other media files (images, icons, etc.) are included
- ✅ Project is fully functional without the excluded videos
- ✅ The .gitignore is configured to exclude video files by default

### Note:
The excluded video files are still in your local working directory backup. You can find them in your original project folder if needed. 