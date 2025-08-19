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
    <div className="w-150 border-l border-gray-300 dark:border-gray-600 flex flex-row overflow-hidden bg-white dark:bg-gray-900">
      {/* Unified Entities List */}
      <div className="w-75 overflow-auto border-r border-gray-300 dark:border-gray-600">
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
      <div className="w-75 overflow-auto">
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
          <div className="p-5 text-center text-gray-600 dark:text-gray-400 text-xs">
            Select an entity to edit properties
          </div>
        )}
      </div>
    </div>
  );
};

export default RightSidebar;
