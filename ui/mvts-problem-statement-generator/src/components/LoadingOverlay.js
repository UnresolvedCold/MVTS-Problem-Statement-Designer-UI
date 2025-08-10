import React from 'react';

const LoadingOverlay = ({ isLoading, message, error, onRetry }) => {
  if (error && !isLoading) {
    return (
      <div style={{
        padding: '10px',
        backgroundColor: '#fff3cd',
        borderLeft: '4px solid #ffc107',
        color: '#856404',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <span>⚠️</span>
        <div>
          <strong>Schema Loading Warning:</strong> {error}
          <br />
          <small>Using default schemas. You can still create objects, but they may not match server expectations.</small>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              marginLeft: 'auto',
              padding: '5px 10px',
              backgroundColor: '#ffc107',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        color: 'white',
        fontSize: '18px'
      }}>
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div>🔄 {message || 'Loading schemas...'}</div>
        </div>
      </div>
    );
  }

  return null;
};

export default LoadingOverlay;
