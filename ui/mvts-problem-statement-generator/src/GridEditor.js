import React, { useState, useEffect } from "react";
import { useLocalStateManager } from "./hooks/useLocalStateManager";
import { useServerAPI } from "./hooks/useServerAPI";
import { useSchemaManager } from "./hooks/useSchemaManager";
import { useLocalObjectManager } from "./hooks/useLocalObjectManager";
import { useConfigManager } from "./hooks/useConfigManager";
import { useGridState } from "./hooks/useGridState";
import { useObjectFilters } from "./hooks/useObjectFilters";
import { useGridEditorHandlers } from "./hooks/useGridEditorHandlers";
import GridView from "./components/GridView";
import ConfigPanel from "./components/ConfigPanel";
import ProblemStatementViewer from "./components/ProblemStatementViewer";
import SolutionPage from "./components/SolutionPage";
import TemplateManager from "./components/TemplateManager";
import LoadingOverlay from "./components/LoadingOverlay";
import TabNavigation from "./components/TabNavigation";
import ClearStorageButton from "./components/ClearStorageButton";

const GridEditor = () => {
  // UI state
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [solutionData, setSolutionData] = useState(null);
  const [activeTab, setActiveTab] = useState('grid'); // 'grid', 'json', 'config'

  // Initialize managers
  const schemaManager = useSchemaManager();
  const localStateManager = useLocalStateManager(schemaManager);
  const { localWarehouseData } = localStateManager;
  const {
    initializationError: schemaError,
    isLoading: schemasLoading,
    loadingMessage: schemaLoadingMessage
  } = schemaManager;

  const serverAPI = useServerAPI();
  const { logs, isStreaming, clearLogs } = serverAPI;
  const configManager = useConfigManager();

  // Grid state management
  const gridState = useGridState(localStateManager);
  const { rows, cols, cellSize, setCellSize, handleRowsChange, handleColsChange, setRows, setCols } = gridState;

  // Object management
  const objectManager = useLocalObjectManager(cellSize, localStateManager, schemaManager);
  const {
    objects,
    selectedObject,
    setSelectedObject,
    loadObjectsFromWarehouse
  } = objectManager;

  // Object filtering
  const filteredObjects = useObjectFilters(objects);
  const { tasks, visualObjects } = filteredObjects;
  
  // Selected object helpers
  const selectedTask = selectedObject?.type === 'task' ? selectedObject : null;
  const selectedAssignment = selectedObject?.type === 'assignment' ? selectedObject : null;

  // Event handlers
  const handlers = useGridEditorHandlers(
    objectManager,
    localStateManager,
    serverAPI,
    configManager,
    setSolutionData,
    setSelectedObject,
    cols,
    cellSize,
    setActiveTab,  // Add setActiveTab to switch to solution tab
    schemaManager  // Add schemaManager for accessing server schemas
  );

  // Load objects and tasks when local warehouse data changes
  useEffect(() => {
    if (localWarehouseData) {
      // Update grid dimensions from local data
      if (localWarehouseData.warehouse.width && localWarehouseData.warehouse.height) {
        setCols(localWarehouseData.warehouse.width);
        setRows(localWarehouseData.warehouse.height);
      }
      
      // Load objects and tasks (unified)
      loadObjectsFromWarehouse(localWarehouseData);
    }
  }, [localWarehouseData, loadObjectsFromWarehouse, setCols, setRows]);

  // Handler for clearing solution data
  const handleClearSolution = () => {
    setSolutionData(null);
    clearLogs();
    if (activeTab === 'solution') {
      setActiveTab('grid');
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Loading Overlay */}
      <LoadingOverlay 
        isLoading={schemasLoading}
        message={schemaLoadingMessage}
        error={schemaError}
        onRetry={() => schemaManager.refreshSchemas()}
      />

      {/* Tab Navigation */}
      <TabNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={[
          'grid', 
          'json', 
          'config', 
          ...(solutionData || logs.length > 0 || isStreaming ? ['solution'] : [])
        ]}
      />

      {/* Main Content */}
      {activeTab === 'grid' ? (
        <GridView
          // Grid state
          rows={rows}
          cols={cols}
          cellSize={cellSize}
          onRowsChange={handleRowsChange}
          onColsChange={handleColsChange}
          onCellSizeChange={setCellSize}
          
          // Objects and handlers
          visualObjects={visualObjects}
          tasks={tasks}
          selectedObject={selectedObject}
          selectedTask={selectedTask}
          selectedAssignment={selectedAssignment}
          objectManager={objectManager}
          handlers={handlers}
          filteredObjects={filteredObjects}
          
          // Managers
          localWarehouseData={localWarehouseData}
          localStateManager={localStateManager}
          serverAPI={serverAPI}
          
          // UI actions
          onManageTemplates={() => setShowTemplateManager(true)}
          onSolveProblem={() => handlers.handleSolveProblem(localWarehouseData)}
          onClearData={handlers.handleClearData}
        />
      ) : activeTab === 'json' ? (
        <ProblemStatementViewer
          warehouseData={localWarehouseData}
          onClose={() => setActiveTab('grid')}
          onSave={handlers.handleJsonSave}
        />
      ) : activeTab === 'solution' ? (
        <SolutionPage
          solutionData={solutionData}
          logs={logs}
          isStreaming={isStreaming}
          onClearLogs={clearLogs}
          onClear={handleClearSolution}
          onAssignToProblem={handlers.handleAssignSolutionToProblem}
        />
      ) : (
        <ConfigPanel configManager={configManager} />
      )}

      {/* Modals */}
      {showTemplateManager && (
        <TemplateManager
          schemaManager={schemaManager}
          localStateManager={localStateManager}
          onClose={() => setShowTemplateManager(false)}
        />
      )}

      {/* Clear Storage Button - for development/debugging */}
      <ClearStorageButton />
    </div>
  );
};

export default GridEditor;
