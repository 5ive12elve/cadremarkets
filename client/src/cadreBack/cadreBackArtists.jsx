import { useState, useEffect } from 'react';
import { backofficeApiRequest, isBackofficeAuthenticated } from '../backUtils/cadreBackAuth';
import { FiUser, FiImage, FiX, FiSearch } from 'react-icons/fi';
import PageHeader from '../components/shared/PageHeader';
import Card from '../components/shared/Card';
import Table from '../components/shared/Table';
import toast from 'react-hot-toast';

const ROLE_TYPES = {
    ALL: 'all',
    ARTIST: 'artist',
    ADMIN: 'admin',
    USER: 'user'
};

const CadreBackArtists = () => {
    // Check authentication on component mount
    useEffect(() => {
        if (!isBackofficeAuthenticated()) {
            window.location.href = '/cadreBack/login';
        }
    }, []);

    const [artists, setArtists] = useState([]);
    const [filteredArtists, setFilteredArtists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedArtist, setSelectedArtist] = useState(null);
    const [selectedRole, setSelectedRole] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await backofficeApiRequest('/user');
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const users = await response.json();
            setArtists(users);
            setFilteredArtists(users);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to fetch artists');
            setError(error.message || 'Failed to fetch artists');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value) => {
        setSearchQuery(value);
        filterArtists(value, selectedRole);
    };

    const handleRoleFilter = (role) => {
        setSelectedRole(role);
        filterArtists(searchQuery, role);
    };

    const filterArtists = (search, role) => {
        let filtered = [...artists];

        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(artist =>
                artist.username?.toLowerCase().includes(searchLower) ||
                artist.email?.toLowerCase().includes(searchLower)
            );
        }

        if (role && role !== 'all') {
            filtered = filtered.filter(artist => artist.role === role);
        }

        setFilteredArtists(filtered);
    };

    const handleDeleteUser = async (userId) => {
        try {
            const response = await backofficeApiRequest(`/user/delete/${userId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to delete user.");
            }

            setArtists(prevArtists => prevArtists.filter(artist => artist._id !== userId));
            setFilteredArtists(prevArtists => prevArtists.filter(artist => artist._id !== userId));
            setSelectedArtist(null);
            toast.success('Artist deleted successfully');
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error(error.message);
        }
    };

    const columns = [
        {
            header: 'Artist',
            key: 'username',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                        {row.avatar ? (
                            <img src={row.avatar} alt={row.username} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <FiUser className="w-5 h-5 text-gray-400" />
                        )}
                    </div>
                    <div>
                        <p className="font-medium">{row.username || 'N/A'}</p>
                        <p className="text-sm text-gray-400">{row.email}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Role',
            key: 'role',
            render: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    row.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                    row.role === 'artist' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                }`}>
                    {row.role?.charAt(0).toUpperCase() + row.role?.slice(1) || 'User'}
                </span>
            )
        },
        {
            header: 'Listings',
            key: 'listingCount',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <FiImage className="text-gray-400" />
                    <span>{row.listingCount || 0}</span>
                </div>
            )
        },
        {
            header: 'Joined',
            key: 'createdAt',
            render: (row) => (
                <span className="text-sm text-gray-400">
                    {new Date(row.createdAt).toLocaleDateString()}
                </span>
            )
        }
    ];

    return (
        <div className="w-full">
            <PageHeader
                title="Artists Management"
                description="Manage and monitor artist accounts"
            />

            <Card className="mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Search artists..."
                            className="w-full bg-black border border-[#db2b2e] px-4 py-2 text-white focus:outline-none text-sm"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                        <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-[#db2b2e]" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm ${
                                selectedRole === ''
                                    ? 'bg-[#db2b2e] text-white'
                                    : 'border border-[#db2b2e] text-[#db2b2e] hover:bg-[#db2b2e] hover:text-white'
                            } transition-colors`}
                            onClick={() => handleRoleFilter('')}
                        >
                            All
                        </button>
                        {Object.entries(ROLE_TYPES).map(([key, value]) => (
                            value !== 'all' && (
                                <button
                                    key={value}
                                    className={`px-3 sm:px-4 py-2 text-xs sm:text-sm ${
                                        selectedRole === value
                                            ? 'bg-[#db2b2e] text-white'
                                            : 'border border-[#db2b2e] text-[#db2b2e] hover:bg-[#db2b2e] hover:text-white'
                                    } transition-colors`}
                                    onClick={() => handleRoleFilter(value)}
                                >
                                    {key.charAt(0) + key.slice(1).toLowerCase()}
                                </button>
                            )
                        ))}
                    </div>
                </div>
            </Card>

            <Card>
                <Table
                    columns={columns}
                    data={filteredArtists}
                    onRowClick={(row) => setSelectedArtist(row)}
                    loading={loading}
                />
                {error && (
                    <div className="text-red-500 mt-4 text-center text-sm">
                        {error}
                    </div>
                )}
            </Card>

            {/* Artist Details Modal */}
            {selectedArtist && (
                <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-50 p-4">
                    <div className="bg-black border border-[#db2b2e]/20 w-full max-w-2xl p-4 sm:p-6 relative">
                        <button
                            onClick={() => setSelectedArtist(null)}
                            className="absolute top-2 sm:top-4 right-2 sm:right-4 text-gray-400 hover:text-white p-2"
                        >
                            <FiX size={20} />
                        </button>

                        <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-4 sm:mb-6">
                            <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                                {selectedArtist.avatar ? (
                                    <img
                                        src={selectedArtist.avatar}
                                        alt={selectedArtist.username}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <FiUser className="w-8 h-8 text-gray-400" />
                                )}
                            </div>
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-[#db2b2e]">{selectedArtist.username}</h2>
                                <p className="text-gray-400 text-sm sm:text-base">{selectedArtist.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                            <div>
                                <p className="text-gray-400 mb-1 text-xs sm:text-sm">Role</p>
                                <p className="font-medium text-sm sm:text-base">{selectedArtist.role || 'User'}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 mb-1 text-xs sm:text-sm">Listings</p>
                                <p className="font-medium text-sm sm:text-base">{selectedArtist.listingCount || 0}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 mb-1 text-xs sm:text-sm">Joined</p>
                                <p className="font-medium text-sm sm:text-base">
                                    {new Date(selectedArtist.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-400 mb-1 text-xs sm:text-sm">Last Active</p>
                                <p className="font-medium text-sm sm:text-base">
                                    {new Date(selectedArtist.updatedAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end pt-4 border-t border-[#db2b2e]/20">
                            <button
                                onClick={() => setSelectedArtist(null)}
                                className="px-3 sm:px-4 py-2 border border-[#db2b2e] text-[#db2b2e] hover:bg-[#db2b2e] hover:text-white transition-colors rounded text-xs sm:text-sm"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => handleDeleteUser(selectedArtist._id)}
                                className="px-3 sm:px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors rounded text-xs sm:text-sm"
                            >
                                Delete Artist
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CadreBackArtists;