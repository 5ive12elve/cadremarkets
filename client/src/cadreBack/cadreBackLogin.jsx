import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FiUser, FiLock, FiLogIn } from 'react-icons/fi';

export default function CadreBackLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const response = await fetch('/api/backoffice/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to login');
      }

      // If we have user data, login was successful
      if (data._id && data.role) {
        localStorage.setItem('cadreAccessGranted', 'true');
        localStorage.setItem('cadreUserRole', data.role);
        toast.success('Login successful');
        navigate('/cadreBack/dashboard');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login failed:', error);
      toast.error(error.message || 'Failed to login');
      localStorage.removeItem('cadreAccessGranted');
      localStorage.removeItem('cadreUserRole');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center">
          <img
            src="/mediassets/CadreBigUse2.png"
            alt="Cadre Logo"
            className="mx-auto h-24 w-auto mb-8"
          />
          <h2 className="text-4xl font-bold text-white mb-2">
            Back Office
          </h2>
          <p className="text-white/60 mb-8">
            Enter your credentials to access the dashboard
          </p>
        </div>
        
        <div className="bg-black border border-[#db2b2e] p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-white/60 text-sm font-medium mb-2">
                Username
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="w-full bg-black border border-[#db2b2e]/20 text-white px-10 py-2 focus:border-[#db2b2e] focus:outline-none transition-colors"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-white/60 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full bg-black border border-[#db2b2e]/20 text-white px-10 py-2 focus:border-[#db2b2e] focus:outline-none transition-colors"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#db2b2e] text-white py-2 hover:bg-[#c41e21] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-t-2 border-r-2 border-white animate-spin" />
              ) : (
                <>
                  <FiLogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}