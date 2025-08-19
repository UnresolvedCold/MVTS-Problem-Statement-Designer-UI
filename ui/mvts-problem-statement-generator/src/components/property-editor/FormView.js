// src/components/property-editor/FormView.js
import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import FormField from './FormField';

/**
 * Form view for editing properties using form inputs
 * @param {object} formValues - Current form values
 * @param {function} onFieldChange - Callback when field value changes
 * @param {function} onNestedChange - Callback for nested field changes
 * @returns {JSX.Element}
 */
const FormView = ({ formValues, onFieldChange, onNestedChange }) => {
  const { isDark } = useTheme();
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
      <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-600">
        {!showAddField ? (
          <button
            onClick={() => setShowAddField(true)}
            className="w-full py-2 px-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded text-blue-600 dark:text-blue-400 cursor-pointer text-xs hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            ➕ Add New Field
          </button>
        ) : (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Field name"
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-xs"
            />
            <input
              type="text"
              placeholder="Field value (can be JSON)"
              value={newFieldValue}
              onChange={(e) => setNewFieldValue(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-xs"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddField}
                disabled={!newFieldName.trim()}
                className={`py-1 px-3 border rounded text-xs transition-colors ${
                  newFieldName.trim()
                    ? 'bg-green-500 dark:bg-green-600 text-white border-green-500 dark:border-green-600 hover:bg-green-600 dark:hover:bg-green-700'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600 cursor-not-allowed'
                }`}
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddField(false);
                  setNewFieldName('');
                  setNewFieldValue('');
                }}
                className="py-1 px-3 bg-gray-500 dark:bg-gray-600 text-white border border-gray-500 dark:border-gray-600 rounded text-xs hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors"
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
