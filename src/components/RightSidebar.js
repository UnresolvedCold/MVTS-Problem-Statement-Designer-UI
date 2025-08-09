import React from 'react';
import EntitiesList from './EntitiesList';
import PropertyEditor from './PropertyEditor';

const RightSidebar = ({
  visualObjects,
  tasks,
  selectedObject,
  selectedTask,
  selectedAssignment,
  objectManager,
  handlers,
  filteredObjects,
  localWarehouseData,
  localStateManager,
  cellSize
}) => {
  return (
    <div style={{
      width: 300,
      borderLeft: "1px solid #ccc",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    }}>
      {/* Unified Entities List */}
      <div style={{ flex: 1, overflow: "auto", borderBottom: "1px solid #ccc" }}>
        <EntitiesList
          objects={visualObjects}
          tasks={tasks}
          assignments={[]} // assignments are handled through warehouseData
          selectedObject={selectedObject}
          selectedTask={selectedTask}
          selectedAssignment={selectedAssignment}
          onObjectSelect={handlers.handleObjectSelect}
          onTaskSelect={handlers.handleTaskSelect}
          onAssignmentSelect={handlers.handleAssignmentSelect}
          onRemoveObject={objectManager.removeObject}
          onRemoveTask={objectManager.removeObject}
          onRemoveAssignment={handlers.handleRemoveAssignment}
          warehouseData={localWarehouseData}
        />
      </div>

      {/* Property Editor */}
      <div style={{ height: 300, overflow: "auto" }}>
        {(selectedObject || selectedTask || selectedAssignment) ? (
          <PropertyEditor
            selectedObject={selectedObject}
            selectedTask={selectedTask}
            selectedAssignment={selectedAssignment}
            onUpdateProperties={(itemId, props) => {
              // Handle different types of updates
              if (typeof itemId === 'object' && itemId.assignmentId && itemId.ppsId) {
                // This is an assignment update
                localStateManager.updateAssignmentInPPS(itemId.ppsId, itemId.assignmentId, props);
                
                // Update the selected assignment if it's the one being edited
                if (selectedAssignment && selectedAssignment.properties && selectedAssignment.properties.id === itemId.assignmentId) {
                  const updatedAssignment = {
                    ...selectedAssignment,
                    properties: { ...selectedAssignment.properties, ...props }
                  };
                  objectManager.setSelectedObject(updatedAssignment);
                }
              } else {
                // This is a regular object or task update
                objectManager.updateObjectProperties(itemId, props);
              }
            }}
            onClose={() => {}} // Add close functionality if needed
          />
        ) : (
          <div style={{ padding: 20, textAlign: "center", color: "#666", fontSize: "12px" }}>
            Select an entity to edit properties
          </div>
        )}
      </div>
    </div>
  );
};

export default RightSidebar;
