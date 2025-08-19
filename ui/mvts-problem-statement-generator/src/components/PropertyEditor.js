import React from 'react';
import { usePropertyEditor } from '../hooks/usePropertyEditor';
import { useTheme } from '../contexts/ThemeContext';
import PropertyEditorHeader from './property-editor/PropertyEditorHeader';
import ModeToggle from './property-editor/ModeToggle';
import SaveControls from './property-editor/SaveControls';
import FormView from './property-editor/FormView';
import JsonView from './property-editor/JsonView';
import PropertyEditorEmptyState from './property-editor/PropertyEditorEmptyState';

const PropertyEditor = ({ 
  selectedObject, 
  selectedTask,
  selectedAssignment,
  onUpdateProperties,
  onClose,
  availablePPS = [],
  availableMSU = []
}) => {
  const { isDark } = useTheme();
  const {
    editMode,
    setEditMode,
    jsonEditValue,
    jsonError,
    formValues,
    isTask,
    isAssignment,
    currentItem,
    hasUnsavedChanges,
    handleFormChange,
    handleNestedChange,
    handleJsonChange,
    handleSave,
    handleReset
  } = usePropertyEditor(selectedObject, selectedTask, selectedAssignment, onUpdateProperties);

  if (!currentItem) {
    return <PropertyEditorEmptyState />;
  }

  return (
    <div className="w-75 p-2.5 border-l border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 h-screen overflow-y-auto">
      <PropertyEditorHeader
        onClose={onClose}
        isTask={isTask}
        isAssignment={isAssignment}
        currentItem={currentItem}
      />

      <ModeToggle 
        editMode={editMode}
        onModeChange={setEditMode}
      />

      <SaveControls
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={handleSave}
        onReset={handleReset}
        jsonError={!!jsonError}
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
