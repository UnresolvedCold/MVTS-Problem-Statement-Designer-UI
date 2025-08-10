// src/components/config/ConfigEditor.js
import React from 'react';

const ConfigEditor = ({ 
  editingConfig, 
  editValue, 
  onEditValueChange, 
  onSave, 
  onCancel, 
  isLoading 
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <textarea
        value={editValue}
        onChange={(e) => onEditValueChange(e.target.value)}
        style={{
          width: '100%',
          minHeight: '80px',
          padding: '8px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}
      />
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={onSave}
          disabled={isLoading}
          style={{
            padding: '6px 12px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '12px'
          }}
        >
          {isLoading ? 'Updating...' : 'Update'}
        </button>
        <button
          onClick={onCancel}
          disabled={isLoading}
          style={{
            padding: '6px 12px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '12px'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ConfigEditor;
