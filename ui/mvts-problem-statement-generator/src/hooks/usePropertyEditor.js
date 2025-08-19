// src/hooks/usePropertyEditor.js
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook to manage property editor state and logic
 * @param {object} selectedObject - Currently selected object
 * @param {object} selectedTask - Currently selected task
 * @param {function} onUpdateProperties - Callback when properties update
 * @returns {object} - Hook state and methods
 */
export const usePropertyEditor = (selectedObject, selectedTask, selectedAssignment, onUpdateProperties) => {
  const [editMode, setEditMode] = useState('form'); // 'form' or 'json'
  const [jsonEditValue, setJsonEditValue] = useState('');
  const [jsonError, setJsonError] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [pendingFormValues, setPendingFormValues] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalValues, setOriginalValues] = useState({});
  
  // Determine if we're editing a task, assignment, or object
  const isTask = !!selectedTask;
  const isAssignment = !!selectedAssignment || (selectedObject && selectedObject.isAssignment);
  const currentItem = isTask ? selectedTask : (isAssignment ? (selectedAssignment || selectedObject) : selectedObject);
  
  const isInitialFormMount = useRef(true);

  // Update values when selectedObject or selectedTask changes
  useEffect(() => {
    if (currentItem) {
      let itemData= currentItem.properties ? { ...currentItem.properties } : {};

      const filteredItem = { ...itemData };
      Object.keys(filteredItem).forEach(key => {
        if (key.startsWith('__meta_data')) {
          delete filteredItem[key];
        }
      });

      setFormValues(filteredItem);
      setPendingFormValues(filteredItem);
      setOriginalValues(filteredItem);
      setJsonEditValue(JSON.stringify(filteredItem, null, 2));
      setJsonError(null);
      setHasUnsavedChanges(false);
      isInitialFormMount.current = true;
    } else {
      setFormValues({});
      setPendingFormValues({});
      setOriginalValues({});
      setJsonEditValue('');
      setHasUnsavedChanges(false);
    }
  }, [currentItem, isTask, isAssignment]);

  // Update JSON text when form values change (for form to JSON sync)
  useEffect(() => {
    if (editMode === 'json') {
      const currentJsonString = JSON.stringify(formValues, null, 2);
      if (currentJsonString !== jsonEditValue) {
        setJsonEditValue(currentJsonString);
      }
    }
  }, [formValues, editMode, jsonEditValue]);

  // Handle form field changes
  const handleFormChange = useCallback((key, value) => {
    const updatedValues = { ...pendingFormValues, [key]: value };
    setPendingFormValues(updatedValues);
    setFormValues(updatedValues);
    
    // Check if there are unsaved changes
    const hasChanges = JSON.stringify(updatedValues) !== JSON.stringify(originalValues);
    setHasUnsavedChanges(hasChanges);
    
    // Update JSON representation for consistency
    setJsonEditValue(JSON.stringify(updatedValues, null, 2));
    setJsonError(null); // Form changes should always produce valid JSON
  }, [pendingFormValues, originalValues]);

  // Handle nested object changes (like coordinate or aisle_info)
  const handleNestedChange = useCallback((parentKey, childKey, value) => {
    const updatedValues = {
      ...pendingFormValues,
      [parentKey]: {
        ...pendingFormValues[parentKey],
        [childKey]: value
      }
    };
    setPendingFormValues(updatedValues);
    setFormValues(updatedValues);
    
    // Check if there are unsaved changes
    const hasChanges = JSON.stringify(updatedValues) !== JSON.stringify(originalValues);
    setHasUnsavedChanges(hasChanges);
    
    // Update JSON representation for consistency
    setJsonEditValue(JSON.stringify(updatedValues, null, 2));
    setJsonError(null); // Form changes should always produce valid JSON
  }, [pendingFormValues, originalValues]);

  // Handle JSON text change
  const handleJsonChange = useCallback((value) => {
    setJsonEditValue(value);
    try {
      const parsed = JSON.parse(value);
      setJsonError(null);
      setFormValues(parsed);
      setPendingFormValues(parsed);
      
      // Check if there are unsaved changes
      const hasChanges = JSON.stringify(parsed) !== JSON.stringify(originalValues);
      setHasUnsavedChanges(hasChanges);
    } catch (error) {
      setJsonError(error.message);
    }
  }, [originalValues]);

  // Save current changes
  const handleSave = useCallback(() => {
    // Only save if there are no JSON errors and there are changes to save
    if (onUpdateProperties && currentItem && hasUnsavedChanges && !jsonError) {
      let itemId;
      
      if (isTask) {
        itemId = currentItem.task_key || currentItem.id;
      } else if (isAssignment) {
        // For assignments, we need both the assignment ID and PPS ID
        itemId = {
          assignmentId: currentItem.id,
          ppsId: currentItem.pps_id
        };
      } else {
        itemId = currentItem.id;
      }
      
      onUpdateProperties(itemId, formValues);
      setOriginalValues(formValues);
      setHasUnsavedChanges(false);
    }
  }, [currentItem, formValues, onUpdateProperties, isTask, isAssignment, hasUnsavedChanges, jsonError]);

  // Reset changes to original values
  const handleReset = useCallback(() => {
    setFormValues(originalValues);
    setPendingFormValues(originalValues);
    setJsonEditValue(JSON.stringify(originalValues, null, 2));
    setHasUnsavedChanges(false);
    setJsonError(null);
  }, [originalValues]);

  return {
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
  };
};
