// src/components/property-editor/FormField.js
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
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
  // Always allow editing any field - no restrictions
  
  if (typeof value === 'boolean') {
    return (
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          className="m-0"
        />
        <span className="text-xs text-gray-600 dark:text-gray-400">{value ? 'True' : 'False'}</span>
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
        className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
        className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        placeholder="Enter text"
      />
    );
  }
  
  if (typeof value === 'object' && value !== null) {
    // Handle coordinate objects with x, y properties
    if (value.hasOwnProperty('x') && value.hasOwnProperty('y')) {
      return (
        <div className="flex gap-1.5">
          <div className="flex-1">
            <label className="text-xs text-gray-600 dark:text-gray-400">X:</label>
            <input
              type="number"
              value={value.x || 0}
              onChange={(e) => onNestedChange(fieldKey, 'x', Number(e.target.value))}
              className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-600 dark:text-gray-400">Y:</label>
            <input
              type="number"
              value={value.y || 0}
              onChange={(e) => onNestedChange(fieldKey, 'y', Number(e.target.value))}
              className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      );
    }
    
    // Handle aisle_info objects 
    if (value.hasOwnProperty('aisle_id') || value.hasOwnProperty('aisle_coordinate')) {
      return (
        <div className="flex flex-col gap-1.5">
          {value.hasOwnProperty('aisle_id') && (
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">Aisle ID:</label>
              <input
                type="number"
                value={value.aisle_id || 0}
                onChange={(e) => onNestedChange(fieldKey, 'aisle_id', Number(e.target.value))}
                className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          )}
          {value.hasOwnProperty('aisle_coordinate') && Array.isArray(value.aisle_coordinate) && (
            <div className="flex gap-1.5">
              <div className="flex-1">
                <label className="text-xs text-gray-600 dark:text-gray-400">X:</label>
                <input
                  type="number"
                  value={value.aisle_coordinate[0] || 0}
                  onChange={(e) => {
                    const newCoordinate = [...(value.aisle_coordinate || [0, 0])];
                    newCoordinate[0] = Number(e.target.value);
                    onNestedChange(fieldKey, 'aisle_coordinate', newCoordinate);
                  }}
                  className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-600 dark:text-gray-400">Y:</label>
                <input
                  type="number"
                  value={value.aisle_coordinate[1] || 0}
                  onChange={(e) => {
                    const newCoordinate = [...(value.aisle_coordinate || [0, 0])];
                    newCoordinate[1] = Number(e.target.value);
                    onNestedChange(fieldKey, 'aisle_coordinate', newCoordinate);
                  }}
                  className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
    <input
      type="text"
      value={String(value)}
      onChange={(e) => {
        // Try to parse as number first
        const numValue = Number(e.target.value);
        if (!isNaN(numValue) && e.target.value !== '') {
          onChange(numValue);
        } else if (e.target.value === 'true' || e.target.value === 'false') {
          onChange(e.target.value === 'true');
        } else {
          onChange(e.target.value);
        }
      }}
      className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      placeholder="Enter value"
    />
  );
};

/**
 * Complete form field with label and input
 */
const FormField = ({ fieldKey, value, onChange, onNestedChange }) => {

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <label className="block text-xs font-medium text-gray-900 dark:text-gray-100">
          {fieldKey}:
        </label>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {typeof value}
        </span>
      </div>
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
