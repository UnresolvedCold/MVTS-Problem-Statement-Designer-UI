// src/components/property-editor/JsonView.js
import React from 'react';

/**
 * JSON view for editing properties as raw JSON
 * @param {string} jsonEditValue - Current JSON string value
 * @param {string} jsonError - Current JSON error message (if any)
 * @param {function} onJsonChange - Callback when JSON changes
 * @returns {JSX.Element}
 */
const JsonView = ({ jsonEditValue, jsonError, onJsonChange }) => {
  return (
    <div>
      <div style={{ marginBottom: "10px" }}>
        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
          Properties (JSON):
        </label>
        <textarea
          value={jsonEditValue}
          onChange={(e) => onJsonChange(e.target.value)}
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

export default JsonView;
