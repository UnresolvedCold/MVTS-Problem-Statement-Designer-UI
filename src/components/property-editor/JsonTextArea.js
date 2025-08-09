// src/components/property-editor/JsonTextArea.js
import React, { useState, useEffect } from 'react';

/**
 * Component for editing JSON objects in textarea with real-time validation
 * @param {object} value - The value to edit
 * @param {function} onChange - Callback when value changes
 * @returns {JSX.Element}
 */
const JsonTextArea = ({ value, onChange }) => {
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
      style={{
        width: "100%",
        height: "60px",
        fontFamily: "monospace",
        fontSize: "11px",
        padding: "4px",
        border: hasError ? "1px solid #dc3545" : "1px solid #ccc",
        borderRadius: "3px",
        resize: "vertical",
        backgroundColor: hasError ? "#fff5f5" : "white"
      }}
    />
  );
};

export default JsonTextArea;
