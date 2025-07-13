import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export default function TopBar() {
  const { isArabic } = useLanguage();
  return (
    <div className="bg-primary text-black fixed top-0 z-[60] py-1.5 sm:py-2 px-3 sm:px-4 w-full">
      <div className={`max-w-7xl mx-auto flex justify-between items-center ${isArabic ? 'flex-row-reverse' : 'flex-row'}`}>
        <img 
          src="/mediassets/Trademark01.png" 
          alt="Trademark" 
          className="h-3 sm:h-3.5 md:h-4 lg:h-4.5 object-contain" 
        />
        <span className="text-center flex-1 text-black font-bold px-2 sm:px-3 text-[10px] xs:text-[11px] sm:text-[12px] md:text-[13px] lg:text-sm">
          FREE SHIPPING ON ORDERS ABOVE 1500 EGP
        </span>
        <Link
          to="/support"
          className="text-black hover:underline transition-colors duration-200 text-[10px] xs:text-[11px] sm:text-[12px] md:text-[13px] lg:text-sm font-medium whitespace-nowrap"
        >
          Support
        </Link>
      </div>
    </div>
  );
}