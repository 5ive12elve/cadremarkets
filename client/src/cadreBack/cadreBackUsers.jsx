import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiUser, FiX } from 'react-icons/fi';
import { backofficeApiRequest, isBackofficeAuthenticated } from '../backUtils/cadreBackAuth';
import Button from '../components/shared/Button';
import PageHeader from '../components/shared/PageHeader';
import GE02Loader from '../components/GE02Loader';
import toast from 'react-hot-toast';
import useConfirmDialog from '../hooks/useConfirmDialog';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const CadreBackUsers = () => {
    // Check authentication on component mount
    useEffect(() => {
        if (!isBackofficeAuthenticated()) {
            window.location.href = '/cadreBack/login';
        }
    }, []);

    const { confirm, dialogProps } = useConfirmDialog();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'support',
        permissions: []
    });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await backofficeApiRequest('/backoffice/users');
            if (!response.ok) throw new Error('Failed to fetch users');
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await backofficeApiRequest('/backoffice/users', {
                method: 'POST',
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to create user');
            
            await fetchUsers();
            setShowAddModal(false);
            setFormData({
                username: '',
                email: '',
                password: '',
                role: 'support',
                permissions: []
            });
            toast.success('User created successfully');
        } catch (error) {
            console.error('Error creating user:', error);
            toast.error('Failed to create user');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await backofficeApiRequest(`/backoffice/users/${selectedUser._id}`, {
                method: 'PUT',
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to update user');
            
            await fetchUsers();
            setShowEditModal(false);
            setSelectedUser(null);
            toast.success('User updated successfully');
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error('Failed to update user');
        }
    };

    const handleDelete = async (userId) => {
        const confirmed = await confirm(
            'Are you sure you want to delete this user?',
            'Delete User',
            'danger'
        );
        
        if (!confirmed) return;
        
        try {
            const response = await backofficeApiRequest(`/backoffice/users/${userId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete user');
            
            await fetchUsers();
            toast.success('User deleted successfully');
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Failed to delete user');
        }
    };

              return (
            <div className="w-full md:pt-0 pt-16 overflow-x-hidden">
            <PageHeader
                title="Users"
                description="Manage back office user accounts"
                actions={
                    <Button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 bg-[#db2b2e] text-white px-3 sm:px-4 lg:px-6 py-2 hover:bg-[#c41e21] transition-colors duration-200 text-xs sm:text-sm"
                    >
                        <FiPlus className="w-4 h-4" /> 
                                                    <span>Add User</span>
                        <span className="sm:hidden">Add</span>
                    </Button>
                }
            />

                {/* Users Table */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <GE02Loader size="large" message="Loading users..." />
                    </div>
                ) : (
                    <div className="bg-black border border-[#db2b2e] overflow-hidden max-w-full overflow-x-hidden">
                        {/* Desktop Table */}
                        <div className="hidden md:block">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[#db2b2e]">
                                        <th className="text-left p-4 text-white/60 font-medium">User</th>
                                        <th className="text-left p-4 text-white/60 font-medium">Role</th>
                                        <th className="text-left p-4 text-white/60 font-medium">Permissions</th>
                                        <th className="text-right p-4 text-white/60 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user._id} className="border-b border-[#db2b2e]/20 hover:bg-[#db2b2e]/5">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-[#db2b2e]/10 flex items-center justify-center">
                                                        <FiUser className="w-5 h-5 text-[#db2b2e]" />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium">{user.username}</p>
                                                        <p className="text-white/60 text-sm">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="bg-[#db2b2e]/10 text-[#db2b2e] px-3 py-1 text-sm">
                                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {user.permissions.map((permission) => (
                                                        <span
                                                            key={permission}
                                                            className="bg-[#db2b2e]/10 text-white/60 px-2 py-1 text-xs"
                                                        >
                                                            {permission.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setFormData({
                                                                username: user.username,
                                                                email: user.email,
                                                                password: '',
                                                                role: user.role,
                                                                permissions: user.permissions
                                                            });
                                                            setShowEditModal(true);
                                                        }}
                                                        className="p-2 text-white/60 hover:text-white transition-colors"
                                                    >
                                                        <FiEdit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user._id)}
                                                        className="p-2 text-red-400 hover:text-red-300 transition-colors"
                                                    >
                                                        <FiTrash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden space-y-3 p-4">
                            {users.map((user) => (
                                <div key={user._id} className="border border-[#db2b2e]/20 p-4 rounded">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[#db2b2e]/10 flex items-center justify-center">
                                                <FiUser className="w-5 h-5 text-[#db2b2e]" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white font-medium text-sm truncate">{user.username}</p>
                                                <p className="text-white/60 text-xs truncate">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setFormData({
                                                        username: user.username,
                                                        email: user.email,
                                                        password: '',
                                                        role: user.role,
                                                        permissions: user.permissions
                                                    });
                                                    setShowEditModal(true);
                                                }}
                                                className="p-2 text-white/60 hover:text-white transition-colors"
                                            >
                                                <FiEdit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user._id)}
                                                className="p-2 text-red-400 hover:text-red-300 transition-colors"
                                            >
                                                <FiTrash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <span className="bg-[#db2b2e]/10 text-[#db2b2e] px-3 py-1 text-xs">
                                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {user.permissions.map((permission) => (
                                            <span
                                                key={permission}
                                                className="bg-[#db2b2e]/10 text-white/60 px-2 py-1 text-xs"
                                            >
                                                {permission.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-30 p-2 sm:p-4">
                    <div className="bg-black border border-[#db2b2e]/20 w-full max-w-md max-h-[95vh] overflow-y-auto p-3 sm:p-6 relative">
                        <button
                            onClick={() => setShowAddModal(false)}
                            className="absolute top-2 sm:top-4 right-2 sm:right-4 text-gray-400 hover:text-white p-2 z-10"
                        >
                            <FiX size={20} />
                        </button>

                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 text-[#db2b2e] pr-8">Add New User</h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 lg:space-y-6">
                            <div>
                                <label className="block text-white/60 text-xs sm:text-sm mb-2">Username</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                                    className="w-full bg-black border border-[#db2b2e] text-white px-3 py-2 focus:outline-none text-xs sm:text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-white/60 text-xs sm:text-sm mb-2">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full bg-black border border-[#db2b2e] text-white px-3 py-2 focus:outline-none text-xs sm:text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-white/60 text-xs sm:text-sm mb-2">Password</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    className="w-full bg-black border border-[#db2b2e] text-white px-3 py-2 focus:outline-none text-xs sm:text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-white/60 text-xs sm:text-sm mb-2">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                    className="w-full bg-black border border-[#db2b2e] text-white px-3 py-2 focus:outline-none text-xs sm:text-sm"
                                >
                                    <option value="support">Support</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-[#db2b2e] text-white py-2 hover:bg-[#c41e21] transition-colors text-xs sm:text-sm"
                                >
                                    Add User
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 border border-[#db2b2e] text-[#db2b2e] py-2 hover:bg-[#db2b2e] hover:text-white transition-colors text-xs sm:text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && selectedUser && (
                <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-30 p-2 sm:p-4">
                    <div className="bg-black border border-[#db2b2e]/20 w-full max-w-md max-h-[95vh] overflow-y-auto p-3 sm:p-6 relative">
                        <button
                            onClick={() => setShowEditModal(false)}
                            className="absolute top-2 sm:top-4 right-2 sm:right-4 text-gray-400 hover:text-white p-2 z-10"
                        >
                            <FiX size={20} />
                        </button>

                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 text-[#db2b2e] pr-8">Edit User</h2>
                        
                        <form onSubmit={handleUpdate} className="space-y-3 sm:space-y-4 lg:space-y-6">
                            <div>
                                <label className="block text-white/60 text-xs sm:text-sm mb-2">Username</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                                    className="w-full bg-black border border-[#db2b2e] text-white px-3 py-2 focus:outline-none text-xs sm:text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-white/60 text-xs sm:text-sm mb-2">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full bg-black border border-[#db2b2e] text-white px-3 py-2 focus:outline-none text-xs sm:text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-white/60 text-xs sm:text-sm mb-2">Password (leave blank to keep current)</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    className="w-full bg-black border border-[#db2b2e] text-white px-3 py-2 focus:outline-none text-xs sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-white/60 text-xs sm:text-sm mb-2">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                    className="w-full bg-black border border-[#db2b2e] text-white px-3 py-2 focus:outline-none text-xs sm:text-sm"
                                >
                                    <option value="support">Support</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-[#db2b2e] text-white py-2 hover:bg-[#c41e21] transition-colors text-xs sm:text-sm"
                                >
                                    Update User
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 border border-[#db2b2e] text-[#db2b2e] py-2 hover:bg-[#db2b2e] hover:text-white transition-colors text-xs sm:text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

      <ConfirmDialog {...dialogProps} />
        </div>
    );
};

export default CadreBackUsers; 