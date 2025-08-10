// src/components/property-editor/FormView.js
import React, { useState } from 'react';
import FormField from './FormField';

/**
 * Form view for editing properties using form inputs
 * @param {object} formValues - Current form values
 * @param {function} onFieldChange - Callback when field value changes
 * @param {function} onNestedChange - Callback for nested field changes
 * @returns {JSX.Element}
 */
const FormView = ({ formValues, onFieldChange, onNestedChange }) => {
  const [showAddField, setShowAddField] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');

  const handleAddField = () => {
    if (newFieldName.trim()) {
      // Try to parse the value as JSON first, fallback to string
      let parsedValue;
      try {
        parsedValue = JSON.parse(newFieldValue);
      } catch {
        parsedValue = newFieldValue;
      }
      
      onFieldChange(newFieldName.trim(), parsedValue);
      setNewFieldName('');
      setNewFieldValue('');
      setShowAddField(false);
    }
  };

  return (
    <div>
      {Object.entries(formValues).map(([key, value]) => (
        <FormField
          key={key}
          fieldKey={key}
          value={value}
          onChange={(newValue) => onFieldChange(key, newValue)}
          onNestedChange={onNestedChange}
        />
      ))}
      
      {/* Add new field section */}
      <div style={{ 
        marginTop: '20px', 
        paddingTop: '15px', 
        borderTop: '1px solid #e9ecef' 
      }}>
        {!showAddField ? (
          <button
            onClick={() => setShowAddField(true)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              width: '100%'
            }}
          >
            + Add Field
          </button>
        ) : (
          <div style={{ 
            backgroundColor: '#f8f9fa',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #dee2e6'
          }}>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '12px', 
                fontWeight: 'bold',
                marginBottom: '4px' 
              }}>
                Field Name:
              </label>
              <input
                type="text"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                placeholder="Enter field name"
                style={{
                  width: '100%',
                  padding: '4px',
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  fontSize: '12px'
                }}
              />
            </div>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '12px', 
                fontWeight: 'bold',
                marginBottom: '4px' 
              }}>
                Field Value:
              </label>
              <input
                type="text"
                value={newFieldValue}
                onChange={(e) => setNewFieldValue(e.target.value)}
                placeholder="Enter value (JSON format for complex types)"
                style={{
                  width: '100%',
                  padding: '4px',
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  fontSize: '12px'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={handleAddField}
                disabled={!newFieldName.trim()}
                style={{
                  padding: '4px 8px',
                  backgroundColor: newFieldName.trim() ? '#28a745' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: newFieldName.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '11px'
                }}
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddField(false);
                  setNewFieldName('');
                  setNewFieldValue('');
                }}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormView;
