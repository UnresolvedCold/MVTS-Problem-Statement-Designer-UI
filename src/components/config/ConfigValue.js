// src/components/config/ConfigValue.js
import React from 'react';
import ConfigEditor from './ConfigEditor';

const ConfigValue = ({ 
  configKey, 
  value, 
  isEditing, 
  editValue,
  onEdit,
  onEditValueChange,
  onSave,
  onCancel,
  isLoading,
  editingConfig
}) => {
  if (isEditing) {
    return (
      <ConfigEditor
        editingConfig={editingConfig}
        editValue={editValue}
        onEditValueChange={onEditValueChange}
        onSave={onSave}
        onCancel={onCancel}
        isLoading={isLoading}
      />
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
      <div style={{ flex: 1, wordBreak: 'break-word' }}>
        <div style={{ 
          margin: 0, 
          fontFamily: 'monospace', 
          fontSize: '12px',
          backgroundColor: '#f8f9fa',
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #e9ecef',
          wordBreak: 'break-all'
        }}>
          {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
        </div>
      </div>
      <button
        onClick={() => onEdit(configKey, value)}
        disabled={isLoading || editingConfig !== null}
        style={{
          padding: '4px 8px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '3px',
          cursor: (isLoading || editingConfig !== null) ? 'not-allowed' : 'pointer',
          fontSize: '11px',
          flexShrink: 0
        }}
      >
        Edit
      </button>
    </div>
  );
};

export default ConfigValue;
