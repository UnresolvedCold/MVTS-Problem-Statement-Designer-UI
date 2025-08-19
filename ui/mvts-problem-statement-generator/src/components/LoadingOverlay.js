import React from 'react';

const LoadingOverlay = ({ isLoading, message, error, onRetry }) => {
  if (error && !isLoading) {
    return (
      <div className="p-2.5 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 text-yellow-800 dark:text-yellow-200 text-sm flex items-center gap-2.5">
        <span>⚠️</span>
        <div>
          <strong>Schema Loading Warning:</strong> {error}
          <br />
          <small>Using default schemas. You can still create objects, but they may not match server expectations.</small>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-auto py-1 px-2.5 bg-yellow-400 dark:bg-yellow-600 border-none rounded cursor-pointer text-xs hover:bg-yellow-500 dark:hover:bg-yellow-700 transition-colors text-yellow-900 dark:text-yellow-100"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex justify-center items-center z-50 text-white text-lg">
        <div className="bg-black bg-opacity-80 dark:bg-gray-800 dark:bg-opacity-90 p-5 rounded-lg text-center">
          <div>🔄 {message || 'Loading schemas...'}</div>
        </div>
      </div>
    );
  }

  return null;
};

export default LoadingOverlay;
