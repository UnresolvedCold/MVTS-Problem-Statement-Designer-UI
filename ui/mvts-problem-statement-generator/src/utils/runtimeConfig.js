// src/utils/runtimeConfig.js
// Utility to load runtime configuration from public/config.js

let runtimeConfig = null;
let configLoadPromise = null;

// Load runtime configuration from public/config.js
const loadRuntimeConfig = async () => {
  if (runtimeConfig) {
    return runtimeConfig;
  }

  if (configLoadPromise) {
    return configLoadPromise;
  }

  configLoadPromise = new Promise(async (resolve) => {
    try {
      // Try to load the runtime config file
      const response = await fetch('/config.js');
      if (response.ok) {
        const configText = await response.text();
        
        // Execute the config script to set window.MVTS_CONFIG
        const script = document.createElement('script');
        script.textContent = configText;
        document.head.appendChild(script);
        document.head.removeChild(script);
        
        runtimeConfig = window.MVTS_CONFIG || {};
        console.log('Runtime config loaded:', runtimeConfig);
      } else {
        console.warn('Runtime config file not found, using defaults');
        runtimeConfig = {};
      }
    } catch (error) {
      console.warn('Failed to load runtime config:', error);
      runtimeConfig = {};
    }
    
    resolve(runtimeConfig);
  });

  return configLoadPromise;
};

// Get configuration value with fallback priority:
// 1. Runtime config (from public/config.js)
// 2. Environment variable
// 3. Default value
const getConfigValue = (runtimePath, envKey, defaultValue) => {
  // Get value from runtime config
  const pathParts = runtimePath.split('.');
  let runtimeValue = runtimeConfig;
  
  for (const part of pathParts) {
    if (runtimeValue && typeof runtimeValue === 'object') {
      runtimeValue = runtimeValue[part];
    } else {
      runtimeValue = null;
      break;
    }
  }
  
  // Return in priority order
  if (runtimeValue !== null && runtimeValue !== undefined) {
    return runtimeValue;
  }
  
  if (envKey && process.env[envKey] !== undefined) {
    return process.env[envKey];
  }
  
  return defaultValue;
};

// Initialize runtime config (call this early in app lifecycle)
export const initRuntimeConfig = loadRuntimeConfig;

// Get WebSocket configuration
export const getWebSocketConfig = () => {
  if (!runtimeConfig) {
    throw new Error('Runtime config not loaded. Call initRuntimeConfig() first.');
  }
  
  return {
    DEFAULT_PORT: getConfigValue('websocket.port', 'REACT_APP_WEBSOCKET_PORT', 8191),
    DEFAULT_HOST: getConfigValue('websocket.host', 'REACT_APP_WEBSOCKET_HOST', null),
    DEFAULT_PROTOCOL: getConfigValue('websocket.protocol', 'REACT_APP_WEBSOCKET_PROTOCOL', null),
    ENDPOINT: getConfigValue('websocket.endpoint', null, '/ws'),
    TIMEOUT_MS: getConfigValue('websocket.timeout', null, 60000),
    USE_RELATIVE_URL: getConfigValue('websocket.useRelativeUrl', null, true)
  };
};

// Get REST API configuration
export const getRestApiConfig = () => {
  if (!runtimeConfig) {
    throw new Error('Runtime config not loaded. Call initRuntimeConfig() first.');
  }
  
  return {
    DEFAULT_PORT: getConfigValue('restApi.port', 'REACT_APP_REST_PORT', null),
    DEFAULT_HOST: getConfigValue('restApi.host', 'REACT_APP_REST_HOST', null),
    DEFAULT_PROTOCOL: getConfigValue('restApi.protocol', 'REACT_APP_REST_PROTOCOL', null),
    SCHEMAS_ENDPOINT: getConfigValue('restApi.schemasEndpoint', null, '/api/schemas'),
    USE_RELATIVE_URL: getConfigValue('restApi.useRelativeUrl', null, true)
  };
};

// Get Server configuration
export const getServerConfig = () => {
  if (!runtimeConfig) {
    throw new Error('Runtime config not loaded. Call initRuntimeConfig() first.');
  }
  
  return {
    DEFAULT_PORT: getConfigValue('server.port', 'REACT_APP_MVTS_PORT', null),
    DEFAULT_HOST: getConfigValue('server.host', 'REACT_APP_MVTS_HOST', null),
    DEFAULT_PROTOCOL: getConfigValue('server.protocol', 'REACT_APP_MVTS_PROTOCOL', null),
    CONFIG_ENDPOINT: getConfigValue('server.configEndpoint', null, '/api/config/default'),
    USE_RELATIVE_URL: getConfigValue('server.useRelativeUrl', null, true)
  };
};

// Get Grid configuration
export const getGridConfig = () => {
  if (!runtimeConfig) {
    throw new Error('Runtime config not loaded. Call initRuntimeConfig() first.');
  }
  
  return {
    DEFAULT_ROWS: getConfigValue('grid.defaultRows', null, 10),
    DEFAULT_COLS: getConfigValue('grid.defaultCols', null, 10),
    DEFAULT_CELL_SIZE: getConfigValue('grid.defaultCellSize', null, 50),
    OBJECT_SIZE: getConfigValue('grid.objectSize', null, 50),
    MIN_GRID_SIZE: getConfigValue('grid.minGridSize', null, 1),
    MAX_GRID_SIZE: getConfigValue('grid.maxGridSize', null, 1000),
    MIN_CELL_SIZE: getConfigValue('grid.minCellSize', null, 20),
    MAX_CELL_SIZE: getConfigValue('grid.maxCellSize', null, 200)
  };
};

// Get Local Storage configuration
export const getLocalStorageConfig = () => {
  if (!runtimeConfig) {
    throw new Error('Runtime config not loaded. Call initRuntimeConfig() first.');
  }
  
  return {
    CONFIG_KEY: getConfigValue('localStorage.configKey', null, 'mvts-local-config')
  };
};

// Export for debugging
export const getRuntimeConfig = () => runtimeConfig;
