import React, { useState, useEffect } from 'react';

const PropertyEditor = ({ 
  selectedObject, 
  onUpdateProperties,
  onClose 
}) => {
  const [editMode, setEditMode] = useState('form'); // 'form' or 'json'
  const [jsonEditValue, setJsonEditValue] = useState('');
  const [jsonError, setJsonError] = useState(null);
  const [formValues, setFormValues] = useState({});

  // Update values when selectedObject changes
  useEffect(() => {
    if (selectedObject?.properties) {
      setFormValues({ ...selectedObject.properties });
      setJsonEditValue(JSON.stringify(selectedObject.properties, null, 2));
      setJsonError(null);
    } else {
      setFormValues({});
      setJsonEditValue('');
    }
  }, [selectedObject]);

  // Handle form field changes
  const handleFormChange = (key, value) => {
    const updatedValues = { ...formValues, [key]: value };
    setFormValues(updatedValues);
    onUpdateProperties(selectedObject.id, updatedValues);
  };

  // Handle nested object changes (like coordinate)
  const handleNestedChange = (parentKey, childKey, value) => {
    const updatedValues = {
      ...formValues,
      [parentKey]: {
        ...formValues[parentKey],
        [childKey]: value
      }
    };
    setFormValues(updatedValues);
    onUpdateProperties(selectedObject.id, updatedValues);
  };

  // Handle JSON text change
  const handleJsonChange = (value) => {
    setJsonEditValue(value);
    try {
      const parsed = JSON.parse(value);
      setJsonError(null);
      setFormValues(parsed);
      onUpdateProperties(selectedObject.id, parsed);
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
      // Handle objects like coordinate
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
      } else {
        // For complex objects, show as JSON text
        return (
          <textarea
            value={JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                onChange(parsed);
              } catch (error) {
                // Ignore parsing errors while typing
              }
            }}
            style={{
              width: "100%",
              height: "60px",
              fontFamily: "monospace",
              fontSize: "11px",
              padding: "4px",
              border: "1px solid #ccc",
              borderRadius: "3px",
              resize: "vertical"
            }}
          />
        );
      }
    } else {
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
    }
  };

  if (!selectedObject) {
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
        <strong>Selected:</strong> {selectedObject.type} (ID: {selectedObject.id})
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
