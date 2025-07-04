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

export default function Home() {
  const { direction, currentLang } = useLanguage();
  
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
