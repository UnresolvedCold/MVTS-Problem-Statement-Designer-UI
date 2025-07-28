import React, { useState, useEffect } from 'react';

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

const TaskPropertyEditor = ({ 
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

  // Update values when selectedTask changes
  useEffect(() => {
    if (selectedTask) {
      setFormValues({ ...selectedTask });
      setJsonEditValue(JSON.stringify(selectedTask, null, 2));
      setJsonError(null);
    } else {
      setFormValues({});
      setJsonEditValue('');
    }
  }, [selectedTask]);

  // Handle form field changes
  const handleFormChange = (key, value) => {
    const updatedValues = { ...formValues, [key]: value };
    setFormValues(updatedValues);
    onUpdateProperties(selectedTask.task_key || selectedTask.id, updatedValues);
  };

  // Handle nested object changes (like aisle_info)
  const handleNestedChange = (parentKey, childKey, value) => {
    const updatedValues = {
      ...formValues,
      [parentKey]: {
        ...formValues[parentKey],
        [childKey]: value
      }
    };
    setFormValues(updatedValues);
    onUpdateProperties(selectedTask.task_key || selectedTask.id, updatedValues);
  };

  // Handle JSON text change
  const handleJsonChange = (value) => {
    setJsonEditValue(value);
    try {
      const parsed = JSON.parse(value);
      setJsonError(null);
      setFormValues(parsed);
      onUpdateProperties(selectedTask.task_key || selectedTask.id, parsed);
    } catch (error) {
      setJsonError(error.message);
    }
  };

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
      // Handle objects like aisle_info
      if (key === 'aisle_info' && value.aisle_id !== undefined && value.aisle_coordinate !== undefined) {
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

  if (!selectedTask) {
    return null;
  }

  return (
    <div style={{
      width: 300,
      padding: 15,
      borderLeft: "1px solid #ccc",
      backgroundColor: "#f8f9fa",
      height: "100%",
      overflowY: "auto"
    }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: 15
      }}>
        <h4 style={{ margin: 0 }}>Task Properties</h4>
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

      {/* Mode Toggle */}
      <div style={{ 
        display: "flex", 
        marginBottom: 15,
        borderBottom: "1px solid #ddd"
      }}>
        <button
          onClick={() => setEditMode('form')}
          style={{
            flex: 1,
            padding: "8px",
            border: "none",
            borderBottom: editMode === 'form' ? "2px solid #007bff" : "2px solid transparent",
            backgroundColor: "transparent",
            cursor: "pointer",
            fontWeight: editMode === 'form' ? "bold" : "normal",
            color: editMode === 'form' ? "#007bff" : "#666"
          }}
        >
          Form
        </button>
        <button
          onClick={() => setEditMode('json')}
          style={{
            flex: 1,
            padding: "8px",
            border: "none",
            borderBottom: editMode === 'json' ? "2px solid #007bff" : "2px solid transparent",
            backgroundColor: "transparent",
            cursor: "pointer",
            fontWeight: editMode === 'json' ? "bold" : "normal",
            color: editMode === 'json' ? "#007bff" : "#666"
          }}
        >
          JSON
        </button>
      </div>

      {editMode === 'form' ? (
        // Form Editor
        <div>
          {Object.entries(formValues).map(([key, value]) => (
            <div key={key} style={{ marginBottom: 12 }}>
              <label style={{ 
                display: "block", 
                fontWeight: "bold", 
                marginBottom: 4,
                fontSize: "12px",
                color: "#333"
              }}>
                {key}:
              </label>
              {renderFormInput(key, value, (newValue) => handleFormChange(key, newValue))}
            </div>
          ))}
        </div>
      ) : (
        // JSON Editor
        <div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ 
              display: "block", 
              fontWeight: "bold", 
              marginBottom: 5,
              fontSize: "12px"
            }}>
              JSON Editor:
            </label>
            <textarea
              value={jsonEditValue}
              onChange={(e) => handleJsonChange(e.target.value)}
              style={{
                width: "100%",
                height: "400px",
                fontFamily: "monospace",
                fontSize: "11px",
                padding: "8px",
                border: jsonError ? "2px solid #dc3545" : "1px solid #ccc",
                borderRadius: "4px",
                backgroundColor: jsonError ? "#fff5f5" : "white"
              }}
            />
            {jsonError && (
              <div style={{
                color: "#dc3545",
                fontSize: "11px",
                marginTop: "4px",
                padding: "4px",
                backgroundColor: "#f8d7da",
                border: "1px solid #f5c6cb",
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

export default TaskPropertyEditor;
