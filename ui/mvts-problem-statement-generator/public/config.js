// Runtime Configuration
// This file can be modified after build to change configuration without rebuilding
// Values set here will override environment variables and defaults

window.MVTS_CONFIG = {
  // WebSocket Configuration
  websocket: {
    port: 8191,        // Set to override REACT_APP_WEBSOCKET_PORT
    host: null,        // Set to override REACT_APP_WEBSOCKET_HOST (null = same host)
    protocol: null,    // Set to override REACT_APP_WEBSOCKET_PROTOCOL (null = auto-detect)
    endpoint: '/ws',
    timeout: 60000,
    useRelativeUrl: true
  },

  // REST API Configuration
  restApi: {
    port: null,        // Set to override REACT_APP_REST_PORT (null = same port as web app)
    host: null,        // Set to override REACT_APP_REST_HOST (null = same host)
    protocol: null,    // Set to override REACT_APP_REST_PROTOCOL (null = auto-detect)
    schemasEndpoint: '/api/schemas',
    useRelativeUrl: true
  },

  // Server Configuration (for config management)
  server: {
    port: null,        // Set to override REACT_APP_MVTS_PORT (null = same port as web app)
    host: null,        // Set to override REACT_APP_MVTS_HOST (null = same host)
    protocol: null,    // Set to override REACT_APP_MVTS_PROTOCOL (null = auto-detect)
    configEndpoint: '/api/config/default',
    useRelativeUrl: true
  },

  // Grid Configuration
  grid: {
    defaultRows: 10,
    defaultCols: 10,
    defaultCellSize: 50,
    objectSize: 50,
    minGridSize: 1,
    maxGridSize: 1000,
    minCellSize: 20,
    maxCellSize: 200
  },

  // Local Storage Configuration
  localStorage: {
    configKey: 'mvts-local-config'
  }
};
