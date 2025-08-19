import React from 'react';

const ClearStorageButton = () => {
  const handleClearStorage = () => {
    if (window.confirm('This will clear all saved data and reset to defaults. Are you sure?')) {
      // Clear specific keys
      localStorage.removeItem('mvts-warehouse-data');
      localStorage.removeItem('mvts-local-config');

      // Reload the page to reinitialize with defaults
      window.location.reload();
    }
  };

  return (
    <button
      onClick={handleClearStorage}
      className="py-2.5 px-4 bg-red-600 text-white border-none rounded cursor-pointer text-xs z-50 shadow-lg hover:bg-red-700 transition-colors"
      title="Clear localStorage and reset to defaults"
    >
      🗑️ Reset
    </button>
  );
};

export default ClearStorageButton;
