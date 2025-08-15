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
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '10px 15px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '12px',
        zIndex: 1000,
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
      }}
      title="Clear localStorage and reset to defaults"
    >
      🗑️ Clear Storage
    </button>
  );
};

export default ClearStorageButton;
