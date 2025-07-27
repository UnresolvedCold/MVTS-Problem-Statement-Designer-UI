import React, { useState, useEffect } from 'react';

const PropertyEditor = ({ 
  selectedObject, 
  onUpdateProperties,
  onClose 
}) => {
  const [jsonEditValue, setJsonEditValue] = useState('');
  const [jsonError, setJsonError] = useState(null);

  // Update jsonEditValue when selectedObject changes
  useEffect(() => {
    if (selectedObject?.properties) {
      setJsonEditValue(JSON.stringify(selectedObject.properties, null, 2));
      setJsonError(null);
    } else {
      setJsonEditValue('');
    }
  }, [selectedObject]);

  // Handle JSON text change
  const handleJsonChange = (value) => {
    setJsonEditValue(value);
    try {
      const parsed = JSON.parse(value);
      setJsonError(null);
      onUpdateProperties(selectedObject.id, parsed);
    } catch (error) {
      setJsonError(error.message);
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
      backgroundColor: "#f8f9fa" 
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
  );
};

export default PropertyEditor;
