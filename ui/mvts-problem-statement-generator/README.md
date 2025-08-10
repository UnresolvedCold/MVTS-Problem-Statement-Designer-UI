# MVTS Problem Statement Generator

This is a React-based application for creating and managing Multi-Vehicle Task Scheduling (MVTS) problem statements. The application now features a **local-first architecture** with browser-based state management and server-side template provision and problem solving.

> Highly vibe coded

## New Architecture (v2.0)

### Local-First Design
- **Local State Management**: All warehouse data, objects, and tasks are maintained in the browser
- **Persistent Storage**: Data is automatically saved to browser localStorage
- **Offline Capable**: Works offline after initial template loading
- **Server for Templates**: Server provides demo/template data for new entities
- **Server for Solving**: Only the final problem statement is sent to the server for solving

### Key Features
- 🏗️ **Local State Management**: Complete warehouse state maintained in browser
- 📁 **Import/Export**: Full JSON import/export capabilities
- 🔧 **Template System**: Server-provided templates for objects and tasks
- 🚀 **Problem Solving**: Send completed problems to server for solution
- 💾 **Auto-Save**: Automatic browser storage persistence
- 🎯 **Visual Grid Editor**: Interactive grid-based object placement
- 📊 **JSON Editor**: Direct problem statement editing
- 🔄 **Real-time Updates**: Immediate visual feedback for all changes

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

## How to Use

### 1. First Time Setup
1. Start the application with `npm start`
2. Click "🔧 Manage Templates" in the toolbar
3. Connect to the server to load templates (optional - defaults are available)
4. Start creating your warehouse layout

### 2. Creating Objects
- **Bots (Rangers)**: Click on the grid to place bots
- **PPS (Pick/Pack Stations)**: Right-click to add PPS
- **MSU (Mobile Storage Units)**: Shift+click to add MSU
- Each object uses templates from the server or built-in defaults

### 3. Managing Tasks
- Add tasks using the Tasks panel
- Configure task properties in the property editor
- Tasks are automatically linked to available objects

### 4. Editing Properties
- Select any object or task to edit its properties
- Changes are immediately saved to local storage
- Use the JSON editor for bulk modifications

### 5. Solving Problems
- Click "🚀 Solve Problem" to send the problem statement to the server
- View solutions in the popup modal
- Download or copy solutions for further analysis

### 6. Data Management
- **Export**: Save your work as JSON files
- **Import**: Load previously saved warehouse configurations
- **Clear**: Reset all data (with confirmation)

## Technical Architecture

### Frontend (React)
- **Local State**: `useLocalStateManager` hook for browser-based state
- **Server API**: `useServerAPI` hook for template and solving requests
- **Unified Management**: `useLocalObjectManager` handles all entities (objects, tasks, assignments)
- **Persistence**: Automatic localStorage integration

### Server Communication
- **Templates**: GET requests for object/task templates
- **Problem Solving**: POST problem statement for solution
- **Minimal Payloads**: Only necessary data exchanged
- **Error Handling**: Graceful fallbacks to default templates

### Data Flow
1. **Initialization**: Load templates from server (or use defaults)
2. **Creation**: Use templates to create local instances
3. **Management**: All CRUD operations happen locally
4. **Solving**: Send final problem statement to server
5. **Persistence**: Auto-save to browser storage

## Browser Storage

The application automatically saves your work to browser localStorage:
- **Key**: `mvts-warehouse-data`
- **Format**: Complete warehouse JSON structure
- **Persistence**: Survives browser restarts
- **Privacy**: Data stays on your device

## Server API Endpoints

Expected server endpoints for full functionality:

```
GET /templates/bot        - Bot template
GET /templates/pps        - PPS template  
GET /templates/msu        - MSU template
GET /templates/task       - Task template
GET /templates/problem    - Problem statement template
POST /solve               - Solve problem statement
```

## Development

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Dependencies
- **React 19**: Core framework
- **Konva & React-Konva**: Canvas-based grid rendering
- **WebSocket**: Real-time server communication

### Project Structure
```
src/
├── hooks/
│   ├── useLocalStateManager.js    # Local state management
│   ├── useServerAPI.js            # Server communication
│   └── useLocalObjectManager.js   # Unified object/task lifecycle
├── components/
│   ├── TemplateManager.js         # Template management UI
│   ├── SolutionDisplay.js         # Solution viewer
│   ├── Toolbar.js                 # Enhanced toolbar
│   └── ...                        # Other UI components
└── utils/
    └── constants.js                # Configuration constants
```

### Environment Variables

The application now supports **relative URLs** by default, which means it will automatically connect to APIs on the same server hosting the React app. This is ideal for production deployments.

For development or when connecting to external servers, you can override this behavior:

## Configuration

The application uses a **runtime configuration system** that allows you to modify settings after the application is built, without requiring a rebuild. This is perfect for deployment flexibility.

### Configuration Files

1. **Development**: Use `.env` file (copy from `.env.sample`)
2. **Production**: Modify `public/config.js` after build

### Runtime Configuration (`public/config.js`)

The application loads configuration at runtime from `public/config.js`. This allows you to modify settings after deployment:

```javascript
// public/config.js
window.MVTS_CONFIG = {
  // WebSocket Configuration
  websocket: {
    port: 8191,        // WebSocket server port
    host: null,        // null = same host as web app
    protocol: null,    // null = auto-detect (ws/wss)
    endpoint: '/ws',
    timeout: 60000,
    useRelativeUrl: true
  },
  
  // REST API Configuration
  restApi: {
    port: null,        // null = same port as web app
    host: null,        // null = same host as web app
    protocol: null,    // null = auto-detect (http/https)
    schemasEndpoint: '/api/schemas',
    useRelativeUrl: true
  }
};
```

### Current Setup (Same Host, Different Port)

Your current configuration is optimized for a single server hosting:
- **Web App**: Port determined by server (typically 8192)
- **WebSocket**: Port 8191 (different port, same host)
- **REST API**: Same port as web app (relative URLs)

### Environment Variables (.env for development)

```bash
# Copy .env.sample to .env for local development
cp .env.sample .env

# WebSocket Configuration
REACT_APP_WEBSOCKET_PORT=8191
# REACT_APP_WEBSOCKET_HOST=localhost  # Uncomment only if needed
# REACT_APP_WEBSOCKET_PROTOCOL=ws     # Uncomment only if needed
```

### Configuration Priority

1. **Runtime Config** (highest) - Values from `public/config.js`
2. **Environment Variables** - Values from `.env`
3. **Defaults** (lowest) - Fallback values in code

### Post-Build Configuration Changes

After building the app, you can modify the configuration without rebuilding:

```bash
# Build the app
npm run build

# Modify configuration for deployment
vi build/config.js

# Deploy - no rebuild needed!
```

### URL Construction Examples

Based on your current setup:

| Service | URL Pattern | Example |
|---------|-------------|---------|
| WebSocket | `wss://hostname:8191/ws` | `wss://myapp.com:8191/ws` |
| REST API | `https://hostname/api/schemas/bot` | `https://myapp.com/api/schemas/bot` |
| Config API | `https://hostname/api/config/default` | `https://myapp.com/api/config/default` |

### Testing Configuration

Use the test script to validate your configuration:

```bash
./test-config.sh
```

For detailed configuration options and examples, see [CONFIGURATION.md](./CONFIGURATION.md).

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
