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
import TemplateManager from "./components/TemplateManager";
import SolutionDisplay from "./components/SolutionDisplay";
import LoadingOverlay from "./components/LoadingOverlay";
import TabNavigation from "./components/TabNavigation";

const GridEditor = () => {
  // UI state
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [solutionData, setSolutionData] = useState(null);
  const [activeTab, setActiveTab] = useState('grid'); // 'grid', 'json', 'config'

  // Initialize managers
  const localStateManager = useLocalStateManager();
  const { localWarehouseData } = localStateManager;
  
  const schemaManager = useSchemaManager();
  const { 
    initializationError: schemaError,
    isLoading: schemasLoading,
    loadingMessage: schemaLoadingMessage
  } = schemaManager;

  const serverAPI = useServerAPI();
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

  // Event handlers
  const handlers = useGridEditorHandlers(
    objectManager,
    localStateManager,
    serverAPI,
    configManager,
    setSolutionData,
    setSelectedObject,
    cols,
    cellSize
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

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
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
        tabs={['grid', 'json', 'config']}
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
          objectManager={objectManager}
          handlers={handlers}
          filteredObjects={filteredObjects}
          
          // Managers
          localWarehouseData={localWarehouseData}
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
