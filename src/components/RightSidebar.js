import React from 'react';
import ObjectsList from './ObjectsList';
import TasksList from './TasksList';
import PropertyEditor from './PropertyEditor';
import TaskPropertyEditor from './TaskPropertyEditor';

const RightSidebar = ({
  visualObjects,
  tasks,
  selectedObject,
  selectedTask,
  objectManager,
  handlers,
  filteredObjects,
  localWarehouseData,
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

      {/* Property Editor */}
      <div style={{ height: 300, overflow: "auto" }}>
        {selectedObject ? (
          <PropertyEditor
            selectedObject={selectedObject}
            onUpdateProperties={(objectId, props) => objectManager.updateObjectProperties(objectId, props)}
          />
        ) : selectedTask ? (
          <TaskPropertyEditor
            selectedTask={selectedTask}
            onUpdateProperties={(taskId, props) => objectManager.updateObjectProperties(selectedTask.id, props)}
          />
        ) : (
          <div style={{ padding: 20, textAlign: "center", color: "#666" }}>
            Select an object or task to edit properties
          </div>
        )}
      </div>
    </div>
  );
};

export default RightSidebar;
