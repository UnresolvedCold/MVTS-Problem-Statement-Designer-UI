// src/components/ConfigPanel.js
import React, { useState, useEffect } from 'react';

const ConfigPanel = ({ configManager }) => {
  const { 
    config, 
    serverConfig, 
    isLoading, 
    error, 
    hasLocalChanges, 
    fetchConfig, 
    updateConfig, 
    resetToServerConfig, 
    clearLocalConfig 
  } = configManager;
  
  const [editingConfig, setEditingConfig] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date().toLocaleString());

  // Function to flatten nested objects into dot notation
  const flattenObject = (obj, prefix = '', result = {}) => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        const value = obj[key];
        
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
          flattenObject(value, newKey, result);
        } else {
          result[newKey] = value;
        }
      }
    }
    return result;
  };

  // Fetch config on component mount
  useEffect(() => {
    const performRefresh = async () => {
      await fetchConfig();
      setLastRefreshTime(new Date().toLocaleString());
    };
    performRefresh();
  }, [fetchConfig]);

  const handleRefresh = async () => {
    await fetchConfig();
    setLastRefreshTime(new Date().toLocaleString());
  };

  const handleEdit = (configName, currentValue) => {
    setEditingConfig(configName);
    setEditValue(typeof currentValue === 'object' ? JSON.stringify(currentValue, null, 2) : String(currentValue));
  };

  const handleCancelEdit = () => {
    setEditingConfig(null);
    setEditValue('');
  };

  const handleSaveConfig = () => {
    if (!editingConfig) return;

    let valueToSave = editValue;
    
    // Try to parse as JSON if it looks like an object/array
    if (editValue.trim().startsWith('{') || editValue.trim().startsWith('[')) {
      try {
        valueToSave = JSON.parse(editValue);
      } catch (e) {
        console.warn('Could not parse as JSON, treating as string:', e);
      }
    } else if (!isNaN(editValue) && editValue.trim() !== '') {
      valueToSave = Number(editValue);
    } else if (editValue.toLowerCase() === 'true' || editValue.toLowerCase() === 'false') {
      valueToSave = editValue.toLowerCase() === 'true';
    }

    const success = updateConfig(editingConfig, valueToSave);
    if (success) {
      setEditingConfig(null);
      setEditValue('');
    }
  };

  const handleResetToServer = () => {
    if (window.confirm('Reset all local changes to server configuration? This cannot be undone.')) {
      resetToServerConfig();
    }
  };

  const handleClearLocal = () => {
    if (window.confirm('Clear all local configuration? This cannot be undone.')) {
      clearLocalConfig();
    }
  };

  const renderConfigValue = (key, value) => {
    const isEditing = editingConfig === key;
    
    if (isEditing) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '12px'
            }}
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleSaveConfig}
              disabled={isLoading}
              style={{
                padding: '6px 12px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '12px'
              }}
            >
              {isLoading ? 'Updating...' : 'Update'}
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={isLoading}
              style={{
                padding: '6px 12px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '12px'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
        <div style={{ flex: 1, wordBreak: 'break-word' }}>
          <div style={{ 
            margin: 0, 
            fontFamily: 'monospace', 
            fontSize: '12px',
            backgroundColor: '#f8f9fa',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #e9ecef',
            wordBreak: 'break-all'
          }}>
            {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
          </div>
        </div>
        <button
          onClick={() => handleEdit(key, value)}
          disabled={isLoading || editingConfig !== null}
          style={{
            padding: '4px 8px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: (isLoading || editingConfig !== null) ? 'not-allowed' : 'pointer',
            fontSize: '11px',
            flexShrink: 0
          }}
        >
          Edit
        </button>
      </div>
    );
  };

  const flattenedConfig = flattenObject(config);

  return (
    <div style={{ 
      padding: '20px', 
      height: '100vh', 
      overflow: 'auto',
      backgroundColor: '#f8f9fa'
    }}>
      {/* Header */}
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
            onClick={handleRefresh}
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

          {!hasLocalChanges && Object.keys(config).length > 0 && (
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
          {Object.keys(serverConfig).length > 0 && (
            <button
              onClick={handleResetToServer}
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
            onClick={handleClearLocal}
            disabled={isLoading || Object.keys(config).length === 0}
            style={{
              padding: '6px 12px',
              backgroundColor: Object.keys(config).length > 0 ? '#dc3545' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: (isLoading || Object.keys(config).length === 0) ? 'not-allowed' : 'pointer',
              fontSize: '12px'
            }}
          >
            🗑️ Clear Local
          </button>
        </div>
      </div>

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

      {/* Loading State */}
      {isLoading && !editingConfig && (
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#495057',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>🔄</div>
          <div>Loading configuration...</div>
        </div>
      )}

      {/* Config Values */}
      {!isLoading && !error && Object.keys(config).length > 0 && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            padding: '15px 20px',
            borderBottom: '1px solid #e9ecef',
            backgroundColor: '#f8f9fa'
          }}>
            <h3 style={{ margin: 0, color: '#495057', fontSize: '16px' }}>
              📋 Configuration Parameters ({Object.keys(flattenedConfig).length})
            </h3>
            <p style={{ margin: '5px 0 0 0', color: '#6c757d', fontSize: '12px' }}>
              {hasLocalChanges 
                ? '🟡 Showing local configuration (modified)' 
                : Object.keys(config).length > 0 
                  ? '🟢 Showing configuration (in sync with server)'
                  : '⚪ No configuration loaded'
              }
            </p>
          </div>
          <div style={{ padding: '20px' }}>
            {Object.entries(flattenedConfig).map(([key, value], index) => (
              <div key={key} style={{
                marginBottom: '20px',
                paddingBottom: index === Object.entries(flattenedConfig).length - 1 ? 0 : '20px',
                borderBottom: index === Object.entries(flattenedConfig).length - 1 ? 'none' : '1px solid #e9ecef'
              }}>
                <div style={{
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  color: '#495057',
                  fontSize: '14px',
                  fontFamily: 'monospace'
                }}>
                  {key}
                </div>
                {renderConfigValue(key, value)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && Object.keys(config).length === 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#6c757d',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>📋</div>
          <div>No configuration found</div>
          <div style={{ fontSize: '14px', marginTop: '5px' }}>
            Click "Refresh" to load configuration from MVTS API
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigPanel;
