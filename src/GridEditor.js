import React, { useState, useEffect } from "react";
import { useLocalStateManager } from "./hooks/useLocalStateManager";
import { useServerAPI } from "./hooks/useServerAPI";
import { useSchemaManager } from "./hooks/useSchemaManager";
import { useLocalObjectManager } from "./hooks/useLocalObjectManager";
import { useLocalTaskManager } from "./hooks/useLocalTaskManager";
import Toolbar from "./components/Toolbar";
import GridCanvas from "./components/GridCanvas";
import ObjectsList from "./components/ObjectsList";
import TasksList from "./components/TasksList";
import PropertyEditor from "./components/PropertyEditor";
import TaskPropertyEditor from "./components/TaskPropertyEditor";
import ProblemStatementViewer from "./components/ProblemStatementViewer";
import TemplateManager from "./components/TemplateManager";
import SolutionDisplay from "./components/SolutionDisplay";
import { GRID_CONFIG } from "./utils/constants";

const GridEditor = ({ onNavigateToConfig }) => {
  // Grid settings
  const [rows, setRows] = useState(GRID_CONFIG.DEFAULT_ROWS);
  const [cols, setCols] = useState(GRID_CONFIG.DEFAULT_COLS);
  const [cellSize, setCellSize] = useState(GRID_CONFIG.DEFAULT_CELL_SIZE);
  
  // UI state
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [solutionData, setSolutionData] = useState(null);
  const [activeTab, setActiveTab] = useState('grid');

  // Initialize local state manager
  const localStateManager = useLocalStateManager();
  const { localWarehouseData, updateGridSizeInLocal } = localStateManager;

  // Initialize schema manager for client-side schemas
  const schemaManager = useSchemaManager();
  const { 
    initializationError: schemaError,
    isLoading: schemasLoading,
    loadingMessage: schemaLoadingMessage
  } = schemaManager;

  // Initialize server API (only for problem solving)
  const serverAPI = useServerAPI();
  const { solveProblemStatement } = serverAPI;

  // Initialize object management with local state and schema manager
  const objectManager = useLocalObjectManager(cellSize, localStateManager, schemaManager);
  const {
    objects,
    selectedObject,
    setSelectedObject,
    addObject,
    removeObject,
    updateObjectPosition,
    updateObjectProperties,
    loadObjectsFromWarehouse
  } = objectManager;

  // Initialize task management with local state
  const taskManager = useLocalTaskManager(localStateManager, schemaManager);
  const {
    tasks,
    selectedTask,
    setSelectedTask,
    addTask,
    removeTask,
    updateTaskProperties,
    loadTasksFromWarehouse
  } = taskManager;

  // Load objects and tasks when local warehouse data changes
  useEffect(() => {
    if (localWarehouseData) {
      // Update grid dimensions from local data
      if (localWarehouseData.warehouse.width && localWarehouseData.warehouse.height) {
        setCols(localWarehouseData.warehouse.width);
        setRows(localWarehouseData.warehouse.height);
      }
      
      // Load objects and tasks
      loadObjectsFromWarehouse(localWarehouseData);
      loadTasksFromWarehouse(localWarehouseData);
    }
  }, [localWarehouseData, loadObjectsFromWarehouse, loadTasksFromWarehouse]);

  // Handle task selection (clear object selection)
  const handleTaskSelect = (task) => {
    setSelectedTask(task);
    setSelectedObject(null);
  };

  // Handle object selection (clear task selection)
  const handleObjectSelect = (obj) => {
    setSelectedObject(obj);
    setSelectedTask(null);
  };

  // Handle object adding from ObjectsList (default position)
  const handleAddObjectFromList = (type) => {
    // Add object at default position (center of grid)
    const defaultX = Math.floor(cols / 2) * cellSize;
    const defaultY = Math.floor(rows / 2) * cellSize;
    addObject(type, defaultX, defaultY);
  };

    // Handle grid size changes - no restrictions, make scrollable
  const handleRowsChange = (newRows) => {
    if (newRows <= 0) {
      alert('Rows must be greater than 0');
      return;
    }
    setRows(newRows);
    updateGridSizeInLocal(cols, newRows);
  };

  const handleColsChange = (newCols) => {
    if (newCols <= 0) {
      alert('Columns must be greater than 0');
      return;
    }
    setCols(newCols);
    updateGridSizeInLocal(newCols, rows);
  };

  // Handle problem statement save
  const handleJsonSave = (updatedProblemStatement) => {
    if (!localWarehouseData || !localWarehouseData.warehouse) {
      alert('No warehouse data available to update.');
      return;
    }

    // Update local state
    localStateManager.updateProblemStatementInLocal(updatedProblemStatement);
    
    console.log('Problem statement updated in local state');
  };

  // Handle solve problem
  const handleSolveProblem = async () => {
    if (!localWarehouseData || !localWarehouseData.warehouse.problem_statement) {
      alert('No problem statement to solve. Please create some objects and tasks first.');
      return;
    }

    try {
      console.log('Sending problem statement to server for solving...');
      const solution = await solveProblemStatement(localWarehouseData.warehouse.problem_statement);
      console.log('Received solution from server:', solution);
      setSolutionData(solution);
    } catch (error) {
      console.error('Failed to solve problem statement:', error);
      alert(`Failed to solve problem statement: ${error.message}`);
    }
  };

  // Handler to add a new assignment to the selected PPS
  const handleAddAssignment = (assignmentData) => {
    try {
      console.log('Creating assignment with data:', assignmentData);
      
      if (!localWarehouseData || !localWarehouseData.warehouse.problem_statement) {
        alert('No problem statement data available!');
        return;
      }

      const problemStatement = localWarehouseData.warehouse.problem_statement;
      
      // Find the PPS by ID
      const targetPPS = problemStatement.pps_list.find(p => p.id === parseInt(assignmentData.pps_id));
      if (!targetPPS) {
        alert('PPS not found!');
        return;
      }

      // Find bot and MSU by IDs
      const targetBot = problemStatement.ranger_list.find(b => b.id === parseInt(assignmentData.bot_id));
      const targetMSU = problemStatement.transport_entity_list.find(m => m.id === parseInt(assignmentData.msu_id));
      
      if (!targetBot) {
        alert('Bot not found!');
        return;
      }
      
      if (!targetMSU) {
        alert('MSU not found!');
        return;
      }

      // Create the assignment object
      const assignment = {
        task_id: assignmentData.task_id,
        bot_id: parseInt(assignmentData.bot_id),
        msu_id: parseInt(assignmentData.msu_id)
      };

      // Add to PPS current_schedule.assignments
      if (!targetPPS.current_schedule) {
        targetPPS.current_schedule = { assignments: [] };
      }
      if (!targetPPS.current_schedule.assignments) {
        targetPPS.current_schedule.assignments = [];
      }

      targetPPS.current_schedule.assignments.push(assignment);
      
      // Update the problem statement
      const updatedProblemStatement = {
        ...problemStatement,
        pps_list: problemStatement.pps_list.map(p => 
          p.id === targetPPS.id ? targetPPS : p
        )
      };

      // Save to local state
      localStateManager.updateProblemStatementInLocal(updatedProblemStatement);
      console.log('Assignment added to PPS:', targetPPS.id, assignment);
      
    } catch (error) {
      console.error('Error adding assignment:', error);
      alert('Failed to add assignment. Please check the console for details.');
    }
  };

  // Handle clear data
  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      localStateManager.clearLocalData();
      setSelectedObject(null);
      setSelectedTask(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Loading Overlay */}
      {(schemasLoading) && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          color: 'white',
          fontSize: '18px'
        }}>
          <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div>🔄 {schemaLoadingMessage || 'Loading schemas...'}</div>
          </div>
        </div>
      )}

      {/* Schema Error Notification */}
      {schemaError && !schemasLoading && (
        <div style={{
          padding: '10px',
          backgroundColor: '#fff3cd',
          borderLeft: '4px solid #ffc107',
          color: '#856404',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>⚠️</span>
          <div>
            <strong>Schema Loading Warning:</strong> {schemaError}
            <br />
            <small>Using default schemas. You can still create objects, but they may not match server expectations.</small>
          </div>
          <button
            onClick={() => schemaManager.refreshSchemas()}
            style={{
              marginLeft: 'auto',
              padding: '5px 10px',
              backgroundColor: '#ffc107',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Retry
          </button>
        </div>
      )}

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
            fontWeight: activeTab === 'grid' ? "bold" : "normal"
          }}
        >
          🎯 Grid Editor
        </button>
        <button
          onClick={() => setActiveTab('json')}
          style={{
            padding: "10px 20px",
            border: "none",
            borderBottom: activeTab === 'json' ? "3px solid #007bff" : "3px solid transparent",
            backgroundColor: "transparent",
            cursor: "pointer",
            fontWeight: activeTab === 'json' ? "bold" : "normal"
          }}
        >
          📄 JSON Viewer
        </button>
        <div style={{ flex: 1 }}></div>
        <button
          onClick={onNavigateToConfig}
          style={{
            padding: "10px 20px",
            border: "none",
            backgroundColor: "transparent",
            cursor: "pointer",
            color: "#007bff"
          }}
        >
          ⚙️ Config
        </button>
      </div>

      {/* Main Content */}
      {activeTab === 'grid' ? (
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Left Toolbar */}
          <Toolbar
            rows={rows}
            cols={cols}
            cellSize={cellSize}
            onRowsChange={handleRowsChange}
            onColsChange={handleColsChange}
            onCellSizeChange={setCellSize}
            onManageTemplates={() => setShowTemplateManager(true)}
            onSolveProblem={handleSolveProblem}
            onClearData={handleClearData}
            serverAPI={serverAPI}
          />

          {/* Grid Canvas */}
          <div style={{ 
            flex: 1, 
            overflow: "auto", 
            position: "relative",
            backgroundColor: "#fff",
            border: "1px solid #ccc"
          }}>
            <GridCanvas
              rows={rows}
              cols={cols}
              cellSize={cellSize}
              objects={objects}
              selectedObject={selectedObject}
              onObjectClick={handleObjectSelect}
              onObjectDragStart={(obj) => {
                // Optional: Handle drag start if needed
                console.log('Drag started for:', obj);
              }}
              onObjectDragEnd={updateObjectPosition}
            />
          </div>

          {/* Right Sidebar */}
          <div style={{
            width: 300,
            borderLeft: "1px solid #ccc",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}>
            {/* Objects List */}
            <div style={{ flex: 1, overflow: "auto", borderBottom: "1px solid #ccc" }}>
              <ObjectsList
                objects={objects}
                onObjectSelect={handleObjectSelect}
                onRemoveObject={removeObject}
                onAddObject={handleAddObjectFromList}
                selectedObject={selectedObject}
                cellSize={cellSize}
              />
            </div>

            {/* Tasks List */}
            <div style={{ flex: 1, overflow: "auto", borderBottom: "1px solid #ccc" }}>
              <TasksList
                tasks={tasks}
                onSelectTask={handleTaskSelect}
                onAddTask={addTask}
                onRemoveTask={removeTask}
                onAddAssignment={handleAddAssignment}
                onSolveProblem={handleSolveProblem}
                selectedTask={selectedTask}
                availablePPS={objects.filter(obj => obj.type === 'pps').map(obj => ({
                  id: obj.properties?.id || obj.id,
                  ...obj.properties
                }))}
                availableMSU={objects.filter(obj => obj.type === 'msu').map(obj => ({
                  id: obj.properties?.id || obj.id,
                  ...obj.properties
                }))}
                availableBots={objects.filter(obj => obj.type === 'bot').map(obj => ({
                  id: obj.properties?.id || obj.id,
                  ...obj.properties
                }))}
              />
            </div>

            {/* Property Editor */}
            <div style={{ height: 300, overflow: "auto" }}>
              {selectedObject ? (
                <PropertyEditor
                  selectedObject={selectedObject}
                  onPropertiesChange={(props) => updateObjectProperties(selectedObject.id, props)}
                />
              ) : selectedTask ? (
                <TaskPropertyEditor
                  selectedTask={selectedTask}
                  onUpdateProperties={(props) => updateTaskProperties(selectedTask.task_key || selectedTask.id, props)}
                />
              ) : (
                <div style={{ padding: 20, textAlign: "center", color: "#666" }}>
                  Select an object or task to edit properties
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* JSON Viewer Tab */
        <ProblemStatementViewer
          warehouseData={localWarehouseData}
          onClose={() => setActiveTab('grid')}
          onSave={handleJsonSave}
        />
      )}

      {/* Template Manager Modal */}
      {showTemplateManager && (
        <TemplateManager
          schemaManager={schemaManager}
          localStateManager={localStateManager}
          onClose={() => setShowTemplateManager(false)}
        />
      )}

      {/* Solution Display Modal */}
      {solutionData && (
        <SolutionDisplay
          solutionData={solutionData}
          onClose={() => setSolutionData(null)}
        />
      )}
    </div>
  );
};

export default GridEditor;
