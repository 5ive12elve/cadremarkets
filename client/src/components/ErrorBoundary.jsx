import { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
    // Store the environment at construction time
    this.isDevelopment = import.meta.env.MODE === 'development';
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });
    // You can also log the error to an error reporting service here
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center px-4">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Oops! Something went wrong</h1>
            <p className="text-gray-600 mb-8">
              We apologize for the inconvenience. Please try refreshing the page or go back home.
            </p>
            {this.isDevelopment && (
              <div className="mb-8 text-left bg-red-50 p-4 rounded-lg">
                <p className="text-red-700 font-medium">Error Details:</p>
                <pre className="mt-2 text-sm text-red-600 whitespace-pre-wrap">
                  {this.state.error?.toString()}
                </pre>
              </div>
            )}
            <div className="space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh Page
              </button>
              <Link
                to="/"
                className="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

export default ErrorBoundary; 