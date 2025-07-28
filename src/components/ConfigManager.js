import React, { useState, useEffect } from 'react';
import { useConfigManager } from '../hooks/useConfigManager';

const ConfigManager = ({ onBack }) => {
  const { config, isLoading, error, fetchConfig, updateConfig } = useConfigManager();
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
          // Recursively flatten nested objects
          flattenObject(value, newKey, result);
        } else {
          // Add primitive values and arrays as-is
          result[newKey] = value;
        }
      }
    }
    return result;
  };

  // Get flattened config for display
  const getFlattenedConfig = () => {
    return flattenObject(config);
  };

  // Fetch config on component mount
  useEffect(() => {
    handleRefresh();
  }, []);

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

  const handleSaveConfig = async () => {
    if (!editingConfig) return;

    let valueToSave = editValue;
    
    // Try to parse as JSON if it looks like an object/array
    if (editValue.trim().startsWith('{') || editValue.trim().startsWith('[')) {
      try {
        valueToSave = JSON.parse(editValue);
      } catch (e) {
        // If JSON parsing fails, treat as string
        console.warn('Could not parse as JSON, treating as string:', e);
      }
    } else if (!isNaN(editValue) && editValue.trim() !== '') {
      // Try to parse as number
      valueToSave = Number(editValue);
    } else if (editValue.toLowerCase() === 'true' || editValue.toLowerCase() === 'false') {
      // Parse as boolean
      valueToSave = editValue.toLowerCase() === 'true';
    }

    // Use the dot notation key directly for updating
    const success = await updateConfig(editingConfig, valueToSave);
    if (success) {
      setEditingConfig(null);
      setEditValue('');
      setLastRefreshTime(new Date().toLocaleString());
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

  return (
    <div style={{ 
      padding: '20px', 
      height: '100vh', 
      overflow: 'auto',
      backgroundColor: '#f8f9fa'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        backgroundColor: 'white',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div>
          <h2 style={{ margin: '0 0 5px 0', color: '#333' }}>⚙️ MVTS Configuration</h2>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            Last refreshed: {lastRefreshTime}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {isLoading ? '🔄 Refreshing...' : '🔄 Refresh'}
          </button>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              ← Back to Grid
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && Object.keys(config).length === 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>⏳</div>
          <div>Loading configuration...</div>
        </div>
      )}

      {/* Config Display */}
      {Object.keys(config).length > 0 && (() => {
        const flattenedConfig = getFlattenedConfig();
        return (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              backgroundColor: '#e9ecef',
              padding: '12px 20px',
              borderBottom: '1px solid #dee2e6',
              fontWeight: 'bold',
              color: '#495057'
            }}>
              Configuration Properties ({Object.keys(flattenedConfig).length} flattened items)
              <div style={{ 
                fontSize: '12px', 
                fontWeight: 'normal', 
                color: '#6c757d',
                marginTop: '4px'
              }}>
                Nested properties are shown with dot notation (e.g., rtp.bots)
              </div>
            </div>
            
            <div style={{ padding: '20px' }}>
              {Object.entries(flattenedConfig).map(([key, value], index) => (
                <div key={key} style={{
                  marginBottom: index === Object.entries(flattenedConfig).length - 1 ? 0 : '20px',
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
        );
      })()}

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

export default ConfigManager;
