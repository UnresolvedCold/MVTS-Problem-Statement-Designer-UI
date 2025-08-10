// src/components/config/ConfigStatus.js
import React from 'react';

const ConfigStatus = ({ lastRefreshTime, hasLocalChanges, error }) => {
  return (
    <>
      {/* Status */}
      {lastRefreshTime && (
        <div style={{
          backgroundColor: '#e3f2fd',
          padding: '10px 15px',
          borderRadius: '6px',
          marginBottom: '15px',
          fontSize: '12px',
          color: '#1565c0'
        }}>
          <strong>📅 Last Server Sync:</strong> {lastRefreshTime}
          {hasLocalChanges && (
            <span style={{ marginLeft: '15px', color: '#f57c00' }}>
              <strong>⚠️ Local changes will be sent with problem statement</strong>
            </span>
          )}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          <strong>❌ Error:</strong> {error}
        </div>
      )}
    </>
  );
};

export default ConfigStatus;
