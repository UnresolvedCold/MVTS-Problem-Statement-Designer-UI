// src/components/property-editor/FormField.js
import React from 'react';
import JsonTextArea from './JsonTextArea';

/**
 * Renders different input types based on the value type
 * @param {string} fieldKey - The property key
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

  // Always allow editing any field - no restrictions
  
  if (typeof value === 'boolean') {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          style={{ margin: "0" }}
        />
        <span style={{ fontSize: "12px", color: "#666" }}>{value ? 'True' : 'False'}</span>
      </div>
    );
  } 
  
  if (typeof value === 'number') {
    return (
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const val = e.target.value;
          // Allow empty string for editing, otherwise convert to number
          onChange(val === '' ? 0 : Number(val));
        }}
        style={inputStyle}
        placeholder="Enter number"
      />
    );
  }
  
  if (typeof value === 'string' || value === null || value === undefined) {
    return (
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
        placeholder="Enter text"
      />
    );
  }
  
  if (typeof value === 'object' && value !== null) {
    // Handle coordinate objects with x, y properties
    if (value.hasOwnProperty('x') && value.hasOwnProperty('y')) {
      return (
        <div style={{ display: "flex", gap: "5px" }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "11px", color: "#666" }}>X:</label>
            <input
              type="number"
              value={value.x || 0}
              onChange={(e) => onNestedChange(fieldKey, 'x', Number(e.target.value))}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "11px", color: "#666" }}>Y:</label>
            <input
              type="number"
              value={value.y || 0}
              onChange={(e) => onNestedChange(fieldKey, 'y', Number(e.target.value))}
              style={inputStyle}
            />
          </div>
        </div>
      );
    }
    
    // Handle aisle_info objects 
    if (value.hasOwnProperty('aisle_id') || value.hasOwnProperty('aisle_coordinate')) {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          {value.hasOwnProperty('aisle_id') && (
            <div>
              <label style={{ fontSize: "11px", color: "#666" }}>Aisle ID:</label>
              <input
                type="number"
                value={value.aisle_id || 0}
                onChange={(e) => onNestedChange(fieldKey, 'aisle_id', Number(e.target.value))}
                style={inputStyle}
              />
            </div>
          )}
          {value.hasOwnProperty('aisle_coordinate') && Array.isArray(value.aisle_coordinate) && (
            <div style={{ display: "flex", gap: "5px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "11px", color: "#666" }}>X:</label>
                <input
                  type="number"
                  value={value.aisle_coordinate[0] || 0}
                  onChange={(e) => {
                    const newCoordinate = [...(value.aisle_coordinate || [0, 0])];
                    newCoordinate[0] = Number(e.target.value);
                    onNestedChange(fieldKey, 'aisle_coordinate', newCoordinate);
                  }}
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "11px", color: "#666" }}>Y:</label>
                <input
                  type="number"
                  value={value.aisle_coordinate[1] || 0}
                  onChange={(e) => {
                    const newCoordinate = [...(value.aisle_coordinate || [0, 0])];
                    newCoordinate[1] = Number(e.target.value);
                    onNestedChange(fieldKey, 'aisle_coordinate', newCoordinate);
                  }}
                  style={inputStyle}
                />
              </div>
            </div>
          )}
        </div>
      );
    }
    
    // For any other complex objects, use JsonTextArea to allow unrestricted editing
    return <JsonTextArea value={value} onChange={onChange} />;
  }
  
  if (Array.isArray(value)) {
    // For arrays, always use JsonTextArea for unrestricted editing
    return <JsonTextArea value={value} onChange={onChange} />;
  }
  
  // Fallback for any other type - allow editing as text and try to convert
  return (
    <div>
      <input
        type="text"
        value={String(value)}
        onChange={(e) => {
          const val = e.target.value;
          // Try to parse as JSON first, fallback to string
          try {
            onChange(JSON.parse(val));
          } catch {
            onChange(val);
          }
        }}
        style={inputStyle}
        placeholder="Enter value (JSON format for complex types)"
      />
      <div style={{ fontSize: "10px", color: "#888", marginTop: "2px" }}>
        Type: {typeof value} {Array.isArray(value) ? '(array)' : ''}
      </div>
    </div>
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
  const getFieldTypeInfo = (value) => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (Array.isArray(value)) return `array[${value.length}]`;
    if (typeof value === 'object') return 'object';
    return typeof value;
  };

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
        <span style={{ 
          fontWeight: "normal", 
          fontSize: "11px", 
          color: "#666", 
          marginLeft: "8px" 
        }}>
          ({getFieldTypeInfo(value)})
        </span>
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
