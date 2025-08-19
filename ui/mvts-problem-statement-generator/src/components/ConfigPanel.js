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
  const [showAddModal, setShowAddModal] = useState(false);
  const [newConfigName, setNewConfigName] = useState('');
  const [newConfigValue, setNewConfigValue] = useState('');

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

  // Get flattened server config for comparison
  const getFlattenedServerConfig = () => {
    return flattenObject(serverConfig);
  };

  // Check if a config value has changed from server value
  const isConfigChanged = (key, value) => {
    const flattenedServerConfig = getFlattenedServerConfig();
    const serverValue = flattenedServerConfig[key];
    
    // If server config is empty or key doesn't exist in server config, 
    // consider it unchanged (to avoid highlighting everything as changed)
    if (Object.keys(serverConfig).length === 0 || !(key in flattenedServerConfig)) {
      return false;
    }
    
    const currentValueStr = JSON.stringify(value);
    const serverValueStr = JSON.stringify(serverValue);
    return currentValueStr !== serverValueStr;
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

  const handleAddConfig = () => {
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewConfigName('');
    setNewConfigValue('');
  };

  const handleSaveNewConfig = () => {
    if (!newConfigName.trim()) {
      alert('Please enter a config name');
      return;
    }

    let valueToSave = newConfigValue;
    
    // Try to parse the value similar to handleSaveConfig
    if (newConfigValue.trim().startsWith('{') || newConfigValue.trim().startsWith('[')) {
      try {
        valueToSave = JSON.parse(newConfigValue);
      } catch (e) {
        console.warn('Could not parse as JSON, treating as string:', e);
      }
    } else if (!isNaN(newConfigValue) && newConfigValue.trim() !== '') {
      valueToSave = Number(newConfigValue);
    } else if (newConfigValue.toLowerCase() === 'true' || newConfigValue.toLowerCase() === 'false') {
      valueToSave = newConfigValue.toLowerCase() === 'true';
    }

    const success = updateConfig(newConfigName.trim(), valueToSave);
    if (success) {
      handleCloseAddModal();
    }
  };

  const renderConfigValue = (key, value) => {
    const isEditing = editingConfig === key;
    const hasChanged = isConfigChanged(key, value);
    
    if (isEditing) {
      return (
        <div className="flex flex-col gap-2.5">
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full min-h-20 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-xs"
          />
          <div className="flex gap-2.5">
            <button
              onClick={handleSaveConfig}
              disabled={isLoading}
              className={`py-1.5 px-3 text-white border-none rounded cursor-pointer text-xs ${
                isLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700'
              } transition-colors`}
            >
              {isLoading ? 'Updating...' : 'Update'}
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={isLoading}
              className={`py-1.5 px-3 text-white border-none rounded cursor-pointer text-xs ${
                isLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-gray-500 dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-700'
              } transition-colors`}
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex justify-between items-start gap-2.5">
        <div className="flex-1 break-words">
          <div className={`m-0 font-mono text-xs p-2 rounded border break-all relative ${
            hasChanged 
              ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700' 
              : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
          } text-gray-900 dark:text-gray-100`}>
            {hasChanged && (
              <div className="absolute -top-2 -right-2 bg-yellow-400 dark:bg-yellow-500 text-gray-900 dark:text-gray-100 text-xs py-0.5 px-1.5 rounded-full font-bold shadow">
                CHANGED
              </div>
            )}
            {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
          </div>
        </div>
        <button
          onClick={() => handleEdit(key, value)}
          disabled={isLoading || editingConfig !== null}
          className={`py-1 px-2 text-white border-none rounded text-xs flex-shrink-0 transition-colors ${
            (isLoading || editingConfig !== null) 
              ? 'bg-gray-500 cursor-not-allowed' 
              : 'bg-blue-500 dark:bg-blue-600 cursor-pointer hover:bg-blue-600 dark:hover:bg-blue-700'
          }`}
        >
          Edit
        </button>
      </div>
    );
  };

  const flattenedConfig = flattenObject(config);

  return (
    <div className="p-5 h-screen overflow-auto bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-lg mb-5 shadow">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="m-0 text-gray-700 dark:text-gray-200 text-2xl">⚙️ MVTS Configuration</h2>
            <p className="mt-1 mb-0 text-gray-500 dark:text-gray-400 text-sm">
              Edit configuration parameters locally. Changes will be sent with problem statement.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className={`py-2.5 px-4 text-white border-none rounded cursor-pointer text-sm flex items-center gap-2 transition-colors ${
              isLoading 
                ? 'bg-gray-500 cursor-not-allowed' 
                : 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700'
            }`}
          >
            {isLoading ? '🔄' : '↻'} {isLoading ? 'Loading...' : 'Refresh from Server'}
          </button>
        </div>

        {/* Status and Control Buttons */}
        <div className="flex flex-wrap gap-2.5 items-center">
          {/* Local Changes Status */}
          {hasLocalChanges && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 py-2 px-3 rounded text-xs border border-yellow-200 dark:border-yellow-700 flex items-center gap-1.5">
              <span>⚠️</span>
              <span>Local changes detected</span>
            </div>
          )}

          {!hasLocalChanges && Object.keys(config).length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 py-2 px-3 rounded text-xs border border-blue-200 dark:border-blue-700 flex items-center gap-1.5">
              <span>✅</span>
              <span>In sync with server</span>
            </div>
          )}

          {/* Control Buttons */}
          {Object.keys(serverConfig).length > 0 && (
            <button
              onClick={handleResetToServer}
              disabled={isLoading || !hasLocalChanges}
              className={`py-1.5 px-3 text-white border-none rounded cursor-pointer text-xs transition-colors ${
                hasLocalChanges && !isLoading
                  ? 'bg-yellow-500 dark:bg-yellow-600 hover:bg-yellow-600 dark:hover:bg-yellow-700' 
                  : 'bg-gray-500 cursor-not-allowed'
              }`}
            >
              🔄 Reset to Server
            </button>
          )}

          <button
            onClick={handleClearLocal}
            disabled={isLoading || Object.keys(config).length === 0}
            className={`py-1.5 px-3 text-white border-none rounded cursor-pointer text-xs transition-colors ${
              Object.keys(config).length > 0 && !isLoading
                ? 'bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700' 
                : 'bg-gray-500 cursor-not-allowed'
            }`}
          >
            🗑️ Clear Local
          </button>

          <button
            onClick={handleAddConfig}
            disabled={isLoading || editingConfig !== null}
            className={`py-1.5 px-3 text-white border-none rounded cursor-pointer text-xs transition-colors ${
              !isLoading && editingConfig === null
                ? 'bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700' 
                : 'bg-gray-500 cursor-not-allowed'
            }`}
          >
            ➕ Add New Config
          </button>
        </div>
      </div>

      {/* Status */}
      {lastRefreshTime && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-2.5 px-4 rounded mb-4 text-xs text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
          <strong>📅 Last Server Sync:</strong> {lastRefreshTime}
          {hasLocalChanges && (
            <span className="ml-4 text-orange-600 dark:text-orange-400">
              <strong>⚠️ Local changes will be sent with problem statement</strong>
            </span>
          )}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-lg mb-5 border border-red-200 dark:border-red-700">
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && !editingConfig && (
        <div className="bg-white dark:bg-gray-800 p-10 rounded-lg text-center text-gray-700 dark:text-gray-300 shadow">
          <div className="text-lg mb-2.5">🔄</div>
          <div>Loading configuration...</div>
        </div>
      )}

      {/* Config Values */}
      {!isLoading && Object.keys(flattenedConfig).length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow">
          <h3 className="mt-0 mb-4 text-gray-700 dark:text-gray-200">Configuration Values</h3>
          <div className="space-y-4">
            {Object.entries(flattenedConfig).map(([key, value]) => (
              <div key={key} className="border-b border-gray-200 dark:border-gray-600 pb-4 last:border-b-0">
                <div className="font-medium text-sm mb-2 text-gray-900 dark:text-gray-100">{key}</div>
                {renderConfigValue(key, value)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && Object.keys(flattenedConfig).length === 0 && (
        <div className="bg-white dark:bg-gray-800 p-10 rounded-lg text-center text-gray-500 dark:text-gray-400 shadow">
          <div className="text-lg mb-2.5">📝</div>
          <div>No configuration values found</div>
          <p className="text-xs mt-2">Add new configuration values or refresh from server</p>
        </div>
      )}

      {/* Add Config Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="mt-0 mb-4 text-gray-900 dark:text-gray-100">Add New Configuration</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Config Name:</label>
              <input
                type="text"
                value={newConfigName}
                onChange={(e) => setNewConfigName(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="e.g., timeout.value"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Config Value:</label>
              <textarea
                value={newConfigValue}
                onChange={(e) => setNewConfigValue(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm"
                rows="4"
                placeholder="Enter value (string, number, boolean, or JSON)"
              />
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={handleSaveNewConfig}
                className="py-2 px-4 bg-green-500 dark:bg-green-600 text-white border-none rounded cursor-pointer hover:bg-green-600 dark:hover:bg-green-700 transition-colors"
              >
                Save
              </button>
              <button
                onClick={handleCloseAddModal}
                className="py-2 px-4 bg-gray-500 dark:bg-gray-600 text-white border-none rounded cursor-pointer hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigPanel;
