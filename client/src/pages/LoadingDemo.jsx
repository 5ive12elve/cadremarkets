import { useState } from 'react';
import Loading from '../components/Loading';
import LoadingSpinner from '../components/LoadingSpinner';
import GE02Loader from '../components/GE02Loader';
import { useTheme } from '../contexts/ThemeContext';

export default function LoadingDemo() {
  const { isDarkMode } = useTheme();
  const [showFullScreen, setShowFullScreen] = useState(false);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'} transition-colors duration-300`}>
      <div className="max-w-4xl mx-auto p-6 pt-24">
        <h1 className="text-4xl font-bold mb-8 text-center">Loading Animation Demo</h1>
        
        {/* Full Screen Loading Demo */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Full Screen Loading</h2>
          <button
            onClick={() => setShowFullScreen(true)}
            className="bg-primary text-white px-6 py-3 rounded hover:bg-primary/90 transition-colors"
          >
            Show Full Screen Loading
          </button>
          <p className="text-sm text-gray-500 mt-2">Click to see the full screen loading animation</p>
        </div>

        {/* Inline Loading Demos */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Inline Loading Components</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Large Loading */}
            <div className="text-center">
              <h3 className="text-lg font-medium mb-4">Large Loading</h3>
              <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-8">
                <Loading fullScreen={false} size="large" />
              </div>
            </div>

            {/* Medium Loading */}
            <div className="text-center">
              <h3 className="text-lg font-medium mb-4">Medium Loading</h3>
              <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-8">
                <Loading fullScreen={false} size="medium" />
              </div>
            </div>

            {/* Small Loading */}
            <div className="text-center">
              <h3 className="text-lg font-medium mb-4">Small Loading</h3>
              <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-8">
                <Loading fullScreen={false} size="small" />
              </div>
            </div>
          </div>
        </div>

        {/* GE02 Loader Demos */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">GE02 Revolving Loaders</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Small GE02 */}
            <div className="text-center">
              <h3 className="text-lg font-medium mb-4">Small</h3>
              <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-8">
                <GE02Loader size="small" />
              </div>
            </div>

            {/* Medium GE02 */}
            <div className="text-center">
              <h3 className="text-lg font-medium mb-4">Medium</h3>
              <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-8">
                <GE02Loader size="medium" />
              </div>
            </div>

            {/* Large GE02 */}
            <div className="text-center">
              <h3 className="text-lg font-medium mb-4">Large</h3>
              <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-8">
                <GE02Loader size="large" />
              </div>
            </div>

            {/* XLarge GE02 */}
            <div className="text-center">
              <h3 className="text-lg font-medium mb-4">XLarge</h3>
              <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-8">
                <GE02Loader size="xlarge" />
              </div>
            </div>
          </div>

          {/* GE02 with Messages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-4">With Message</h3>
              <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-8">
                <GE02Loader size="large" message="Loading data..." />
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-medium mb-4">Overlay Style</h3>
              <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-8 relative">
                <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                  <p className="text-gray-500">Content behind overlay</p>
                </div>
                <GE02Loader overlay={true} size="medium" message="Processing..." />
              </div>
            </div>
          </div>
        </div>

        {/* Loading Spinner Demos */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Loading Spinners</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Spinner Sizes */}
            <div>
              <h3 className="text-lg font-medium mb-4">Different Sizes</h3>
              <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <span className="w-20 text-sm">Small:</span>
                  <LoadingSpinner size="small" />
                </div>
                <div className="flex items-center gap-4">
                  <span className="w-20 text-sm">Medium:</span>
                  <LoadingSpinner size="medium" />
                </div>
                <div className="flex items-center gap-4">
                  <span className="w-20 text-sm">Large:</span>
                  <LoadingSpinner size="large" />
                </div>
              </div>
            </div>

            {/* Spinner with Text */}
            <div>
              <h3 className="text-lg font-medium mb-4">With Text</h3>
              <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="small" showText={true} />
                </div>
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="medium" showText={true} />
                </div>
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="large" showText={true} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Screen Loading Overlay */}
      {showFullScreen && (
        <>
          <Loading fullScreen={true} size="large" />
          <button
            onClick={() => setShowFullScreen(false)}
            className="fixed top-4 right-4 z-[60] bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Close
          </button>
        </>
      )}
    </div>
  );
} 