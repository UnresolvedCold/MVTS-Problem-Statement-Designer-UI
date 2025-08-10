import { 
  getWebSocketConfig, 
  getRestApiConfig, 
  getServerConfig, 
  getLocalStorageConfig, 
  getGridConfig 
} from './runtimeConfig';

// Configuration getters that use runtime config when available
// These will fall back to static defaults if runtime config is not loaded
export const getWSConfig = () => {
  try {
    return getWebSocketConfig();
  } catch (error) {
    // Fallback to static config if runtime config not loaded
    return {
      DEFAULT_PORT: 8191,
      DEFAULT_HOST: null,  // null = same host as web app
      DEFAULT_PROTOCOL: null,  // null = auto-detect
      ENDPOINT: '/ws',
      TIMEOUT_MS: 60000,
      USE_RELATIVE_URL: true
    };
  }
};

export const getRestConfig = () => {
  try {
    return getRestApiConfig();
  } catch (error) {
    return {
      DEFAULT_PORT: null,  // null = same port as web app
      DEFAULT_HOST: null,  // null = same host as web app
      DEFAULT_PROTOCOL: null,  // null = auto-detect
      SCHEMAS_ENDPOINT: '/api/schemas',
      USE_RELATIVE_URL: true
    };
  }
};

export const getServerCfg = () => {
  try {
    return getServerConfig();
  } catch (error) {
    return {
      DEFAULT_PORT: null,  // null = same port as web app
      DEFAULT_HOST: null,  // null = same host as web app
      DEFAULT_PROTOCOL: null,  // null = auto-detect
      CONFIG_ENDPOINT: '/api/config/default',
      USE_RELATIVE_URL: true
    };
  }
};

export const getLocalStorageCfg = () => {
  try {
    return getLocalStorageConfig();
  } catch (error) {
    return {
      CONFIG_KEY: 'mvts-local-config'
    };
  }
};

export const getGridCfg = () => {
  try {
    return getGridConfig();
  } catch (error) {
    return {
      DEFAULT_ROWS: 10,
      DEFAULT_COLS: 10,
      DEFAULT_CELL_SIZE: 50,
      OBJECT_SIZE: 50,
      MIN_GRID_SIZE: 1,
      MAX_GRID_SIZE: 1000,
      MIN_CELL_SIZE: 20,
      MAX_CELL_SIZE: 200
    };
  }
};

// Legacy static exports for backward compatibility
export const WEBSOCKET_CONFIG = getWSConfig();
export const REST_API_CONFIG = getRestConfig();
export const SERVER_CONFIG = getServerCfg();
export const LOCAL_STORAGE_CONFIG = getLocalStorageCfg();
export const GRID_CONFIG = getGridCfg();

// Object types
export const OBJECT_TYPES = {
  BOT: 'bot',
  PPS: 'pps'
};

// WebSocket message types
export const WS_MESSAGE_TYPES = {
  GET_WAREHOUSE_DATA: 'GET_WAREHOUSE_DATA',
  WAREHOUSE_DATA_RESPONSE: 'WAREHOUSE_DATA_RESPONSE',
  UPDATE_WAREHOUSE_DATA: 'UPDATE_WAREHOUSE_DATA',
  WAREHOUSE_DATA_UPDATED: 'WAREHOUSE_DATA_UPDATED',
  UPDATE_SIZE: 'UPDATE_SIZE',
  SIZE_UPDATED: 'SIZE_UPDATED',
  ADD_BOT: 'ADD_BOT',
  ADD_PPS: 'ADD_PPS',
  REMOVE_OBJECT: 'REMOVE_OBJECT',
  CONNECTION_ESTABLISHED: 'CONNECTION_ESTABLISHED',
  ERROR: 'ERROR'
};

// Object images
export const OBJECT_IMAGES = {
  [OBJECT_TYPES.BOT]: '/bot.png',
  [OBJECT_TYPES.PPS]: '/pps.png'
};

// Grid colors
export const GRID_COLORS = {
  GRID_LINE: 'grey',
  COORDINATE_TEXT: 'lightgray',
  SELECTED_BORDER: '#007bff',
  BACKGROUND: '#f8f9fa'
};

// Validation helpers
export const validateGridSize = (value) => {
  const num = parseInt(value);
  return !isNaN(num) && num >= GRID_CONFIG.MIN_GRID_SIZE && num <= GRID_CONFIG.MAX_GRID_SIZE;
};

export const validateCellSize = (value) => {
  const num = parseInt(value);
  return !isNaN(num) && num >= GRID_CONFIG.MIN_CELL_SIZE && num <= GRID_CONFIG.MAX_CELL_SIZE;
};

// Position helpers
export const snapToGrid = (position, cellSize) => {
  return Math.floor(position / cellSize) * cellSize;
};

export const pixelToGrid = (pixelPos, cellSize) => {
  return Math.floor(pixelPos / cellSize);
};

export const gridToPixel = (gridPos, cellSize) => {
  return gridPos * cellSize;
};

// Object helpers
export const generateObjectId = (type, baseId) => {
  return `${type}-${baseId || Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
