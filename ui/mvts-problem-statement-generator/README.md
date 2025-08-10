# MVTS Problem Statement Generator

This is a React-based application for creating and managing Multi-Vehicle Task Scheduling (MVTS) problem statements. The application now features a **local-first architecture** with browser-based state management and server-side template provision and problem solving.

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
```bash
REACT_APP_WEBSOCKET_HOST=localhost
REACT_APP_WEBSOCKET_PORT=8089
REACT_APP_WEBSOCKET_PROTOCOL=ws
```

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
