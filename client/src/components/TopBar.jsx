import { Link } from 'react-router-dom';

export default function TopBar() {
  return (
    <div className="bg-primary text-black fixed top-0 z-[60] py-1 sm:py-1.5 px-2 sm:px-4 w-full">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <img 
          src="/mediassets/Trademark01.png" 
          alt="Trademark" 
          className="h-2.5 sm:h-3 md:h-3.5 lg:h-4 object-contain" 
        />
        <span className="text-center flex-1 text-black font-bold px-1 sm:px-2 text-[7px] xs:text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs">
          FREE SHIPPING ON ORDERS ABOVE 1500 EGP
        </span>
        <Link
          to="/support"
          className="text-black hover:underline transition-colors duration-200 text-[7px] xs:text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs font-medium whitespace-nowrap"
        >
          Support
        </Link>
      </div>
    </div>
  );
}