import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import About from './pages/About';
import Profile from './pages/Profile';
import CreateListing from './pages/CreateListing';
import UpdateListing from './pages/UpdateListing';
import Listing from './pages/Listing';
import Search from './pages/Search';
import Header from './components/Header';
import TopBar from './components/TopBar';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';
import CadreBackListings from './cadreBack/cadreBackListings';
import CadreBackUsers from './cadreBack/cadreBackUsers';
import CadreBackLogin from './cadreBack/cadreBackLogin';
import CadreBackDashboard from './cadreBack/cadreBackDashboard';
import CadreBackOrders from './cadreBack/cadreBackOrders';
import CadreBackServices from './cadreBack/cadreBackServices';
import CadreBackCustomerService from './cadreBack/cadreBackCustomerService';
import CadreBackArtists from './cadreBack/cadreBackArtists';
import Sidebar from './components/Sidebar';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Error404 from './pages/Error404';
import Error500 from './pages/Error500';
import Error401 from './pages/Error401';
import Error403 from './pages/Error403';
import EditProfile from './pages/EditProfile';
import Services from './pages/Services';
import Projects from './pages/Projects';
import Support from './pages/Support';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import ReturnPolicy from './pages/ReturnPolicy';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';

// Debug: Check if frontend has been updated
console.log('=== FRONTEND VERSION CHECK ===');
console.log('Frontend updated with token storage: true');
console.log('Current timestamp:', new Date().toISOString());

// Layout component for the main website
const MainLayout = () => {
    return (
        <div className="min-h-screen flex flex-col relative bg-white dark:bg-black transition-colors duration-300">
            <TopBar />
            <Header />
            <main className="flex-grow pt-[100px] sm:pt-[110px] md:pt-[125px] lg:pt-[135px]">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

// Layout component for the back office
const BackOfficeLayout = () => {
    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-black transition-colors duration-300">
            {/* Desktop Sidebar Container */}
            <div className="hidden md:fixed md:left-0 md:top-0 md:w-[250px] md:h-full md:block">
                <Sidebar />
            </div>
            
            {/* Mobile Sidebar (rendered by Sidebar component) */}
            <div className="md:hidden">
                <Sidebar />
            </div>
            
            {/* Main Content */}
            <div className="flex-1 md:pl-[250px] min-h-screen">
                {/* Mobile content with top padding for hamburger button */}
                <main className="w-full max-w-[1600px] mx-auto p-4 md:p-8 pt-16 md:pt-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

// Layout component for the back office routes
const BackOfficeRoutes = () => {
    return (
        <Routes>
            <Route index element={<CadreBackLogin />} />
            <Route element={<PrivateRoute />}>
                <Route element={<BackOfficeLayout />}>
                    <Route path="dashboard" element={<CadreBackDashboard />} />
                    <Route path="orders" element={<CadreBackOrders />} />
                    <Route path="listings" element={<CadreBackListings />} />
                    <Route path="artists" element={<CadreBackArtists />} />
                    <Route path="users" element={<CadreBackUsers />} />
                    <Route path="services" element={<CadreBackServices />} />
                    <Route path="customer-service" element={<CadreBackCustomerService />} />
                </Route>
            </Route>
        </Routes>
    );
};

export default function App() {
    return (
        <LanguageProvider>
            <ThemeProvider>
                <ErrorBoundary>
                    <BrowserRouter>
                    <Routes>
                    {/* Main Website Routes */}
                    <Route path="/" element={<MainLayout />}>
                        <Route index element={<Home />} />
                        <Route path="about" element={<About />} />
                        <Route path="sign-in" element={<SignIn />} />
                        <Route path="sign-up" element={<SignUp />} />
                        <Route path="search" element={<Search />} />
                        <Route path="listing/:listingId" element={<Listing />} />
                        <Route path="cart" element={<Cart />} />
                        <Route path="checkout" element={<Checkout />} />
                        <Route path="support" element={<Support />} />
                        <Route path="privacy-policy" element={<PrivacyPolicy />} />
                        <Route path="terms-of-service" element={<TermsOfService />} />
                        <Route path="return-policy" element={<ReturnPolicy />} />
                        <Route path="401" element={<Error401 />} />
                        <Route path="403" element={<Error403 />} />
                        <Route path="500" element={<Error500 />} />
                        <Route path="services" element={<Services />} />
                        <Route path="projects" element={<Projects />} />

                        {/* Protected Routes */}
                        <Route element={<PrivateRoute />}>
                            <Route path="profile" element={<Profile />} />
                            <Route path="edit-profile" element={<EditProfile />} />
                            <Route path="create-listing" element={<CreateListing />} />
                            <Route path="update-listing/:listingId" element={<UpdateListing />} />
                        </Route>
                    </Route>

                    {/* Back-Office Routes */}
                    <Route path="/cadreBack/*" element={<BackOfficeRoutes />} />

                    {/* Catch-all route */}
                    <Route path="*" element={<Error404 />} />
                </Routes>
            </BrowserRouter>
        </ErrorBoundary>
        </ThemeProvider>
        </LanguageProvider>
    );
}