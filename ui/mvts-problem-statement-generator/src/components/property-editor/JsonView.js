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
      <div className="mb-2.5">
        <label className="block mb-1.5 font-bold text-gray-900 dark:text-gray-100">
          Properties (JSON):
        </label>
        <textarea
          value={jsonEditValue}
          onChange={(e) => onJsonChange(e.target.value)}
          className={`w-full h-75 font-mono text-xs rounded p-2 resize-y bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors ${
            jsonError 
              ? 'border-2 border-red-500' 
              : 'border border-gray-300 dark:border-gray-600'
          }`}
        />
        {jsonError && (
          <div className="text-red-600 dark:text-red-400 text-xs mt-1.5 p-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded">
            JSON Error: {jsonError}
          </div>
        )}
      </div>
    </div>
  );
};

export default JsonView;
