// src/components/property-editor/FormField.js
import React from 'react';
import JsonTextArea from './JsonTextArea';

/**
 * Renders different input types based on the value type
 * @param {string} key - The property key
 * @param {any} value - The property value
 * @param {function} onChange - Callback when value changes
 * @param {function} onNestedChange - Callback for nested object changes
 * @returns {JSX.Element}
 */
const FormInput = ({ fieldKey, value, onChange, onNestedChange }) => {
  const inputStyle = {
    width: "100%",
    padding: "4px",
    border: "1px solid #ccc",
    borderRadius: "3px"
  };

  if (typeof value === 'boolean') {
    return (
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        style={{ margin: "0 5px" }}
      />
    );
  } 
  
  if (typeof value === 'number') {
    return (
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={inputStyle}
      />
    );
  }
  
  if (typeof value === 'string' || value === null) {
    return (
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      />
    );
  }
  
  if (typeof value === 'object' && value !== null) {
    // Handle coordinate/aisle object
    if (value.x !== undefined && value.y !== undefined) {
      return (
        <div style={{ display: "flex", gap: "5px" }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "11px", color: "#666" }}>X:</label>
            <input
              type="number"
              value={value.x}
              onChange={(e) => onNestedChange('coordinate', 'x', Number(e.target.value))}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "11px", color: "#666" }}>Y:</label>
            <input
              type="number"
              value={value.y}
              onChange={(e) => onNestedChange('coordinate', 'y', Number(e.target.value))}
              style={inputStyle}
            />
          </div>
        </div>
      );
    }
    
    // Handle aisle_info object
    if ((fieldKey === 'aisle_info' || fieldKey === 'current_aisle_info') && value.aisle_id !== undefined && value.aisle_coordinate !== undefined) {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <div style={{ display: "flex", gap: "5px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "11px", color: "#666" }}>Aisle ID:</label>
              <input
                type="number"
                value={value.aisle_id}
                onChange={(e) => onNestedChange('aisle_info', 'aisle_id', Number(e.target.value))}
                style={inputStyle}
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
                  onNestedChange('aisle_info', 'aisle_coordinate', newCoordinate);
                }}
                style={inputStyle}
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
                  onNestedChange('aisle_info', 'aisle_coordinate', newCoordinate);
                }}
                style={inputStyle}
              />
            </div>
          </div>
        </div>
      );
    }
    
    // For complex objects, use JsonTextArea
    return <JsonTextArea value={value} onChange={onChange} />;
  }
  
  if (Array.isArray(value)) {
    return <JsonTextArea value={value} onChange={onChange} />;
  }
  
  // Fallback for any other type
  return (
    <input
      type="text"
      value={String(value)}
      onChange={(e) => onChange(e.target.value)}
      style={inputStyle}
    />
  );
};

/**
 * Individual form field with label and input
 * @param {string} fieldKey - The property key
 * @param {any} value - The property value
 * @param {function} onChange - Callback when value changes
 * @param {function} onNestedChange - Callback for nested object changes
 * @returns {JSX.Element}
 */
const FormField = ({ fieldKey, value, onChange, onNestedChange }) => {
  return (
    <div style={{ marginBottom: "12px" }}>
      <label style={{ 
        display: "block", 
        marginBottom: "4px", 
        fontWeight: "bold",
        fontSize: "13px",
        color: "#333"
      }}>
        {fieldKey}:
      </label>
      <FormInput 
        fieldKey={fieldKey}
        value={value} 
        onChange={onChange}
        onNestedChange={onNestedChange}
      />
    </div>
  );
};

export default FormField;
