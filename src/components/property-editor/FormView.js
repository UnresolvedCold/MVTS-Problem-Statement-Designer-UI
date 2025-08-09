// src/components/property-editor/FormView.js
import React from 'react';
import FormField from './FormField';

/**
 * Form view for editing properties using form inputs
 * @param {object} formValues - Current form values
 * @param {function} onFieldChange - Callback when field value changes
 * @param {function} onNestedChange - Callback for nested field changes
 * @returns {JSX.Element}
 */
const FormView = ({ formValues, onFieldChange, onNestedChange }) => {
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
    </div>
  );
};

export default FormView;
