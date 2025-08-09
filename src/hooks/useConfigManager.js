import { useState, useCallback, useEffect } from 'react';

const LOCAL_CONFIG_KEY = 'mvts-local-config';

export const useConfigManager = () => {
  // Initialize config from localStorage or empty object
  const [localConfig, setLocalConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_CONFIG_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.warn('Failed to parse saved config:', e);
      return {};
    }
  });
  
  const [serverConfig, setServerConfig] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);

  // Save local config to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(LOCAL_CONFIG_KEY, JSON.stringify(localConfig));
  }, [localConfig]);

  // Use relative URLs since we have a proxy setup
  const getMvtsApiUrl = () => {
    return ''; // Empty string for relative URLs - proxy will handle routing
  };

  // Fetch config from server and merge with local
  const fetchConfig = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${getMvtsApiUrl()}/mvts/config/all`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const serverData = await response.json();
      setServerConfig(serverData);
      
      // If no local config exists, initialize with server config
      if (Object.keys(localConfig).length === 0) {
        setLocalConfig(serverData);
        setHasLocalChanges(false);
      } else {
        // Check if local config differs from server config
        const hasChanges = JSON.stringify(localConfig) !== JSON.stringify(serverData);
        setHasLocalChanges(hasChanges);
      }
    } catch (err) {
      console.error('Error fetching config:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [localConfig]);

  // Update local config only (no server call)
  const updateConfig = useCallback((configName, value) => {
    setLocalConfig(prev => {
      const newConfig = { ...prev };
      
      // Handle dot notation (e.g., "nested.key")
      if (configName.includes('.')) {
        const keys = configName.split('.');
        let current = newConfig;
        
        // Navigate to the parent of the target key
        for (let i = 0; i < keys.length - 1; i++) {
          if (!(keys[i] in current)) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }
        
        // Set the final value
        current[keys[keys.length - 1]] = value;
      } else {
        newConfig[configName] = value;
      }
      
      return newConfig;
    });
    
    setHasLocalChanges(true);
    return true; // Always succeeds for local updates
  }, []);

  // Reset local config to server config
  const resetToServerConfig = useCallback(() => {
    setLocalConfig(serverConfig);
    setHasLocalChanges(false);
  }, [serverConfig]);

  // Clear all local config
  const clearLocalConfig = useCallback(() => {
    setLocalConfig({});
    setHasLocalChanges(Object.keys(serverConfig).length > 0);
    localStorage.removeItem(LOCAL_CONFIG_KEY);
  }, [serverConfig]);

  // Get the config that should be sent with problem statement
  const getConfigForProblemStatement = useCallback(() => {
    return localConfig;
  }, [localConfig]);

  return {
    config: localConfig, // Return local config as the main config
    serverConfig,
    isLoading,
    error,
    hasLocalChanges,
    fetchConfig,
    updateConfig,
    resetToServerConfig,
    clearLocalConfig,
    getConfigForProblemStatement
  };
};
