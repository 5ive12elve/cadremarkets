import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { restoreToken } from './redux/user/userSlice';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import ErrorBoundary from './components/ErrorBoundary';

// Debug utilities (only in development)
if (import.meta.env.DEV) {
  import('./utils/debug-token.js');
  import('./utils/test-api-url.js');
  import('./utils/test-production-api.js');
}

// Components
import Header from './components/Header';
import TopBar from './components/TopBar';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';

// Main site pages
import Home from './pages/Home';
import About from './pages/About';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import CreateListing from './pages/CreateListing';
import UpdateListing from './pages/UpdateListing';
import Listing from './pages/Listing';
import Search from './pages/Search';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Services from './pages/Services';
import Projects from './pages/Projects';
import Support from './pages/Support';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import ReturnPolicy from './pages/ReturnPolicy';
import AuthDebug from './pages/AuthDebug';
import LoadingDemo from './pages/LoadingDemo';

// Back office pages
import CadreBackLogin from './cadreBack/cadreBackLogin';
import CadreBackDashboard from './cadreBack/cadreBackDashboard';
import CadreBackOrders from './cadreBack/cadreBackOrders';
import CadreBackListings from './cadreBack/cadreBackListings';
import CadreBackArtists from './cadreBack/cadreBackArtists';
import CadreBackUsers from './cadreBack/cadreBackUsers';
import CadreBackServices from './cadreBack/cadreBackServices';
import CadreBackCustomerService from './cadreBack/cadreBackCustomerService';

// Route protection components
import PrivateRoute from './components/PrivateRoute';

// Error pages
import Error404 from './pages/Error404';
import Error401 from './pages/Error401';
import Error403 from './pages/Error403';
import Error500 from './pages/Error500';

if (import.meta.env.DEV) {
  console.log('=== FRONTEND VERSION CHECK ===');
  console.log('Frontend updated with token storage: true');
  console.log('Current timestamp:', new Date().toISOString());
  console.log('Environment:', import.meta.env.MODE);
  console.log('API URL:', import.meta.env.VITE_API_URL);
}

// Token restoration component
const TokenRestorer = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.user);

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('=== ENHANCED TOKEN RESTORER ===');
      console.log('Current Redux token:', !!token);
      console.log('Current Redux token length:', token ? token.length : 0);
    }
    
    // If no token in Redux state, try to restore from multiple sources
    if (!token) {
      if (import.meta.env.DEV) console.log('No token in Redux state, checking storage locations...');
      
      // Check localStorage first
      const storedToken = localStorage.getItem('auth_token');
      if (import.meta.env.DEV) {
        console.log('localStorage token:', !!storedToken);
        console.log('localStorage token length:', storedToken ? storedToken.length : 0);
      }
      
      if (storedToken) {
        if (import.meta.env.DEV) console.log('Restoring token from localStorage to Redux state');
        dispatch(restoreToken(storedToken));
        return;
      }
      
      // Check sessionStorage
      const sessionToken = sessionStorage.getItem('auth_token');
      if (import.meta.env.DEV) {
        console.log('sessionStorage token:', !!sessionToken);
        console.log('sessionStorage token length:', sessionToken ? sessionToken.length : 0);
      }
      
      if (sessionToken) {
        if (import.meta.env.DEV) console.log('Restoring token from sessionStorage to Redux state');
        // Also store in localStorage for future use
        localStorage.setItem('auth_token', sessionToken);
        dispatch(restoreToken(sessionToken));
        return;
      }
      
      // Check user object
      const userString = localStorage.getItem('user');
      if (userString) {
        try {
          const user = JSON.parse(userString);
          const userToken = user.token;
          if (import.meta.env.DEV) {
            console.log('user object token:', !!userToken);
            console.log('user object token length:', userToken ? userToken.length : 0);
          }
          
          if (userToken) {
            if (import.meta.env.DEV) console.log('Restoring token from user object to Redux state');
            // Also store in localStorage for future use
            localStorage.setItem('auth_token', userToken);
            dispatch(restoreToken(userToken));
            return;
          }
        } catch (e) {
          if (import.meta.env.DEV) console.log('Error parsing user object:', e);
        }
      }
      
      if (import.meta.env.DEV) console.log('No token found in any storage location to restore');
    } else {
      if (import.meta.env.DEV) console.log('Token already exists in Redux state');
    }
  }, [dispatch, token]);

  return null;
};

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

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <Router>
            <TokenRestorer />
            <Routes>
              {/* Main site routes */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="sign-in" element={<SignIn />} />
                <Route path="sign-up" element={<SignUp />} />
                <Route path="services" element={<Services />} />
                <Route path="projects" element={<Projects />} />
                <Route path="support" element={<Support />} />
                <Route path="privacy-policy" element={<PrivacyPolicy />} />
                <Route path="terms-of-service" element={<TermsOfService />} />
                <Route path="return-policy" element={<ReturnPolicy />} />
                <Route path="debug" element={<AuthDebug />} />
                <Route path="loading-demo" element={<LoadingDemo />} />
                
                {/* Protected routes */}
                <Route element={<PrivateRoute />}>
                  <Route path="profile" element={<Profile />} />
                  <Route path="edit-profile" element={<EditProfile />} />
                  <Route path="create-listing" element={<CreateListing />} />
                  <Route path="update-listing/:id" element={<UpdateListing />} />
                </Route>
                
                {/* Public routes that don't need authentication */}
                <Route path="listing/:id" element={<Listing />} />
                <Route path="search" element={<Search />} />
                <Route path="cart" element={<Cart />} />
                <Route path="checkout" element={<Checkout />} />
              </Route>

              {/* Back office routes */}
              <Route path="/cadreBack" element={<CadreBackLogin />} />
              <Route path="/cadreBack/*" element={<BackOfficeLayout />}>
                <Route path="dashboard" element={<CadreBackDashboard />} />
                <Route path="orders" element={<CadreBackOrders />} />
                <Route path="listings" element={<CadreBackListings />} />
                <Route path="artists" element={<CadreBackArtists />} />
                <Route path="users" element={<CadreBackUsers />} />
                <Route path="services" element={<CadreBackServices />} />
                <Route path="customer-service" element={<CadreBackCustomerService />} />
              </Route>

              {/* Error pages */}
              <Route path="/401" element={<Error401 />} />
              <Route path="/403" element={<Error403 />} />
              <Route path="/500" element={<Error500 />} />
              <Route path="*" element={<Error404 />} />
            </Routes>
          </Router>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}