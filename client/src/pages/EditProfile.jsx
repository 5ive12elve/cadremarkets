import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserStart, updateUserSuccess, updateUserFailure, deleteUserStart, deleteUserSuccess, deleteUserFailure } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';
import AlertDialog from '../components/ui/AlertDialog';

export default function EditProfile() {
  const { currentUser } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({ username: currentUser.username, email: currentUser.email });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [error, setError] = useState(null);
  
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!data.success) {
        dispatch(updateUserFailure(data.message));
        return;
      }

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/users/${currentUser._id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error updating password');
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
  
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Ensure token is sent
        },
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete account');
  
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
            className='w-full p-3 border border-gray-300 dark:border-white bg-transparent text-black dark:text-white placeholder-gray-500 dark:placeholder-white rounded-lg transition-colors duration-300' 
            placeholder='Username' 
          />
          <input 
            type='email' 
            name='email' 
            value={formData.email} 
            onChange={handleChange} 
            required 
            className='w-full p-3 border border-gray-300 dark:border-white bg-transparent text-black dark:text-white placeholder-gray-500 dark:placeholder-white rounded-lg transition-colors duration-300' 
            placeholder='Email' 
          />
          <button type='submit' className='w-full bg-primary text-black font-bold p-3 rounded-lg hover:opacity-90'>
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