import { useSelector } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserStart,
  signOutUserSuccess,
  signOutUserFailure,
} from '../redux/user/userSlice';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import UserListings from '../components/UserListings';
import { toast } from 'react-hot-toast';
import { FiCheck } from 'react-icons/fi';
import ProfileUpdateSuccessPopup from '../components/ui/ProfileUpdateSuccessPopup';
import { useLanguage } from '../contexts/LanguageContext';
import { getPageTranslations } from '../locales/translations';
import { authenticatedFetch } from '../utils/authenticatedFetch';
import { getApiUrl } from '../utils/apiConfig';


export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showProfileUpdatePopup, setShowProfileUpdatePopup] = useState(false);
  const dispatch = useDispatch();

  // Language context
  const { currentLang, isArabic } = useLanguage();
  const t = getPageTranslations('profile', currentLang);

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  useEffect(() => {
    console.log('=== PROFILE PAGE MOUNTED ===');
    console.log('Current URL:', window.location.href);
    console.log('Current user in Redux:', !!currentUser);
    console.log('Current user ID:', currentUser?._id);
    
    // Check token in all storage locations
    const authToken = localStorage.getItem('auth_token');
    const userString = localStorage.getItem('user');
    const sessionToken = sessionStorage.getItem('auth_token');
    
    console.log('=== PROFILE PAGE TOKEN STATUS ===');
    console.log('localStorage auth_token:', !!authToken);
    console.log('localStorage auth_token length:', authToken ? authToken.length : 0);
    console.log('localStorage auth_token preview:', authToken ? authToken.substring(0, 20) + '...' : 'N/A');
    console.log('localStorage user object:', !!userString);
    console.log('sessionStorage auth_token:', !!sessionToken);
    console.log('sessionStorage auth_token length:', sessionToken ? sessionToken.length : 0);
    
    // Check Redux state
    if (typeof window !== 'undefined' && window.__REDUX_STORE__) {
      const state = window.__REDUX_STORE__.getState();
      console.log('Redux user.token:', !!state.user?.token);
      console.log('Redux user.token length:', state.user?.token ? state.user.token.length : 0);
      console.log('Redux user.token preview:', state.user?.token ? state.user.token.substring(0, 20) + '...' : 'N/A');
    }
    
    // List all storage keys
    console.log('All localStorage keys:', Object.keys(localStorage));
    console.log('All sessionStorage keys:', Object.keys(sessionStorage));
    
    // Test token format if available
    if (authToken) {
      try {
        const parts = authToken.split('.');
        console.log('Token format check - Parts count:', parts.length);
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          console.log('Token payload user ID:', payload.id);
          console.log('Token expires at:', new Date(payload.exp * 1000));
          console.log('Token is expired:', payload.exp < Math.floor(Date.now() / 1000));
        }
      } catch (e) {
        console.log('Token format check failed:', e);
      }
    }
    
    console.log('=== PROFILE PAGE TOKEN STATUS END ===');
  }, [currentUser]);

  const handleFileUpload = async (file) => {
    try {
      setFileUploadError(false);
      setFilePerc(0);

      // Validate file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        setFileUploadError(t.errorUploadingImage || 'Error uploading image');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setFileUploadError(t.errorUploadingImage || 'Error uploading image');
        return;
      }

      // Check if user is authenticated with Firebase
      const user = currentUser;
      let uploadResult = null;

      if (user && user.uid) {
        // Try Firebase Storage first
        try {
          uploadResult = await uploadToFirebase(file);
        } catch (firebaseError) {
          console.log('Firebase upload failed, trying server upload:', firebaseError);
          
          // If Firebase fails with 412 or auth errors, try server upload
          if (firebaseError.code === 'storage/unauthorized' || 
              firebaseError.code === 'storage/unauthenticated' ||
              firebaseError.message?.includes('412') ||
              firebaseError.message?.includes('Precondition Failed')) {
            uploadResult = await uploadToServer(file);
          } else {
            throw firebaseError;
          }
        }
      } else {
        // User not authenticated, use server upload
        uploadResult = await uploadToServer(file);
      }

      if (uploadResult) {
        setFormData({ ...formData, avatar: uploadResult });
        setFilePerc(100);
      }
    } catch (error) {
      console.error('Profile picture upload error:', error);
      setFileUploadError(t.errorUploadingImage || 'Error uploading image');
      setFilePerc(0);
    }
  };

  const uploadToFirebase = (file) => {
    return new Promise((resolve, reject) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, `profiles/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
        (error) => {
          console.error('Firebase upload error:', error);
          reject(error);
      },
      () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              resolve(downloadURL);
            })
            .catch(reject);
        }
      );
    });
  };

  const uploadToServer = async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);

    // Simulate progress updates for server upload
    const progressInterval = setInterval(() => {
      setFilePerc(prev => Math.min(prev + 10, 90));
    }, 100);

    try {
      const data = await authenticatedFetch('/api/listing/upload/profile', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      
      if (data.success) {
        // Convert relative URL to full URL for consistency
        const fullUrl = `${window.location.origin}${data.url}`;
        return fullUrl;
      } else {
        throw new Error(data.error || 'Server upload failed');
      }
    } catch (error) {
      clearInterval(progressInterval);
      throw error;
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const data = await authenticatedFetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
      setShowProfileUpdatePopup(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const data = await authenticatedFetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });
      dispatch(deleteUserSuccess(data));
    } catch (err) {
      dispatch(deleteUserFailure(err.message));
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      await authenticatedFetch('/api/auth/signout');
      dispatch(signOutUserSuccess());
      
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
              <h3 className={`text-[#db2b2e] font-bold ${isArabic ? 'font-amiri' : 'font-nt'}`}>
                {t.signedOutSuccessfully || 'Signed out successfully'}
              </h3>
              <p className={`text-[#db2b2e] text-sm ${isArabic ? 'font-noto' : 'font-nt'}`}>
                {t.seeYouNextTime || 'See you next time!'}
              </p>
            </div>
          </div>
        </div>
      ), {
        duration: 3000,
        position: 'top-center',
      });
      
    } catch (err) {
      dispatch(signOutUserFailure(err.message));
    }
  };

  // Helper function to get the correct avatar URL
  const getAvatarUrl = () => {
    // Priority: formData.avatar (new upload) > currentUser.avatar (existing) > default
    let avatarUrl = formData.avatar || currentUser?.avatar;
    
    if (!avatarUrl) {
      return '/default-avatar.png';
    }
    
    // If it's a local server path, make sure it's a full URL
    if (avatarUrl.startsWith('/uploads/')) {
      avatarUrl = `${window.location.origin}${avatarUrl}`;
    }
    
    return avatarUrl;
  };

  return (
    <div className={`min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-300 ${isArabic ? 'font-noto' : 'font-nt'}`} dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="max-w-8xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Profile Section */}
          <div className="md:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white dark:bg-black border border-gray-200 dark:border-[#db2b2e] transition-colors duration-300">
                {/* Profile Header */}
                <div className="relative aspect-square border-b border-[#db2b2e]">
                  <input
                    onChange={(e) => setFile(e.target.files[0])}
                    type="file"
                    ref={fileRef}
                    hidden
                    accept="image/*"
                  />
                  <img
                    src={getAvatarUrl()}
                    alt="profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                  {/* Upload Status Overlay */}
                  {(fileUploadError || filePerc > 0) && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
                      {fileUploadError ? (
                        <p className={`text-[#db2b2e] text-center px-4 ${isArabic ? 'font-noto' : 'font-nt'}`}>
                          {t.errorUploadingImage || 'Error uploading image'}<br />{t.imageSizeLimit || '(image must be less than 2 MB)'}
                        </p>
                      ) : filePerc > 0 && filePerc < 100 ? (
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-2 relative">
                            <div className="absolute inset-0 border-t-2 border-r-2 border-[#db2b2e] animate-spin"></div>
                          </div>
                          <p className={`text-[#db2b2e] ${isArabic ? 'font-noto' : 'font-nt'}`}>{`${t.uploading || 'Uploading'}: ${filePerc}%`}</p>
                        </div>
                      ) : filePerc === 100 ? (
                        <p className={`text-green-500 ${isArabic ? 'font-noto' : 'font-nt'}`}>{t.uploadComplete || 'Upload Complete'}</p>
                      ) : null}
                    </div>
                  )}
                  {/* Hover Overlay */}
                  <button
                    onClick={() => fileRef.current.click()}
                    className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer z-10"
                  >
                    <p className={`text-white text-sm uppercase tracking-wider ${isArabic ? 'font-noto' : 'font-nt'}`}>{t.changePhoto || 'Change Photo'}</p>
                  </button>
                </div>

                {/* Profile Form */}
                <form onSubmit={handleSubmit} className="p-6 border-b border-[#db2b2e]">
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-xs uppercase tracking-wider text-[#db2b2e] mb-1 ${isArabic ? 'font-noto' : 'font-nt'}`}>
                        {t.username || 'Username'}
                      </label>
                      <input
                        type="text"
                        placeholder={t.username || 'Username'}
                        defaultValue={currentUser.username}
                        id="username"
                        className={`w-full bg-white dark:bg-black border border-gray-300 dark:border-[#db2b2e] p-2 text-black dark:text-white placeholder-gray-500 dark:placeholder-white/40 focus:outline-none focus:border-[#db2b2e]/80 transition-colors duration-300 ${isArabic ? 'font-noto text-right' : 'font-nt'}`}
                        onChange={handleChange}
                        dir="auto"
                      />
                    </div>
                    <div>
                      <label className={`block text-xs uppercase tracking-wider text-[#db2b2e] mb-1 ${isArabic ? 'font-noto' : 'font-nt'}`}>
                        {t.email || 'Email'}
                      </label>
                      <input
                        type="email"
                        placeholder={t.email || 'Email'}
                        id="email"
                        defaultValue={currentUser.email}
                        className={`w-full bg-white dark:bg-black border border-gray-300 dark:border-[#db2b2e] p-2 text-black dark:text-white placeholder-gray-500 dark:placeholder-white/40 focus:outline-none focus:border-[#db2b2e]/80 transition-colors duration-300 ${isArabic ? 'font-noto text-right' : 'font-nt'}`}
                        onChange={handleChange}
                        dir="auto"
                      />
                    </div>
                    <button
                      disabled={loading}
                      className={`w-full bg-[#db2b2e] text-white p-2 hover:bg-[#db2b2e]/90 disabled:opacity-50 disabled:cursor-not-allowed ${isArabic ? 'font-amiri' : 'font-nt'}`}
                    >
                      {loading ? (t.updating || 'Updating...') : (t.updateProfile || 'Update Profile')}
                    </button>
                  </div>
                </form>

                {/* Actions */}
                <div className="p-6 space-y-4">
                  <Link
                    to="/create-listing"
                    className="block w-full bg-[#f3eb4b] text-red-600 font-semibold p-2 text-center hover:bg-[#f3eb4b]/90 transition-colors"
                  >
                    {t.createNewListing || 'Create New Listing'}
                  </Link>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={handleDeleteUser}
                      className="w-full border border-[#db2b2e] text-[#db2b2e] p-2 hover:bg-[#db2b2e] hover:text-white transition-colors text-sm uppercase tracking-wider"
                    >
                      {t.deleteAccount || 'Delete Account'}
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full border border-[#db2b2e] text-[#db2b2e] p-2 hover:bg-[#db2b2e] hover:text-white transition-colors text-sm uppercase tracking-wider"
                    >
                      {t.signOut || 'Sign Out'}
                    </button>
                  </div>
                </div>

                {/* Status Messages */}
                {error && (
                  <div className="p-4 border-t border-[#db2b2e] bg-[#db2b2e]/5">
                    <p className="text-[#db2b2e] text-sm text-center">{error}</p>
                  </div>
                )}
                {updateSuccess && (
                  <div className="p-4 border-t border-[#db2b2e] bg-[#db2b2e]/5">
                    <p className="text-[#db2b2e] text-sm text-center">{t.profileUpdatedSuccessfully || 'Profile updated successfully'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Listings Section */}
          <div className="md:col-span-3">
            <div className="border-b border-[#db2b2e] mb-8">
              <h2 className={`text-3xl text-black dark:text-white uppercase tracking-wider pb-4 ${isArabic ? 'font-amiri font-bold' : 'font-nt-bold'}`}>{t.yourListings || 'Your Listings'}</h2>
            </div>
            {currentUser?._id && <UserListings userId={currentUser._id} />}
          </div>
        </div>
      </div>

      {/* Profile Update Success Popup */}
      <ProfileUpdateSuccessPopup
        isOpen={showProfileUpdatePopup}
        onClose={() => setShowProfileUpdatePopup(false)}
      />
    </div>
  );
}
