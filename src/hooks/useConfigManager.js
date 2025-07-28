import { useState, useCallback } from 'react';
import { MVTS_CONFIG } from '../utils/constants';

export const useConfigManager = () => {
  const [config, setConfig] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Use relative URLs since we have a proxy setup
  const getMvtsApiUrl = () => {
    return ''; // Empty string for relative URLs - proxy will handle routing
  };

  // Fetch all config
  const fetchConfig = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${getMvtsApiUrl()}/mvts/config/all`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setConfig(data);
    } catch (err) {
      console.error('Error fetching config:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update a specific config
  const updateConfig = useCallback(async (configName, value) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${getMvtsApiUrl()}/mvts/config/set`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [configName]: value
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Refresh config after update
      await fetchConfig();
      return true;
    } catch (err) {
      console.error('Error updating config:', err);
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchConfig]);

  return {
    config,
    isLoading,
    error,
    fetchConfig,
    updateConfig
  };
};
