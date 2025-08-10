// src/components/property-editor/SaveControls.js
import React from 'react';

/**
 * Save and Reset controls for property editor
 * @param {boolean} hasUnsavedChanges - Whether there are unsaved changes
 * @param {function} onSave - Callback when save button is clicked
 * @param {function} onReset - Callback when reset button is clicked
 * @param {boolean} jsonError - Whether there's a JSON error (disables save)
 * @returns {JSX.Element}
 */
const SaveControls = ({ hasUnsavedChanges, onSave, onReset, jsonError }) => {
  const buttonStyle = {
    padding: "8px 16px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
    marginRight: "8px",
    transition: "all 0.2s ease"
  };

  const saveButtonStyle = {
    ...buttonStyle,
    backgroundColor: hasUnsavedChanges && !jsonError ? "#28a745" : "#e9ecef",
    color: hasUnsavedChanges && !jsonError ? "#fff" : "#6c757d",
    cursor: hasUnsavedChanges && !jsonError ? "pointer" : "not-allowed",
    border: hasUnsavedChanges && !jsonError ? "1px solid #28a745" : "1px solid #ced4da"
  };

  const resetButtonStyle = {
    ...buttonStyle,
    backgroundColor: hasUnsavedChanges ? "#dc3545" : "#e9ecef",
    color: hasUnsavedChanges ? "#fff" : "#6c757d",
    cursor: hasUnsavedChanges ? "pointer" : "not-allowed",
    border: hasUnsavedChanges ? "1px solid #dc3545" : "1px solid #ced4da"
  };

  // Don't render the controls if there are no unsaved changes and no JSON error
  if (!hasUnsavedChanges && !jsonError) {
    return null;
  }

  return (
    <div style={{ 
      marginBottom: "15px",
      padding: "10px",
      backgroundColor: "#f8f9fa",
      border: "1px solid #e9ecef",
      borderRadius: "4px",
      display: "flex",
      alignItems: "center",
      gap: "8px"
    }}>
      {hasUnsavedChanges && (
        <>
          <button
            onClick={onSave}
            disabled={jsonError}
            style={saveButtonStyle}
            title={
              jsonError 
                ? "Fix JSON errors before saving" 
                : "Save changes"
            }
          >
            💾 Save
          </button>
          
          <button
            onClick={onReset}
            style={resetButtonStyle}
            title="Reset to original values"
          >
            ↺ Reset
          </button>

          <div style={{
            fontSize: "11px",
            color: "#856404",
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeaa7",
            borderRadius: "3px",
            padding: "4px 8px",
            marginLeft: "auto"
          }}>
            ● Unsaved changes
          </div>
        </>
      )}

      {jsonError && (
        <div style={{
          fontSize: "11px",
          color: "#721c24",
          backgroundColor: "#f8d7da",
          border: "1px solid #f5c6cb",
          borderRadius: "3px",
          padding: "4px 8px",
          marginLeft: hasUnsavedChanges ? "0" : "auto"
        }}>
          ⚠ JSON Error
        </div>
      )}
    </div>
  );
};

export default SaveControls;
