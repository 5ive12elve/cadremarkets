import { FiMenu } from 'react-icons/fi';

const CadreBackHeader = ({ onMenuClick }) => {
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-black border-b border-[#db2b2e]/20">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Sidebar Menu Button */}
        <button
          onClick={onMenuClick}
          className="p-2 text-white hover:text-[#db2b2e] transition-colors"
          aria-label="Open menu"
        >
          <FiMenu className="w-6 h-6" />
        </button>

        {/* CADT04.png Logo */}
        <div className="flex items-center">
          <img 
            src="/mediassets/CADT04.png" 
            alt="Cadre Markets" 
            className="h-8 w-auto"
          />
        </div>

        {/* Spacer to balance the layout */}
        <div className="w-10"></div>
      </div>
    </div>
  );
};

export default CadreBackHeader; 