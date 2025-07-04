import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
    },
  },
};

const ProjectUploadForm = ({ onUploadSuccess }) => {
  const [formData, setFormData] = useState({
    collab: '',
    title: '',
    projectDescription: '',
    description: '',
    images: [],
    video: null,
    thumbnailIndex: 0
  });
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [videoPreview, setVideoPreview] = useState(null);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setFormData(prev => ({ ...prev, images: files }));
    
    // Create preview URLs
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid video format. Supported formats: MP4, WebM, MOV');
      return;
    }

    // Check file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      toast.error('Video size must be less than 100MB');
      return;
    }

    setFormData(prev => ({ ...prev, video: file }));
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.images.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    setIsUploading(true);
    try {
      const formDataToSend = new FormData();
      formData.images.forEach((image) => {
        formDataToSend.append('images', image);
      });
      if (formData.video) {
        formDataToSend.append('video', formData.video);
      }
      formDataToSend.append('collab', formData.collab);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('projectDescription', formData.projectDescription);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('thumbnailIndex', formData.thumbnailIndex);

      const response = await fetch('/api/projects', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Failed to upload project');
      }

      const data = await response.json();
      toast.success('Project uploaded successfully');
      onUploadSuccess(data);
      
      // Reset form
      setFormData({
        collab: '',
        title: '',
        projectDescription: '',
        description: '',
        images: [],
        video: null,
        thumbnailIndex: 0
      });
      setPreviewUrls([]);
      setVideoPreview(null);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      previewUrls.forEach(URL.revokeObjectURL);
      if (videoPreview) URL.revokeObjectURL(videoPreview);
    };
  }, [previewUrls, videoPreview]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-black/50 p-6 rounded-lg border border-primary/20">
      <div>
        <label className="block text-white mb-2">Collab (e.g., CADRE X CINEMA)</label>
        <input
          type="text"
          value={formData.collab}
          onChange={(e) => setFormData(prev => ({ ...prev, collab: e.target.value }))}
          className="w-full bg-black/50 border border-primary/20 p-3 rounded text-white"
          required
        />
      </div>

      <div>
        <label className="block text-white mb-2">Title (e.g., Depletion)</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full bg-black/50 border border-primary/20 p-3 rounded text-white"
          required
        />
      </div>

      <div>
        <label className="block text-white mb-2">Project Description (e.g., Product Photoshoot)</label>
        <input
          type="text"
          value={formData.projectDescription}
          onChange={(e) => setFormData(prev => ({ ...prev, projectDescription: e.target.value }))}
          className="w-full bg-black/50 border border-primary/20 p-3 rounded text-white"
          required
        />
      </div>

      <div>
        <label className="block text-white mb-2">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full bg-black/50 border border-primary/20 p-3 rounded text-white h-32"
          required
        />
      </div>

      <div>
        <label className="block text-white mb-2">Images (max 5)</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="w-full bg-black/50 border border-primary/20 p-3 rounded text-white"
          required
        />
      </div>

      {previewUrls.length > 0 && (
        <div>
          <label className="block text-white mb-2">Select Thumbnail</label>
          <div className="grid grid-cols-5 gap-4">
            {previewUrls.map((url, index) => (
              <div
                key={url}
                className={`relative cursor-pointer border-2 ${
                  formData.thumbnailIndex === index ? 'border-[#f3eb4b]' : 'border-transparent'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, thumbnailIndex: index }))}
              >
                <img src={url} alt={`Preview ${index + 1}`} className="w-full h-24 object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-white mb-2">Video (optional, max 100MB)</label>
        <input
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          onChange={handleVideoChange}
          className="w-full bg-black/50 border border-primary/20 p-3 rounded text-white"
        />
      </div>

      {videoPreview && (
        <div>
          <label className="block text-white mb-2">Video Preview</label>
          <video
            src={videoPreview}
            controls
            className="w-full max-h-64 object-contain bg-black"
          />
          <button
            type="button"
            onClick={() => {
              URL.revokeObjectURL(videoPreview);
              setVideoPreview(null);
              setFormData(prev => ({ ...prev, video: null }));
            }}
            className="mt-2 text-red-500 hover:text-red-600"
          >
            Remove Video
          </button>
        </div>
      )}

      <button
        type="submit"
        disabled={isUploading}
        className={`w-full bg-primary text-[#f3eb4b] font-bold py-3 rounded ${
          isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90'
        }`}
      >
        {isUploading ? 'Uploading...' : 'Upload Project'}
      </button>
    </form>
  );
};

ProjectUploadForm.propTypes = {
  onUploadSuccess: PropTypes.func.isRequired,
};

const ProjectCard = ({ project }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  return (
    <motion.div
      className="relative overflow-hidden bg-black"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowVideo(false);
      }}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      {/* Project Cover Image or Video */}
      <div className="relative aspect-video overflow-hidden">
        {showVideo && project.video?.url ? (
          <video
            src={project.video.url}
            controls
            autoPlay
            className="w-full h-full object-contain bg-black"
          />
        ) : (
          <img
            src={project.images.find(img => img.isThumbnail)?.url || project.images[0]?.url}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-700"
            style={{
              transform: isHovered ? 'scale(1.05)' : 'scale(1)'
            }}
          />
        )}
        
        {/* Hover Overlay */}
        <div
          className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0
          }}
        >
          <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-6">
            <h3 className="text-2xl font-bold mb-2">{project.title}</h3>
            <p className="text-sm text-gray-200 mb-4">{project.description}</p>
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary text-[#f3eb4b] px-6 py-2 font-bold"
                onClick={() => setShowVideo(false)}
              >
                View Project
              </motion.button>
              {project.video?.url && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#f3eb4b] text-primary px-6 py-2 font-bold"
                  onClick={() => setShowVideo(!showVideo)}
                >
                  {showVideo ? 'Hide Video' : 'Play Video'}
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Project Info */}
      <div className="p-4">
        <div className="flex justify-between items-center text-white">
          <span className="text-sm">{project.projectDescription}</span>
          <span className="text-sm">{project.collab}</span>
        </div>
      </div>
    </motion.div>
  );
};

ProjectCard.propTypes = {
  project: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    projectDescription: PropTypes.string.isRequired,
    collab: PropTypes.string.isRequired,
    images: PropTypes.arrayOf(PropTypes.shape({
      url: PropTypes.string.isRequired,
      isThumbnail: PropTypes.bool
    })).isRequired,
    video: PropTypes.shape({
      url: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired
    })
  }).isRequired
};

export default function CadreBackProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (newProject) => {
    setProjects(prev => [newProject, ...prev]);
  };

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
      className="bg-black text-white font-nt py-20"
    >
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="border-t border-primary pt-16 relative">
          {/* Section Header */}
          <div className="flex justify-between items-start mb-12">
            <h2 className="text-[72px] font-bold leading-none">
              cadre<span className="text-[#f3eb4b]">back</span>
            </h2>
            <p className="text-lg text-gray-300 max-w-xl">
              Upload and manage your projects. Showcase your work to the world.
            </p>
          </div>

          {/* Upload Form */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold mb-6">Upload New Project</h3>
            <ProjectUploadForm onUploadSuccess={handleUploadSuccess} />
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {loading ? (
              <div className="col-span-2 flex justify-center items-center h-64">
                <div className="w-12 h-12 border-t-2 border-r-2 border-primary animate-spin rounded-full" />
              </div>
            ) : (
              projects.map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
} 