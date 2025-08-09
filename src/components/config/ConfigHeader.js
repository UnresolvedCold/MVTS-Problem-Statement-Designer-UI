// src/components/config/ConfigHeader.js
import React from 'react';

const ConfigHeader = ({ isLoading, hasLocalChanges, onRefresh, onResetToServer, onClearLocal, serverConfigExists }) => {
  return (
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#495057', fontSize: '24px' }}>⚙️ MVTS Configuration</h2>
          <p style={{ margin: '5px 0 0 0', color: '#6c757d', fontSize: '14px' }}>
            Edit configuration parameters locally. Changes will be sent with problem statement.
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          style={{
            padding: '10px 16px',
            backgroundColor: isLoading ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {isLoading ? '🔄' : '↻'} {isLoading ? 'Loading...' : 'Refresh from Server'}
        </button>
      </div>

      {/* Status and Control Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
        {/* Local Changes Status */}
        {hasLocalChanges && (
          <div style={{
            backgroundColor: '#fff3cd',
            color: '#856404',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            border: '1px solid #ffeaa7',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <span>⚠️</span>
            <span>Local changes detected</span>
          </div>
        )}

        {!hasLocalChanges && serverConfigExists && (
          <div style={{
            backgroundColor: '#d1ecf1',
            color: '#0c5460',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            border: '1px solid #bee5eb',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <span>✅</span>
            <span>In sync with server</span>
          </div>
        )}

        {/* Control Buttons */}
        {serverConfigExists && (
          <button
            onClick={onResetToServer}
            disabled={isLoading || !hasLocalChanges}
            style={{
              padding: '6px 12px',
              backgroundColor: hasLocalChanges ? '#ffc107' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: (isLoading || !hasLocalChanges) ? 'not-allowed' : 'pointer',
              fontSize: '12px'
            }}
          >
            🔄 Reset to Server
          </button>
        )}

        <button
          onClick={onClearLocal}
          disabled={isLoading}
          style={{
            padding: '6px 12px',
            backgroundColor: isLoading ? '#6c757d' : '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '12px'
          }}
        >
          🗑️ Clear Local
        </button>
      </div>
    </div>
  );
};

export default ConfigHeader;
