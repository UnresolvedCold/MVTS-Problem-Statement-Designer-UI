# Runtime Configuration Guide

This application supports runtime configuration that can be modified after the application is built, without requiring a rebuild or redeploy.

## Configuration Files

### 1. Environment Variables (Development)
For development, you can use environment variables by creating a `.env` file based on `.env.sample`:

```bash
cp .env.sample .env
```

### 2. Runtime Configuration (Production)
For production deployments, you can modify `public/config.js` after the application is built. This file will be served statically and loaded at runtime.

**Location**: `public/config.js`

## Configuration Structure

### WebSocket Configuration
```javascript
websocket: {
  port: 8191,        // WebSocket server port (required when different from web app)
  host: null,        // Use null for same host as web app, or specify explicit host
  protocol: null,    // Use null for auto-detect (ws/wss based on page protocol)
  endpoint: '/ws',   // WebSocket endpoint path
  timeout: 60000,    // Connection timeout in milliseconds
  useRelativeUrl: true // Enable relative URL construction
}
```

### REST API Configuration
```javascript
restApi: {
  port: null,        // Use null for same port as web app, or specify explicit port
  host: null,        // Use null for same host as web app, or specify explicit host
  protocol: null,    // Use null for auto-detect (http/https based on page protocol)
  schemasEndpoint: '/api/schemas', // API endpoint for schemas
  useRelativeUrl: true // Enable relative URL construction
}
```

### Server Configuration
```javascript
server: {
  port: null,        // Use null for same port as web app, or specify explicit port
  host: null,        // Use null for same host as web app, or specify explicit host
  protocol: null,    // Use null for auto-detect (http/https based on page protocol)
  configEndpoint: '/api/config/default', // API endpoint for config
  useRelativeUrl: true // Enable relative URL construction
}
```

## Configuration Priority

The configuration system follows this priority order:

1. **Runtime Configuration** (highest priority) - Values from `public/config.js`
2. **Environment Variables** - Values from `.env` file or environment
3. **Default Values** (lowest priority) - Fallback defaults in the code

## Use Cases

### Same Host, Different Port (Current Setup)
When the server hosts both the web app and WebSocket/API on different ports:

```javascript
// public/config.js
window.MVTS_CONFIG = {
  websocket: {
    port: 8191,     // WebSocket on port 8191
    host: null,     // Same host as web app
    // ... other settings
  },
  restApi: {
    port: null,     // Same port as web app (8192)
    host: null,     // Same host as web app
    // ... other settings
  }
}
```

### Different Host/Server
When connecting to a completely different server:

```javascript
// public/config.js
window.MVTS_CONFIG = {
  websocket: {
    port: 8191,
    host: 'api.example.com',  // Different host
    protocol: 'wss',          // Explicit protocol
    useRelativeUrl: false     // Disable relative URLs
  },
  restApi: {
    port: 8080,
    host: 'api.example.com',  // Different host
    protocol: 'https',        // Explicit protocol
    useRelativeUrl: false     // Disable relative URLs
  }
}
```

### Development with Environment Variables
For local development, you can use `.env`:

```bash
# .env
REACT_APP_WEBSOCKET_PORT=8191
REACT_APP_REST_PORT=8080
REACT_APP_REST_HOST=localhost
```

## After Build Configuration

### 1. Build the Application
```bash
npm run build
```

### 2. Modify Configuration
After building, you can modify the configuration without rebuilding:

```bash
# Edit the built application's config
vi build/config.js
```

### 3. Deploy
The modified configuration will be loaded at runtime when the application starts.

## URL Construction Logic

The application constructs URLs based on the configuration:

### WebSocket URL
```javascript
if (!host) {
  // Same host, potentially different port
  if (port) {
    socketUrl = `${protocol}://${window.location.hostname}:${port}${endpoint}`;
  } else {
    // Same host, same port
    socketUrl = `${protocol}://${window.location.host}${endpoint}`;
  }
} else {
  // Different host
  socketUrl = `${protocol}://${host}:${port}${endpoint}`;
}
```

### REST API URL
```javascript
if (useRelativeUrl && !host) {
  // Relative URL - same origin
  url = `${endpoint}/${path}`;
} else {
  // Absolute URL
  url = `${protocol}://${host}:${port}${endpoint}/${path}`;
}
```

## Protocol Auto-Detection

When `protocol` is set to `null`, the application automatically detects the protocol:

- **WebSocket**: `https:` → `wss:`, `http:` → `ws:`
- **HTTP**: `https:` → `https:`, `http:` → `http:`

This ensures secure connections when the web app is served over HTTPS.

## Debugging

To debug configuration issues:

1. Check the browser console for configuration loading messages
2. Inspect `window.MVTS_CONFIG` in browser developer tools
3. Check network tab for connection attempts and URLs being used

## Examples

### Example 1: Production Deployment (Same Server)
```javascript
// build/config.js - Server hosts everything
window.MVTS_CONFIG = {
  websocket: { port: 8191, host: null, protocol: null },
  restApi: { port: null, host: null, protocol: null },
  server: { port: null, host: null, protocol: null }
};
```

### Example 2: Microservices Architecture
```javascript
// build/config.js - Different services
window.MVTS_CONFIG = {
  websocket: { 
    port: 8191, 
    host: 'ws.mycompany.com', 
    protocol: 'wss',
    useRelativeUrl: false 
  },
  restApi: { 
    port: 443, 
    host: 'api.mycompany.com', 
    protocol: 'https',
    useRelativeUrl: false 
  }
};
```

### Example 3: Local Development Override
```javascript
// public/config.js - Override for local development
window.MVTS_CONFIG = {
  websocket: { port: 8191, host: 'localhost', protocol: 'ws' },
  restApi: { port: 8080, host: 'localhost', protocol: 'http' }
};
```
