// src/components/GridView.js
import React from 'react';
import Toolbar from './Toolbar';
import GridCanvas from './GridCanvas';
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
  objectManager,
  handlers,
  filteredObjects,
  
  // Managers
  localWarehouseData,
  serverAPI,
  
  // UI actions
  onManageTemplates,
  onSolveProblem,
  onClearData
}) => {
  const { updateObjectPosition } = objectManager;
  
  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
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
      />

      {/* Main Grid Canvas */}
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
        objectManager={objectManager}
        handlers={handlers}
        filteredObjects={filteredObjects}
        localWarehouseData={localWarehouseData}
        cellSize={cellSize}
      />
    </div>
  );
};

export default GridView;
