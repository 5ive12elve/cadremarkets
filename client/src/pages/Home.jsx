import Hero from '../components/sections/Hero';
import WhoIsThisFor from '../components/sections/WhoIsThisFor';
import Services from '../components/sections/Services';
import Quote from '../components/sections/Quote';
import Quote2 from '../components/sections/Quote2';
import FeaturedProjects from '../components/sections/FeaturedProjects';
import Contact from '../components/sections/Contact';
import MarketplacePreview from '../components/sections/MarketplacePreview';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../locales/translations';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';

export default function Home() {
  const { direction, currentLang } = useLanguage();
  const { currentUser } = useSelector((state) => state.user);
  
  useEffect(() => {
    console.log('=== HOMEPAGE MOUNTED ===');
    console.log('Current URL:', window.location.href);
    console.log('Current user in Redux:', !!currentUser);
    console.log('Current user ID:', currentUser?._id);
    
    // Check token in all storage locations
    const authToken = localStorage.getItem('auth_token');
    const userString = localStorage.getItem('user');
    const sessionToken = sessionStorage.getItem('auth_token');
    
    console.log('=== HOMEPAGE TOKEN STATUS ===');
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
    
    console.log('=== HOMEPAGE TOKEN STATUS END ===');
  }, [currentUser]);
  
  return (
    <div className="bg-white dark:bg-black min-h-screen w-full overflow-x-hidden transition-colors duration-300 font-primary" dir={direction}>
      <Hero />
      <WhoIsThisFor />
      <Services />

      <Quote 
        text={useTranslation('home', 'quoteText', currentLang)}
        author={useTranslation('home', 'quoteAuthor', currentLang)}
        image="/mediassets/michaelsamuel.png"
      />

      <MarketplacePreview />
      
      <Quote2 
        text={useTranslation('home', 'quote2Text', currentLang)}
        author={useTranslation('home', 'quote2Author', currentLang)}
        image="/mediassets/michaelsamuel01.png"
      />
      
      <FeaturedProjects />
      <Contact />
    </div>
  );
}
