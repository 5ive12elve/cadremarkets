import PropTypes from 'prop-types';

const variants = {
  primary: 'bg-[#db2b2e] text-white hover:opacity-90',
  secondary: 'bg-white dark:bg-black text-black dark:text-white border border-[#db2b2e] hover:bg-[#db2b2e]/10 transition-colors duration-300',
  danger: 'bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white',
  success: 'bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white'
};

const sizes = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg'
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  icon: Icon
}) => {
  return (
    <button
      type={type}
      className={`
        inline-flex items-center justify-center font-medium transition-all
        ${variants[variant]}
        ${sizes[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : Icon ? (
        <Icon className={`h-5 w-5 ${children ? 'mr-2' : ''}`} />
      ) : null}
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'success']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  onClick: PropTypes.func,
  type: PropTypes.string,
  icon: PropTypes.elementType
};

export default Button; 