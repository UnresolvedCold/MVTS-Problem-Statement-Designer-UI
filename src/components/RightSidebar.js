import React from 'react';
import ObjectsList from './ObjectsList';
import TasksList from './TasksList';
import PropertyEditor from './PropertyEditor';
import AssignmentsSummary from './AssignmentsSummary';

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
      {/* Objects List */}
      <div style={{ flex: 1, overflow: "auto", borderBottom: "1px solid #ccc" }}>
        <ObjectsList
          objects={visualObjects}
          onObjectSelect={handlers.handleObjectSelect}
          onRemoveObject={objectManager.removeObject}
          onAddObject={handlers.handleAddObjectFromList}
          selectedObject={selectedObject}
          cellSize={cellSize}
        />
      </div>

      {/* Tasks List */}
      <div style={{ flex: 1, overflow: "auto", borderBottom: "1px solid #ccc" }}>
        <TasksList
          tasks={tasks}
          onSelectTask={handlers.handleTaskSelect}
          onAddTask={handlers.handleAddTask}
          onRemoveTask={objectManager.removeObject}
          onAddAssignment={handlers.handleAddAssignment}
          onSolveProblem={() => handlers.handleSolveProblem(localWarehouseData)}
          selectedTask={selectedTask}
          availablePPS={filteredObjects.availablePPS}
          availableMSU={filteredObjects.availableMSU}
          availableBots={filteredObjects.availableBots}
        />
      </div>

      {/* Assignments Summary */}
      <div style={{ flex: 1, overflow: "auto", borderBottom: "1px solid #ccc" }}>
        <AssignmentsSummary
          warehouseData={localWarehouseData}
          onRemoveAssignment={handlers.handleRemoveAssignment}
          onSelectAssignment={handlers.handleAssignmentSelect}
          selectedAssignment={selectedAssignment}
        />
      </div>

      {/* Property Editor */}
      <div style={{ height: 250, overflow: "auto" }}>
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
          <div style={{ padding: 20, textAlign: "center", color: "#666" }}>
            Select an object, task, or assignment to edit properties
          </div>
        )}
      </div>
    </div>
  );
};

export default RightSidebar;
