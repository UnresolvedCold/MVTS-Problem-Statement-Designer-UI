import React from 'react';
import { usePropertyEditor } from '../hooks/usePropertyEditor';
import PropertyEditorHeader from './property-editor/PropertyEditorHeader';
import ModeToggle from './property-editor/ModeToggle';
import FormView from './property-editor/FormView';
import JsonView from './property-editor/JsonView';
import PropertyEditorEmptyState from './property-editor/PropertyEditorEmptyState';

const PropertyEditor = ({ 
  selectedObject, 
  selectedTask,
  onUpdateProperties,
  onClose,
  availablePPS = [],
  availableMSU = []
}) => {
  const {
    editMode,
    setEditMode,
    jsonEditValue,
    jsonError,
    formValues,
    isTask,
    currentItem,
    handleFormChange,
    handleNestedChange,
    handleJsonChange
  } = usePropertyEditor(selectedObject, selectedTask, onUpdateProperties);

  if (!currentItem) {
    return <PropertyEditorEmptyState />;
  }

  return (
    <div style={{ 
      width: 300, 
      padding: 10, 
      borderLeft: "1px solid #ccc", 
      backgroundColor: "#f8f9fa",
      height: "100vh",
      overflowY: "auto"
    }}>
      <PropertyEditorHeader 
        onClose={onClose}
        isTask={isTask}
        currentItem={currentItem}
      />

      <ModeToggle 
        editMode={editMode}
        onModeChange={setEditMode}
      />

      {editMode === 'form' ? (
        <FormView
          formValues={formValues}
          onFieldChange={handleFormChange}
          onNestedChange={handleNestedChange}
        />
      ) : (
        <JsonView
          jsonEditValue={jsonEditValue}
          jsonError={jsonError}
          onJsonChange={handleJsonChange}
        />
      )}
    </div>
  );
};

export default PropertyEditor;
