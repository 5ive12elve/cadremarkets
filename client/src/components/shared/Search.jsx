import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FiSearch, FiX } from 'react-icons/fi';

const Search = ({ onSearch, placeholder = 'Search...', className = '' }) => {
  const [query, setQuery] = useState('');

  const debouncedSearch = useCallback(() => {
    onSearch(query);
  }, [query, onSearch]);

  useEffect(() => {
    const timer = setTimeout(debouncedSearch, 300);
    return () => clearTimeout(timer);
  }, [debouncedSearch]);

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className={`relative ${className}`}>
      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10 py-2 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:border-primary focus:outline-none text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-300"
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-300"
        >
          <FiX size={16} />
        </button>
      )}
    </div>
  );
};

Search.propTypes = {
  onSearch: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  className: PropTypes.string
};

export default Search; 