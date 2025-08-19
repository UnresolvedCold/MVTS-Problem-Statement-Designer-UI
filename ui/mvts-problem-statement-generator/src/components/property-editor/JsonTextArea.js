// src/components/property-editor/JsonTextArea.js
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Component for editing JSON objects in textarea with real-time validation
 * @param {object} value - The value to edit
 * @param {function} onChange - Callback when value changes
 * @returns {JSX.Element}
 */
const JsonTextArea = ({ value, onChange, placeholder }) => {
  const { isDark } = useTheme();
  const [textValue, setTextValue] = useState(JSON.stringify(value, null, 2));
  const [hasError, setHasError] = useState(false);

  // Update text value when the actual value changes from outside
  useEffect(() => {
    setTextValue(JSON.stringify(value, null, 2));
    setHasError(false);
  }, [value]);

  const handleChange = (e) => {
    const newTextValue = e.target.value;
    setTextValue(newTextValue); // Always update the display
    
    try {
      const parsed = JSON.parse(newTextValue);
      setHasError(false);
      onChange(parsed); // Only update the actual value if JSON is valid
    } catch (error) {
      setHasError(true);
      // Don't update the parent value while there's a JSON error
    }
  };

  return (
    <textarea
      value={textValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={`w-full h-15 font-mono text-xs p-1 rounded resize-y transition-colors ${
        hasError 
          ? 'border border-red-500 bg-red-50 dark:bg-red-900/20' 
          : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
      } text-gray-900 dark:text-gray-100`}
    />
  );
};

export default JsonTextArea;
