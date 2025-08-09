// WebSocket configuration
export const WEBSOCKET_CONFIG = {
  DEFAULT_PORT: 8089,
  DEFAULT_HOST: 'localhost',
  DEFAULT_PROTOCOL: 'ws',
  ENDPOINT: '/ws',
  TIMEOUT_MS: 60000 
};

// REST API configuration for schemas
export const REST_API_CONFIG = {
  DEFAULT_PORT: 8089,
  DEFAULT_HOST: 'localhost',
  DEFAULT_PROTOCOL: 'http',
  SCHEMAS_ENDPOINT: '/api/schemas'
};

// MVTS API configuration
export const MVTS_CONFIG = {
  DEFAULT_PORT: 8080,
  DEFAULT_HOST: 'localhost',
  DEFAULT_PROTOCOL: 'http',
  CONFIG_ENDPOINT: '/mvts/config'
};

// Grid configuration
export const GRID_CONFIG = {
  DEFAULT_ROWS: 10,
  DEFAULT_COLS: 10,
  DEFAULT_CELL_SIZE: 50,
  OBJECT_SIZE: 50,
  MIN_GRID_SIZE: 1,
  MAX_GRID_SIZE: 1000, // Increased from 50 to allow much larger grids
  MIN_CELL_SIZE: 20,
  MAX_CELL_SIZE: 200  // Increased from 100 to allow larger cell sizes
};

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
