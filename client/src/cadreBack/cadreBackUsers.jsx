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
        <div className="w-full">
            <PageHeader
                title="Users"
                description="Manage back office user accounts"
                actions={
                    <Button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 bg-[#db2b2e] text-white px-6 py-2 hover:bg-[#c41e21] transition-colors duration-200"
                    >
                        <FiPlus className="w-4 h-4" /> Add User
                    </Button>
                }
            />

                {/* Users Table */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <GE02Loader size="large" message="Loading users..." />
                    </div>
                ) : (
                    <div className="bg-black border border-[#db2b2e] overflow-hidden">
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
                                                    className="p-2 text-white/60 hover:text-[#db2b2e] transition-colors"
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
                )}

                {/* Add User Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
                        <div className="bg-black border border-[#db2b2e] p-8 w-full max-w-md relative">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="absolute top-4 right-4 text-white/60 hover:text-white"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                            <h3 className="text-2xl font-bold text-white mb-6">Add User</h3>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-white/60 text-sm font-medium mb-2">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-black border border-[#db2b2e]/20 text-white px-4 py-2 focus:border-[#db2b2e] focus:outline-none transition-colors"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-white/60 text-sm font-medium mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        className="w-full bg-black border border-[#db2b2e]/20 text-white px-4 py-2 focus:border-[#db2b2e] focus:outline-none transition-colors"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-white/60 text-sm font-medium mb-2">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full bg-black border border-[#db2b2e]/20 text-white px-4 py-2 focus:border-[#db2b2e] focus:outline-none transition-colors"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-white/60 text-sm font-medium mb-2">
                                        Role
                                    </label>
                                    <select
                                        className="w-full bg-black border border-[#db2b2e]/20 text-white px-4 py-2 focus:border-[#db2b2e] focus:outline-none transition-colors"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="moderator">Moderator</option>
                                        <option value="support">Support</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-white/60 text-sm font-medium mb-2">
                                        Permissions
                                    </label>
                                    <div className="space-y-2">
                                        {['manage_users', 'manage_listings', 'manage_orders', 'manage_services', 'manage_support'].map((permission) => (
                                            <label key={permission} className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    className="border-[#db2b2e]/20 text-[#db2b2e] focus:ring-[#db2b2e] focus:ring-offset-black"
                                                    checked={formData.permissions.includes(permission)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setFormData({
                                                                ...formData,
                                                                permissions: [...formData.permissions, permission]
                                                            });
                                                        } else {
                                                            setFormData({
                                                                ...formData,
                                                                permissions: formData.permissions.filter(p => p !== permission)
                                                            });
                                                        }
                                                    }}
                                                />
                                                <span className="text-white/60">
                                                    {permission.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-end gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="px-6 py-2 border border-[#db2b2e] text-[#db2b2e] hover:bg-[#db2b2e] hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-[#db2b2e] text-white hover:bg-[#c41e21] transition-colors"
                                    >
                                        Add User
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit User Modal */}
                {showEditModal && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
                        <div className="bg-black border border-[#db2b2e] p-8 w-full max-w-md relative">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="absolute top-4 right-4 text-white/60 hover:text-white"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                            <h3 className="text-2xl font-bold text-white mb-6">Edit User</h3>
                            <form onSubmit={handleUpdate} className="space-y-6">
                                <div>
                                    <label className="block text-white/60 text-sm font-medium mb-2">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-black border border-[#db2b2e]/20 text-white px-4 py-2 focus:border-[#db2b2e] focus:outline-none transition-colors"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-white/60 text-sm font-medium mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        className="w-full bg-black border border-[#db2b2e]/20 text-white px-4 py-2 focus:border-[#db2b2e] focus:outline-none transition-colors"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-white/60 text-sm font-medium mb-2">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full bg-black border border-[#db2b2e]/20 text-white px-4 py-2 focus:border-[#db2b2e] focus:outline-none transition-colors"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="Leave blank to keep current password"
                                    />
                                </div>
                                <div>
                                    <label className="block text-white/60 text-sm font-medium mb-2">
                                        Role
                                    </label>
                                    <select
                                        className="w-full bg-black border border-[#db2b2e]/20 text-white px-4 py-2 focus:border-[#db2b2e] focus:outline-none transition-colors"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="moderator">Moderator</option>
                                        <option value="support">Support</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-white/60 text-sm font-medium mb-2">
                                        Permissions
                                    </label>
                                    <div className="space-y-2">
                                        {['manage_users', 'manage_listings', 'manage_orders', 'manage_services', 'manage_support'].map((permission) => (
                                            <label key={permission} className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    className="border-[#db2b2e]/20 text-[#db2b2e] focus:ring-[#db2b2e] focus:ring-offset-black"
                                                    checked={formData.permissions.includes(permission)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setFormData({
                                                                ...formData,
                                                                permissions: [...formData.permissions, permission]
                                                            });
                                                        } else {
                                                            setFormData({
                                                                ...formData,
                                                                permissions: formData.permissions.filter(p => p !== permission)
                                                            });
                                                        }
                                                    }}
                                                />
                                                <span className="text-white/60">
                                                    {permission.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-end gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="px-6 py-2 border border-[#db2b2e] text-[#db2b2e] hover:bg-[#db2b2e] hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-[#db2b2e] text-white hover:bg-[#c41e21] transition-colors"
                                    >
                                        Update User
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