import React from 'react';
import PhoneInputWithCountry from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import './PhoneInput.css';

const PhoneInput = ({
  value,
  onChange,
  placeholder,
  className = '',
  error,
  disabled = false,
  required = false,
  dir = 'ltr',
  ...props
}) => {
  return (
    <div className="relative">
      <PhoneInputWithCountry
        international
        countryCallingCodeEditable={false}
        defaultCountry="EG"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        dir={dir}
        className={`
          w-full bg-white dark:bg-black border border-gray-300 dark:border-[#db2b2e]/20 
          p-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/50 
          focus:outline-none focus:border-primary dark:focus:border-[#db2b2e] 
          transition-colors duration-200
          ${error ? 'border-red-500 dark:border-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className={`text-red-500 dark:text-[#db2b2e] text-sm mt-1 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
          {error}
        </p>
      )}
    </div>
  );
};

export default PhoneInput; 