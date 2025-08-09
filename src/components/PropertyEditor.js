import React, { useState, useEffect, useCallback, useRef } from 'react';

// Custom hook for debouncing values
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Component for editing JSON objects in textarea
const JsonTextArea = ({ value, onChange }) => {
  const [textValue, setTextValue] = useState(JSON.stringify(value, null, 2));
  const [hasError, setHasError] = useState(false);

  // Update text value when the actual value changes from outside
  useEffect(() => {
    setTextValue(JSON.stringify(value, null, 2));
    setHasError(false);
  }, [value]);

  const handleChange = (e) => {
    const newTextValue = e.target.value;
    setTextValue(newTextValue); // Always update the display
    
    try {
      const parsed = JSON.parse(newTextValue);
      setHasError(false);
      onChange(parsed); // Only update the actual value if JSON is valid
    } catch (error) {
      setHasError(true);
      // Don't update the parent value while there's a JSON error
    }
  };

  return (
    <textarea
      value={textValue}
      onChange={handleChange}
      style={{
        width: "100%",
        height: "60px",
        fontFamily: "monospace",
        fontSize: "11px",
        padding: "4px",
        border: hasError ? "1px solid #dc3545" : "1px solid #ccc",
        borderRadius: "3px",
        resize: "vertical",
        backgroundColor: hasError ? "#fff5f5" : "white"
      }}
    />
  );
};

const PropertyEditor = ({ 
  selectedObject, 
  selectedTask,
  onUpdateProperties,
  onClose,
  availablePPS = [],
  availableMSU = []
}) => {
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
  // Render form input based on value type
  const renderFormInput = (key, value, onChange) => {
    if (typeof value === 'boolean') {
      return (
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          style={{ margin: "0 5px" }}
        />
      );
    } else if (typeof value === 'number') {
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            width: "100%",
            padding: "4px",
            border: "1px solid #ccc",
            borderRadius: "3px"
          }}
        />
      );
    } else if (typeof value === 'string' || value === null) {
      return (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%",
            padding: "4px",
            border: "1px solid #ccc",
            borderRadius: "3px"
          }}
        />
      );
    } else if (typeof value === 'object' && value !== null) {
      // Handle objects like coordinate (for objects) or aisle_info (for tasks)
      if (key === 'coordinate' && value.x !== undefined && value.y !== undefined) {
        return (
          <div style={{ display: "flex", gap: "5px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "11px", color: "#666" }}>X:</label>
              <input
                type="number"
                value={value.x}
                onChange={(e) => handleNestedChange('coordinate', 'x', Number(e.target.value))}
                style={{
                  width: "100%",
                  padding: "4px",
                  border: "1px solid #ccc",
                  borderRadius: "3px"
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "11px", color: "#666" }}>Y:</label>
              <input
                type="number"
                value={value.y}
                onChange={(e) => handleNestedChange('coordinate', 'y', Number(e.target.value))}
                style={{
                  width: "100%",
                  padding: "4px",
                  border: "1px solid #ccc",
                  borderRadius: "3px"
                }}
              />
            </div>
          </div>
        );
      } else if (key === 'aisle_info' && value.aisle_id !== undefined && value.aisle_coordinate !== undefined) {
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <div style={{ display: "flex", gap: "5px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "11px", color: "#666" }}>Aisle ID:</label>
                <input
                  type="number"
                  value={value.aisle_id}
                  onChange={(e) => handleNestedChange('aisle_info', 'aisle_id', Number(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "4px",
                    border: "1px solid #ccc",
                    borderRadius: "3px"
                  }}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: "5px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "11px", color: "#666" }}>X:</label>
                <input
                  type="number"
                  value={value.aisle_coordinate?.[0] || 0}
                  onChange={(e) => {
                    const newCoordinate = [...(value.aisle_coordinate || [0, 0])];
                    newCoordinate[0] = Number(e.target.value);
                    handleNestedChange('aisle_info', 'aisle_coordinate', newCoordinate);
                  }}
                  style={{
                    width: "100%",
                    padding: "4px",
                    border: "1px solid #ccc",
                    borderRadius: "3px"
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "11px", color: "#666" }}>Y:</label>
                <input
                  type="number"
                  value={value.aisle_coordinate?.[1] || 0}
                  onChange={(e) => {
                    const newCoordinate = [...(value.aisle_coordinate || [0, 0])];
                    newCoordinate[1] = Number(e.target.value);
                    handleNestedChange('aisle_info', 'aisle_coordinate', newCoordinate);
                  }}
                  style={{
                    width: "100%",
                    padding: "4px",
                    border: "1px solid #ccc",
                    borderRadius: "3px"
                  }}
                />
              </div>
            </div>
          </div>
        );
      } else {
        // For complex objects, use the JsonTextArea component
        return <JsonTextArea value={value} onChange={onChange} />;
      }
    } else if (Array.isArray(value)) {
      // For arrays, use the JsonTextArea component
      return <JsonTextArea value={value} onChange={onChange} />;
    }
    
    return (
      <input
        type="text"
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "4px",
          border: "1px solid #ccc",
          borderRadius: "3px"
        }}
      />
    );
  };

  if (!currentItem) {
    return (
      <div style={{ 
        width: 300, 
        padding: 10, 
        borderLeft: "1px solid #ccc", 
        backgroundColor: "#f8f9fa" 
      }}>
        <h3>Property Editor</h3>
        <p style={{ color: "#666", fontStyle: "italic" }}>
          Select an object to edit its properties
        </p>
      </div>
    );
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3>Property Editor</h3>
        <button 
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            fontSize: "18px",
            cursor: "pointer",
            color: "#666"
          }}
        >
          ×
        </button>
      </div>
      
      <div style={{ marginBottom: "10px" }}>
        <strong>Selected:</strong> {
          isTask 
            ? `${currentItem.task_type || 'Task'} (ID: ${currentItem.task_key || currentItem.id})`
            : `${currentItem.type} (ID: ${currentItem.id})`
        }
      </div>

      {/* Mode Toggle */}
      <div style={{ marginBottom: "15px" }}>
        <button
          onClick={() => setEditMode('form')}
          style={{
            padding: "6px 12px",
            marginRight: "5px",
            border: "1px solid #ccc",
            borderRadius: "3px",
            backgroundColor: editMode === 'form' ? "#007bff" : "#fff",
            color: editMode === 'form' ? "#fff" : "#000",
            cursor: "pointer",
            fontSize: "12px"
          }}
        >
          Form View
        </button>
        <button
          onClick={() => setEditMode('json')}
          style={{
            padding: "6px 12px",
            border: "1px solid #ccc",
            borderRadius: "3px",
            backgroundColor: editMode === 'json' ? "#007bff" : "#fff",
            color: editMode === 'json' ? "#fff" : "#000",
            cursor: "pointer",
            fontSize: "12px"
          }}
        >
          JSON View
        </button>
      </div>

      {editMode === 'form' ? (
        /* Form View */
        <div>
          {Object.entries(formValues).map(([key, value]) => (
            <div key={key} style={{ marginBottom: "12px" }}>
              <label style={{ 
                display: "block", 
                marginBottom: "4px", 
                fontWeight: "bold",
                fontSize: "13px",
                color: "#333"
              }}>
                {key}:
              </label>
              {renderFormInput(key, value, (newValue) => handleFormChange(key, newValue))}
            </div>
          ))}
        </div>
      ) : (
        /* JSON View */
        <div>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Properties (JSON):
            </label>
            <textarea
              value={jsonEditValue}
              onChange={(e) => handleJsonChange(e.target.value)}
              style={{
                width: "100%",
                height: "300px",
                fontFamily: "monospace",
                fontSize: "12px",
                border: jsonError ? "2px solid red" : "1px solid #ccc",
                borderRadius: "4px",
                padding: "8px",
                resize: "vertical"
              }}
            />
            {jsonError && (
              <div style={{ 
                color: "red", 
                fontSize: "12px", 
                marginTop: "5px",
                padding: "5px",
                backgroundColor: "#ffe6e6",
                border: "1px solid red",
                borderRadius: "3px"
              }}>
                JSON Error: {jsonError}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyEditor;
