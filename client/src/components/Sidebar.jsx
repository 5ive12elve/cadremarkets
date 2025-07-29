import { FiHome, FiUsers, FiLogOut, FiBox, FiSettings, FiShoppingBag, FiHeadphones, FiUser } from 'react-icons/fi';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { signOutUserStart, signOutUserSuccess, signOutUserFailure } from '../redux/user/userSlice';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useState } from 'react';
import CadreBackHeader from './CadreBackHeader';

const Sidebar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleSignOut = async () => {
        try {
            dispatch(signOutUserStart());
            await signOut(auth);
            dispatch(signOutUserSuccess());
            navigate('/cadreBack'); 
        } catch (error) {
            dispatch(signOutUserFailure(error.message));
            console.error('Error signing out:', error);
        }
    };

    const menuItems = [
        { to: "/cadreBack/dashboard", icon: FiHome, label: "Dashboard" },
        { to: "/cadreBack/orders", icon: FiShoppingBag, label: "Orders" },
        { to: "/cadreBack/listings", icon: FiBox, label: "Listings" },
        { to: "/cadreBack/artists", icon: FiUser, label: "Artists" },
        { to: "/cadreBack/users", icon: FiUsers, label: "Users" },
        { to: "/cadreBack/services", icon: FiSettings, label: "Services" },
        { to: "/cadreBack/customer-service", icon: FiHeadphones, label: "Customer Service" }
    ];

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <>
            {/* CadreBack Header - Mobile Only */}
            <CadreBackHeader onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={closeMobileMenu}
                />
            )}

            {/* Desktop Sidebar */}
            <div className="hidden md:flex h-full w-full bg-black border-r border-[#db2b2e]/20">
                <div className="p-4 w-full">
                    <div className="flex justify-center mb-8">
                        <NavLink to="/" className="block">
                            <img src="/mediassets/CadreBigUse2.png" alt="Logo" className="w-48" />
                        </NavLink>
                    </div>

                    <nav className="p-4">
                        <ul>
                            {menuItems.map(({ to, icon: Icon, label }) => (
                                <li key={to} className="mb-4">
                                    <NavLink
                                        to={to}
                                        className={({ isActive }) =>
                                            `flex items-center gap-2 text-lg font-semibold ${
                                                isActive ? 'text-primary font-bold' : 'text-white hover:text-primary'
                                            }`
                                        }
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span>{label}</span>
                                    </NavLink>
                                </li>
                            ))}
                            <li>
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center gap-2 text-lg font-semibold text-white hover:text-primary"
                                >
                                    <FiLogOut className="w-5 h-5" />
                                    <span>Sign Out</span>
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

            {/* Mobile Sidebar */}
            <div className={`md:hidden fixed left-0 top-0 h-full w-64 bg-black border-r border-[#db2b2e]/20 transform transition-transform duration-300 z-50 ${
                isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <div className="p-4">
                    <div className="flex justify-center mb-8 mt-20">
                        <NavLink to="/" className="block" onClick={closeMobileMenu}>
                            <img src="/mediassets/CadreBigUse2.png" alt="Logo" className="w-40" />
                        </NavLink>
                    </div>

                    <nav className="p-4">
                        <ul>
                            {menuItems.map(({ to, icon: Icon, label }) => (
                                <li key={to} className="mb-4">
                                    <NavLink
                                        to={to}
                                        onClick={closeMobileMenu}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 text-lg font-semibold py-2 ${
                                                isActive ? 'text-primary font-bold' : 'text-white hover:text-primary'
                                            }`
                                        }
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span>{label}</span>
                                    </NavLink>
                                </li>
                            ))}
                            <li>
                                <button
                                    onClick={() => {
                                        handleSignOut();
                                        closeMobileMenu();
                                    }}
                                    className="flex items-center gap-3 text-lg font-semibold text-white hover:text-primary py-2"
                                >
                                    <FiLogOut className="w-5 h-5" />
                                    <span>Sign Out</span>
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </>
    );
};

export default Sidebar;