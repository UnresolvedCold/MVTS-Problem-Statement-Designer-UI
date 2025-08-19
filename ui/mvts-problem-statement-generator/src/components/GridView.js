// src/components/GridView.js
import React from 'react';
import Toolbar from './Toolbar';
import VirtualizedGridCanvas from './VirtualizedGridCanvas';
import RightSidebar from './RightSidebar';

const GridView = ({
  // Grid state
  rows,
  cols,
  cellSize,
  onRowsChange,
  onColsChange,
  onCellSizeChange,
  
  // Objects and handlers
  visualObjects,
  tasks,
  selectedObject,
  selectedTask,
  selectedAssignment,
  objectManager,
  handlers,
  filteredObjects,
  
  // Managers
  localWarehouseData,
  localStateManager,
  serverAPI,
  
  // UI actions
  onManageTemplates,
  onSolveProblem,
  onClearData
}) => {
  const { updateObjectPosition } = objectManager;
  
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left Toolbar */}
      <Toolbar
        rows={rows}
        cols={cols}
        cellSize={cellSize}
        onRowsChange={onRowsChange}
        onColsChange={onColsChange}
        onCellSizeChange={onCellSizeChange}
        onManageTemplates={onManageTemplates}
        onSolveProblem={onSolveProblem}
        onClearData={onClearData}
        serverAPI={serverAPI}
        onAddObject={handlers.handleAddObjectFromList}
        onAddTask={handlers.handleAddTask}
        onAddAssignment={handlers.handleAddAssignment}
        availablePPS={filteredObjects.availablePPS}
        availableMSU={filteredObjects.availableMSU}
        availableBots={filteredObjects.availableBots}
      />

      {/* Main Grid Canvas - Now using optimized virtualized canvas */}
      <div className="flex-1 overflow-hidden relative bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600">
        <VirtualizedGridCanvas
          rows={rows}
          cols={cols}
          cellSize={cellSize}
          objects={visualObjects}
          selectedObject={selectedObject}
          onObjectClick={handlers.handleObjectSelect}
          onObjectDragStart={(obj) => {
            console.log('Drag start for object:', obj.id);
          }}
          onObjectDragEnd={updateObjectPosition}
        />
      </div>

      {/* Right Sidebar */}
      <RightSidebar
        visualObjects={visualObjects}
        tasks={tasks}
        selectedObject={selectedObject}
        selectedTask={selectedTask}
        selectedAssignment={selectedAssignment}
        objectManager={objectManager}
        handlers={handlers}
        filteredObjects={filteredObjects}
        localWarehouseData={localWarehouseData}
        localStateManager={localStateManager}
        cellSize={cellSize}
      />
    </div>
  );
};

export default GridView;
