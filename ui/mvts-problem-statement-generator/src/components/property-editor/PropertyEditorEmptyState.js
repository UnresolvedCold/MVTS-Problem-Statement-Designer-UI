// src/components/property-editor/PropertyEditorEmptyState.js
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Empty state component when no item is selected
 * @returns {JSX.Element}
 */
const PropertyEditorEmptyState = () => {
  return (
    <div className="w-75 p-2.5 border-l border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
      <h3 className="text-gray-900 dark:text-gray-100">Property Editor</h3>
      <p className="text-gray-600 dark:text-gray-400 italic">
        Select an object to edit its properties
      </p>
    </div>
  );
};

export default PropertyEditorEmptyState;
