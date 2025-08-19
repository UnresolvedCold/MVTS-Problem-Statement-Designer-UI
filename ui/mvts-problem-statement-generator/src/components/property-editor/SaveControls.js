// src/components/property-editor/SaveControls.js
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Save and Reset controls for property editor
 * @param {boolean} hasUnsavedChanges - Whether there are unsaved changes
 * @param {function} onSave - Callback when save button is clicked
 * @param {function} onReset - Callback when reset button is clicked
 * @param {boolean} jsonError - Whether there's a JSON error (disables save)
 * @returns {JSX.Element}
 */
const SaveControls = ({ hasUnsavedChanges, onSave, onReset, jsonError }) => {
  const { isDark } = useTheme();

  // Save button is enabled when there are changes and no JSON errors
  const canSave = hasUnsavedChanges && !jsonError;

  // Always show the controls if there are unsaved changes or JSON errors
  if (!hasUnsavedChanges && !jsonError) {
    return null;
  }

  return (
    <div className="mb-4 p-2.5 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded">
      <div className="text-xs text-yellow-800 dark:text-yellow-200 mb-2">
        {jsonError ? '❌ JSON Error - Fix errors before saving' : '⚠️ Unsaved Changes'}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onSave}
          disabled={!canSave}
          className={`py-2 px-4 border rounded cursor-pointer text-xs font-semibold transition-all ${
            canSave 
              ? 'bg-green-500 dark:bg-green-600 text-white border-green-500 dark:border-green-600 hover:bg-green-600 dark:hover:bg-green-700' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600 cursor-not-allowed'
          }`}
        >
          💾 Save
        </button>

        <button
          onClick={onReset}
          disabled={!hasUnsavedChanges}
          className={`py-2 px-4 border rounded cursor-pointer text-xs font-semibold transition-all ${
            hasUnsavedChanges 
              ? 'bg-red-500 dark:bg-red-600 text-white border-red-500 dark:border-red-600 hover:bg-red-600 dark:hover:bg-red-700' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600 cursor-not-allowed'
          }`}
        >
          🔄 Reset
        </button>
      </div>
    </div>
  );
};

export default SaveControls;
