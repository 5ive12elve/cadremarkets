import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserStart, updateUserSuccess, updateUserFailure, deleteUserStart, deleteUserSuccess, deleteUserFailure } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';
import AlertDialog from '../components/ui/AlertDialog';
import { authenticatedFetch } from '../utils/authenticatedFetch';

export default function EditProfile() {
  const { currentUser } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({ username: currentUser.username, email: currentUser.email });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  
  // Alert dialog state
  const [alertDialog, setAlertDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const showAlert = (title, message, type = 'info') => {
    setAlertDialog({
      isOpen: true,
      title,
      message,
      type
    });
  };

  const closeAlert = () => {
    setAlertDialog({
      isOpen: false,
      title: '',
      message: '',
      type: 'info'
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username cannot be empty';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters long';
    } else if (formData.username.trim().length > 30) {
      newErrors.username = 'Username cannot exceed 30 characters';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email cannot be empty';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    try {
      dispatch(updateUserStart());
      const data = await authenticatedFetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
      setErrors({});
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    try {
      await authenticatedFetch(`/api/users/${currentUser._id}/password`, {
        method: 'PUT',
        body: JSON.stringify(passwordData),
      });
      showAlert('Password Updated', 'Your password has been updated successfully!', 'success');
      setPasswordData({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
  
          const storedUser = JSON.parse(localStorage.getItem('user')); // Get user from storage
    const token = storedUser?.token || currentUser?.token;

    if (!token) throw new Error('Token is missing');
  
      const data = await authenticatedFetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });
  
      dispatch(deleteUserSuccess(data));
      localStorage.removeItem('user'); // Remove user data from local storage
      navigate('/'); // Redirect user after deletion
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
      console.error('Delete User Error:', error.message);
    }
  };

  return (
    <>
      <div className='max-w-lg mx-auto p-6 bg-white dark:bg-black text-black dark:text-white font-nt border border-primary rounded-lg mt-10 mb-20 transition-colors duration-300'>
        <h2 className='text-4xl font-bold text-left mb-8 font-nt text-black dark:text-white'>Edit Profile</h2>
        
        {updateSuccess && (
          <div className='p-3 mb-4 text-primary bg-white dark:bg-black border border-primary rounded-lg text-center'>
            Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-6'>
          <input 
            type='text' 
            name='username' 
            value={formData.username} 
            onChange={handleChange} 
            required 
            className={`w-full p-3 border ${
              errors.username ? 'border-red-500' : 'border-gray-300 dark:border-white'
            } bg-transparent text-black dark:text-white placeholder-gray-500 dark:placeholder-white rounded-lg transition-colors duration-300`}
            placeholder='Username' 
          />
          {errors.username && (
            <p className='text-red-500 text-sm mt-1'>{errors.username}</p>
          )}
          <input 
            type='email' 
            name='email' 
            value={formData.email} 
            onChange={handleChange} 
            required 
            className={`w-full p-3 border ${
              errors.email ? 'border-red-500' : 'border-gray-300 dark:border-white'
            } bg-transparent text-black dark:text-white placeholder-gray-500 dark:placeholder-white rounded-lg transition-colors duration-300`}
            placeholder='Email' 
          />
          {errors.email && (
            <p className='text-red-500 text-sm mt-1'>{errors.email}</p>
          )}
          {/* Error Summary */}
          {Object.keys(errors).length > 0 && (
            <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3'>
              <p className='text-red-600 dark:text-red-400 text-sm font-medium mb-2'>
                Please fix the following errors before saving:
              </p>
              <ul className='space-y-1'>
                {Object.values(errors).map((error, index) => (
                  <li key={index} className='text-red-600 dark:text-red-400 text-sm'>
                    • {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button 
            type='submit' 
            disabled={Object.keys(errors).length > 0}
            className='w-full bg-primary text-black font-bold p-3 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Save Changes
          </button>
        </form>

        <h3 className='text-2xl font-bold text-left mt-10 font-nt text-black dark:text-white'>Change Password</h3>
        
        <form onSubmit={handlePasswordUpdate} className='space-y-6 mt-6'>
          <input 
            type='password' 
            name='currentPassword' 
            placeholder='Current Password' 
            value={passwordData.currentPassword} 
            onChange={handlePasswordChange} 
            required 
            className='w-full p-3 border border-gray-300 dark:border-white bg-transparent text-black dark:text-white placeholder-gray-500 dark:placeholder-white rounded-lg transition-colors duration-300' 
          />
          <input 
            type='password' 
            name='newPassword' 
            placeholder='New Password' 
            value={passwordData.newPassword} 
            onChange={handlePasswordChange} 
            required 
            className='w-full p-3 border border-gray-300 dark:border-white bg-transparent text-black dark:text-white placeholder-gray-500 dark:placeholder-white rounded-lg transition-colors duration-300' 
          />
          <button type='submit' className='w-full border border-primary text-black dark:text-white hover:bg-primary hover:text-black font-bold p-3 rounded-lg transition-colors duration-300'>
            Update Password
          </button>
        </form>

        {error && <p className='text-red-600 text-center mt-4'>{error}</p>}

        {/* Delete Account Section */}
        <div className='text-center mt-6'>
          <span
            onClick={handleDeleteUser}
            className='text-primary hover:text-red-600 cursor-pointer'
          >
            Delete Account
          </span>
        </div>
      </div>

      {/* Alert Dialog */}
      <AlertDialog
        isOpen={alertDialog.isOpen}
        onClose={closeAlert}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
      />
    </>
  );
}