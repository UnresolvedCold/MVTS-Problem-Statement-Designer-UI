// src/hooks/usePropertyEditor.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from './useDebounce';

/**
 * Custom hook to manage property editor state and logic
 * @param {object} selectedObject - Currently selected object
 * @param {object} selectedTask - Currently selected task
 * @param {function} onUpdateProperties - Callback when properties update
 * @returns {object} - Hook state and methods
 */
export const usePropertyEditor = (selectedObject, selectedTask, onUpdateProperties) => {
  const [editMode, setEditMode] = useState('form'); // 'form' or 'json'
  const [jsonEditValue, setJsonEditValue] = useState('');
  const [jsonError, setJsonError] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [pendingFormValues, setPendingFormValues] = useState({});
  
  // Determine if we're editing a task or object
  const isTask = !!selectedTask;
  const currentItem = isTask ? selectedTask : selectedObject;
  
  // Debounce form values for tasks to reduce update frequency
  const debouncedFormValues = useDebounce(pendingFormValues, 300);
  const isInitialFormMount = useRef(true);

  // Update values when selectedObject or selectedTask changes
  useEffect(() => {
    if (currentItem) {
      let itemData;
      if (isTask) {
        itemData = { ...currentItem };
      } else {
        itemData = currentItem.properties ? { ...currentItem.properties } : {};
      }
      
      setFormValues(itemData);
      setPendingFormValues(itemData);
      setJsonEditValue(JSON.stringify(itemData, null, 2));
      setJsonError(null);
      isInitialFormMount.current = true;
    } else {
      setFormValues({});
      setPendingFormValues({});
      setJsonEditValue('');
    }
  }, [currentItem, isTask]);

  // Handle debounced form value updates (only for tasks)
  useEffect(() => {
    if (!isTask) return;
    
    if (isInitialFormMount.current) {
      isInitialFormMount.current = false;
      return;
    }
    
    if (JSON.stringify(debouncedFormValues) !== JSON.stringify(formValues)) {
      setFormValues(debouncedFormValues);
      if (onUpdateProperties && currentItem) {
        const itemId = currentItem.task_key || currentItem.id;
        onUpdateProperties(itemId, debouncedFormValues);
      }
    }
  }, [debouncedFormValues, formValues, currentItem, onUpdateProperties, isTask]);

  // Handle form field changes
  const handleFormChange = useCallback((key, value) => {
    const updatedValues = { ...pendingFormValues, [key]: value };
    
    if (isTask) {
      setPendingFormValues(updatedValues); // This will trigger the debounced update
    } else {
      // For objects, update immediately
      setFormValues(updatedValues);
      setPendingFormValues(updatedValues);
      if (onUpdateProperties && currentItem) {
        onUpdateProperties(currentItem.id, updatedValues);
      }
    }
  }, [pendingFormValues, currentItem, onUpdateProperties, isTask]);

  // Handle nested object changes (like coordinate or aisle_info)
  const handleNestedChange = useCallback((parentKey, childKey, value) => {
    const updatedValues = {
      ...pendingFormValues,
      [parentKey]: {
        ...pendingFormValues[parentKey],
        [childKey]: value
      }
    };
    
    if (isTask) {
      setPendingFormValues(updatedValues); // This will trigger the debounced update
    } else {
      // For objects, update immediately
      setFormValues(updatedValues);
      setPendingFormValues(updatedValues);
      if (onUpdateProperties && currentItem) {
        onUpdateProperties(currentItem.id, updatedValues);
      }
    }
  }, [pendingFormValues, currentItem, onUpdateProperties, isTask]);

  // Handle JSON text change
  const handleJsonChange = useCallback((value) => {
    setJsonEditValue(value);
    try {
      const parsed = JSON.parse(value);
      setJsonError(null);
      setFormValues(parsed);
      setPendingFormValues(parsed);
      if (onUpdateProperties && currentItem) {
        const itemId = isTask ? (currentItem.task_key || currentItem.id) : currentItem.id;
        onUpdateProperties(itemId, parsed);
      }
    } catch (error) {
      setJsonError(error.message);
    }
  }, [currentItem, onUpdateProperties, isTask]);

  return {
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
  };
};
