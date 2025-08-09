// src/components/property-editor/PropertyEditorHeader.js
import React from 'react';

/**
 * Header component for PropertyEditor with title, close button, and item info
 * @param {function} onClose - Callback when close button is clicked
 * @param {boolean} isTask - Whether editing a task or object
 * @param {object} currentItem - The current item being edited
 * @returns {JSX.Element}
 */
const PropertyEditorHeader = ({ onClose, isTask, isAssignment, currentItem }) => {
  return (
    <>
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
            ? `${currentItem.task_type || 'Task'} (ID: ${currentItem.properties.task_key || currentItem.id})`
            : isAssignment
            ? `Assignment: ${currentItem.task_key || currentItem.properties?.task_key || 'N/A'}`
            : `${currentItem.type} (ID: ${currentItem.id})`
        }
      </div>
    </>
  );
};

export default PropertyEditorHeader;
