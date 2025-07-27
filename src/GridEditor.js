import React, { useState } from "react";
import useWebSocket from "./hooks/useWebSocket";
import { useObjectManager } from "./hooks/useObjectManager";
import { useTaskManager } from "./hooks/useTaskManager";
import { useWarehouseData } from "./hooks/useWarehouseData";
import Toolbar from "./components/Toolbar";
import GridCanvas from "./components/GridCanvas";
import ObjectsList from "./components/ObjectsList";
import TasksList from "./components/TasksList";
import PropertyEditor from "./components/PropertyEditor";
import TaskPropertyEditor from "./components/TaskPropertyEditor";
import ProblemStatementViewer from "./components/ProblemStatementViewer";
import { GRID_CONFIG } from "./utils/constants";

const GridEditor = () => {
  // Grid settings
  const [rows, setRows] = useState(GRID_CONFIG.DEFAULT_ROWS);
  const [cols, setCols] = useState(GRID_CONFIG.DEFAULT_COLS);
  const [cellSize, setCellSize] = useState(GRID_CONFIG.DEFAULT_CELL_SIZE);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  // Tab state
  const [activeTab, setActiveTab] = useState('grid'); // 'grid' or 'json'

  // WebSocket message handler
  const handleWebSocketMessage = (data) => {
    console.log('Received WebSocket message:', data);
    
    if (data.type === 'WAREHOUSE_DATA_RESPONSE' && data.warehouse) {
      setLoadingMessage('Loading warehouse data...');
      setWarehouseData(data);
      
      // Update grid dimensions if provided
      if (data.warehouse.width && data.warehouse.height) {
        setCols(data.warehouse.width);
        setRows(data.warehouse.height);
      }
      
      // Load objects from warehouse data
      loadObjectsFromWarehouse(data);
      loadTasksFromWarehouse(data);
      setIsLoading(false);
      setLoadingMessage('');
    } else if (data.type === 'WAREHOUSE_DATA_UPDATED') {
      console.log('Warehouse data updated successfully');
      
      // Server sends the updated warehouse data, reload objects
      if (data.warehouse) {
        setLoadingMessage('Updating warehouse data...');
        setWarehouseData(data);
        loadObjectsFromWarehouse(data);
        loadTasksFromWarehouse(data);
        setIsLoading(false);
        setLoadingMessage('');
      }
    } else if (data.type === 'CONNECTION_ESTABLISHED') {
      console.log('WebSocket connection established');
      setIsLoading(false);
      setLoadingMessage('');
    } else if (data.type === 'ERROR') {
      console.error('Server error:', data.message);
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  // Initialize WebSocket connection
  const { sendMessage } = useWebSocket(handleWebSocketMessage);
  
  // Initialize warehouse data management
  const { warehouseData, setWarehouseData, sendWarehouseUpdate } = useWarehouseData(sendMessage);
  
  // Initialize object management
  const {
    objects,
    selectedObject,
    setSelectedObject,
    addObject,
    removeObject,
    updateObjectPosition,
    updateObjectProperties,
    loadObjectsFromWarehouse
  } = useObjectManager(cellSize, sendWarehouseUpdate, { setIsLoading, setLoadingMessage });

  // Initialize task management
  const {
    tasks,
    selectedTask,
    setSelectedTask,
    addTask,
    removeTask,
    updateTaskProperties,
    loadTasksFromWarehouse
  } = useTaskManager(sendWarehouseUpdate, { setIsLoading, setLoadingMessage });

  // Handle task selection (clear object selection)
  const handleTaskSelect = (task) => {
    setSelectedTask(task);
    setSelectedObject(null);
  };

  // Handle object selection (clear task selection)
  const handleObjectSelect = (object) => {
    setSelectedObject(object);
    setSelectedTask(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Tab Navigation */}
      <div style={{
        display: "flex",
        borderBottom: "1px solid #ccc",
        backgroundColor: "#f8f9fa",
        padding: "0 10px"
      }}>
        <button
          onClick={() => setActiveTab('grid')}
          style={{
            padding: "10px 20px",
            border: "none",
            borderBottom: activeTab === 'grid' ? "3px solid #007bff" : "3px solid transparent",
            backgroundColor: "transparent",
            cursor: "pointer",
            fontWeight: activeTab === 'grid' ? "bold" : "normal",
            color: activeTab === 'grid' ? "#007bff" : "#666"
          }}
        >
          🏗️ Grid Editor
        </button>
        <button
          onClick={() => setActiveTab('json')}
          style={{
            padding: "10px 20px",
            border: "none",
            borderBottom: activeTab === 'json' ? "3px solid #007bff" : "3px solid transparent",
            backgroundColor: "transparent",
            cursor: "pointer",
            fontWeight: activeTab === 'json' ? "bold" : "normal",
            color: activeTab === 'json' ? "#007bff" : "#666"
          }}
        >
          📄 Problem Statement JSON
        </button>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          color: "white",
          fontSize: "18px",
          fontWeight: "bold"
        }}>
          <div style={{
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            padding: "20px",
            borderRadius: "8px",
            textAlign: "center"
          }}>
            <div>⏳ {loadingMessage || 'Loading...'}</div>
            <div style={{ fontSize: "14px", marginTop: "10px", fontWeight: "normal" }}>
              Please wait while the operation completes...
            </div>
          </div>
        </div>
      )}
      
      {/* Tab Content */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        {activeTab === 'grid' ? (
          // Grid Editor View
          <div style={{ display: "flex", height: "100%" }}>
            <Toolbar
              rows={rows}
              cols={cols}
              cellSize={cellSize}
              onRowsChange={setRows}
              onColsChange={setCols}
              onCellSizeChange={setCellSize}
            />

            <GridCanvas
              rows={rows}
              cols={cols}
              cellSize={cellSize}
              objects={objects}
              selectedObject={selectedObject}
              onObjectClick={handleObjectSelect}
              onObjectDragEnd={updateObjectPosition}
            />

            <TasksList
              tasks={tasks}
              selectedTask={selectedTask}
              onSelectTask={handleTaskSelect}
              onRemoveTask={removeTask}
              onAddTask={addTask}
              availablePPS={objects.filter(obj => obj.type === 'pps').map(obj => obj.properties)}
              availableMSU={objects.filter(obj => obj.type === 'msu').map(obj => obj.properties)}
            />

            <ObjectsList
              objects={objects}
              selectedObject={selectedObject}
              onSelectObject={handleObjectSelect}
              onRemoveObject={removeObject}
              onAddObject={addObject}
              cellSize={cellSize}
            />

            {selectedTask ? (
              <TaskPropertyEditor
                selectedTask={selectedTask}
                onUpdateProperties={updateTaskProperties}
                onClose={() => {
                  setSelectedTask(null);
                  setSelectedObject(null);
                }}
                availablePPS={objects.filter(obj => obj.type === 'pps').map(obj => obj.properties)}
                availableMSU={objects.filter(obj => obj.type === 'msu').map(obj => obj.properties)}
              />
            ) : (
              <PropertyEditor
                selectedObject={selectedObject}
                onUpdateProperties={updateObjectProperties}
                onClose={() => {
                  setSelectedObject(null);
                  setSelectedTask(null);
                }}
              />
            )}
          </div>
        ) : (
          // JSON Viewer
          <ProblemStatementViewer
            warehouseData={warehouseData}
            onClose={() => setActiveTab('grid')}
          />
        )}
      </div>
    </div>
  );
};

export default GridEditor;
