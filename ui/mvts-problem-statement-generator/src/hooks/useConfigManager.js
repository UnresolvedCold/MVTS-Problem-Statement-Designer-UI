import { useState, useEffect, useCallback } from 'react';
import { getServerCfg, getLocalStorageCfg } from '../utils/constants';

export const useConfigManager = () => {
  // Initialize config from localStorage or empty object
  const [localConfig, setLocalConfig] = useState(() => {
    try {
      const LOCAL_STORAGE_CONFIG = getLocalStorageCfg();
      const saved = localStorage.getItem(LOCAL_STORAGE_CONFIG.CONFIG_KEY);
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
    const LOCAL_STORAGE_CONFIG = getLocalStorageCfg();
    localStorage.setItem(LOCAL_STORAGE_CONFIG.CONFIG_KEY, JSON.stringify(localConfig));
  }, [localConfig]);

  // Get server URL for direct API calls
  const getServerUrl = () => {
    // Get current server configuration
    const SERVER_CONFIG = getServerCfg();
    
    // Get host and port from runtime config with env fallbacks
    const configHost = SERVER_CONFIG.DEFAULT_HOST || process.env.REACT_APP_MVTS_HOST;
    const configPort = SERVER_CONFIG.DEFAULT_PORT || process.env.REACT_APP_MVTS_PORT;
    const configProtocol = SERVER_CONFIG.DEFAULT_PROTOCOL || process.env.REACT_APP_MVTS_PROTOCOL;
    
    // Check if we should use relative URL (when served from same server)
    const useRelativeUrl = !configHost && SERVER_CONFIG.USE_RELATIVE_URL;
    
    if (useRelativeUrl) {
      // Use relative URL - empty string means same origin
      console.log('Using relative server URL (same origin)');
      return '';
    } else {
      // Use explicit host/port configuration
      const port = configPort;
      const host = configHost;
      const protocol = configProtocol || (window.location.protocol === 'https:' ? 'https' : 'http');
      console.log(`Using server URL: ${protocol}://${host}:${port}`);
      return `${protocol}://${host}:${port}`;
    }
  };

  // Fetch config from server and merge with local
  const fetchConfig = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const SERVER_CONFIG = getServerCfg();
      const response = await fetch(`${getServerUrl()}${SERVER_CONFIG.CONFIG_ENDPOINT}`);
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
    const LOCAL_STORAGE_CONFIG = getLocalStorageCfg();
    setLocalConfig({});
    setHasLocalChanges(Object.keys(serverConfig).length > 0);
    localStorage.removeItem(LOCAL_STORAGE_CONFIG.CONFIG_KEY);
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
