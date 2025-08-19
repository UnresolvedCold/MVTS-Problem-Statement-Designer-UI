// src/components/property-editor/ModeToggle.js
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Toggle buttons for switching between form and JSON edit modes
 * @param {string} editMode - Current edit mode ('form' or 'json')
 * @param {function} onModeChange - Callback when mode changes
 * @returns {JSX.Element}
 */
const ModeToggle = ({ editMode, onModeChange }) => {
  const { isDark } = useTheme();

  return (
    <div className="mb-4">
      <button
        onClick={() => onModeChange('form')}
        className={`py-1.5 px-3 border border-gray-300 dark:border-gray-600 rounded cursor-pointer text-xs mr-1.5 transition-colors ${
          editMode === 'form' 
            ? 'bg-blue-500 dark:bg-blue-600 text-white' 
            : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600'
        }`}
      >
        Form View
      </button>
      <button
        onClick={() => onModeChange('json')}
        className={`py-1.5 px-3 border border-gray-300 dark:border-gray-600 rounded cursor-pointer text-xs transition-colors ${
          editMode === 'json' 
            ? 'bg-blue-500 dark:bg-blue-600 text-white' 
            : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600'
        }`}
      >
        JSON View
      </button>
    </div>
  );
};

export default ModeToggle;
