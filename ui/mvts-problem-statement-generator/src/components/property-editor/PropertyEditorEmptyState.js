// src/components/property-editor/PropertyEditorEmptyState.js
import React from 'react';

/**
 * Empty state component when no item is selected
 * @returns {JSX.Element}
 */
const PropertyEditorEmptyState = () => {
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
};

export default PropertyEditorEmptyState;
