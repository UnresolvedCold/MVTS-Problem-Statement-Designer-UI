// src/components/property-editor/ModeToggle.js
import React from 'react';

/**
 * Toggle buttons for switching between form and JSON edit modes
 * @param {string} editMode - Current edit mode ('form' or 'json')
 * @param {function} onModeChange - Callback when mode changes
 * @returns {JSX.Element}
 */
const ModeToggle = ({ editMode, onModeChange }) => {
  const buttonStyle = {
    padding: "6px 12px",
    border: "1px solid #ccc",
    borderRadius: "3px",
    cursor: "pointer",
    fontSize: "12px"
  };

  return (
    <div style={{ marginBottom: "15px" }}>
      <button
        onClick={() => onModeChange('form')}
        style={{
          ...buttonStyle,
          marginRight: "5px",
          backgroundColor: editMode === 'form' ? "#007bff" : "#fff",
          color: editMode === 'form' ? "#fff" : "#000"
        }}
      >
        Form View
      </button>
      <button
        onClick={() => onModeChange('json')}
        style={{
          ...buttonStyle,
          backgroundColor: editMode === 'json' ? "#007bff" : "#fff",
          color: editMode === 'json' ? "#fff" : "#000"
        }}
      >
        JSON View
      </button>
    </div>
  );
};

export default ModeToggle;
