// src/components/property-editor/PropertyEditorHeader.js
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Header component for PropertyEditor with title, close button, and item info
 * @param {function} onClose - Callback when close button is clicked
 * @param {boolean} isTask - Whether editing a task or object
 * @param {object} currentItem - The current item being edited
 * @returns {JSX.Element}
 */
const PropertyEditorHeader = ({ onClose, isTask, isAssignment, currentItem }) => {
  const { isDark } = useTheme();

  return (
    <>
      <div className="flex justify-between items-center">
        <h3 className="text-gray-900 dark:text-gray-100">Property Editor</h3>
        <button
          onClick={onClose}
          className="bg-none border-none text-lg cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          ×
        </button>
      </div>
      
      <div className="mb-2.5 text-gray-700 dark:text-gray-300">
        <strong>Selected:</strong> {
          isTask 
            ? `${currentItem.task_type || 'Task'} (ID: ${currentItem.properties.task_key || currentItem.id})`
            : isAssignment
            ? `Assignment: ${currentItem.task_key || currentItem.properties?.task_key || 'N/A'}`
            : `${currentItem.type} (ID: ${currentItem.id})`
        }
      </div>
    </>
  );
};

export default PropertyEditorHeader;
