import { Link } from 'react-router-dom';
import PropTypes from 'prop-types'; // Import PropTypes
import { getMainImageUrl, getPlaceholderImageUrl } from '../utils/imageUtils';

export default function ListingItem({ listing }) {
  const mainImageUrl = getMainImageUrl(listing.imageUrls);

  const handleImageError = (e) => {
    console.error(`Failed to load image for listing ${listing._id}:`, mainImageUrl);
    // Use the placeholder image from our utils
    e.target.src = getPlaceholderImageUrl();
    // Add a class to style the placeholder
    e.target.classList.add('placeholder-image');
  };

  return (
    <div className="border border-primary bg-white dark:bg-black hover:!bg-[#db2b2e] transition-all duration-300 text-black dark:text-white hover:!text-white w-full max-w-[265px] sm:max-w-none mx-auto group relative z-10">
      <Link to={`/listing/${listing._id}`} className="block w-full h-full">
        <div className="aspect-square w-full">
          <img
            src={mainImageUrl}
            alt="listing cover"
            className="w-full h-full object-cover"
            onError={handleImageError}
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="p-3 sm:p-4 w-full overflow-hidden">
          <p className="text-sm sm:text-[17px] font-bold mb-1 sm:mb-[2px] truncate group-hover:!text-white transition-colors duration-300 font-nt">{listing.name || 'No Name'}</p>
          <p className="text-xs sm:text-[12px] font-medium mb-2 sm:mb-[6px] truncate group-hover:!text-white transition-colors duration-300 font-nt">{listing.type || 'Uncategorized'}</p>
          <p className="text-sm sm:text-[17px] font-normal group-hover:!text-white transition-colors duration-300 font-nt">E£{listing.price ? listing.price.toLocaleString('en-GB') : 'N/A'}</p>
        </div>
      </Link>
    </div>
  );
}

// Add PropTypes validation
ListingItem.propTypes = {
  listing: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string,
    description: PropTypes.string,
    city: PropTypes.string,
    district: PropTypes.string,
    price: PropTypes.number,
    dimensions: PropTypes.oneOf(['2D', '3D']),
    width: PropTypes.number,
    height: PropTypes.number,
    depth: PropTypes.number,
    type: PropTypes.oneOf([
      'Paintings & Drawings',
      'Sculptures & 3D Art',
      'Antiques & Collectibles',
      'Clothing & Wearables',
      'Home Décor',
      'Accessories',
      'Prints & Posters',
    ]),
    imageUrls: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};