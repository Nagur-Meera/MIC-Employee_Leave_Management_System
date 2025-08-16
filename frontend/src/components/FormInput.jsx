import React from 'react';
import './FormInput.css';

/**
 * Mobile-friendly form input component
 * 
 * @param {Object} props
 * @param {string} props.label - Input label
 * @param {string} props.type - Input type (text, email, password, etc.)
 * @param {string} props.name - Input name attribute
 * @param {string} props.id - Input id attribute
 * @param {string} props.value - Input value
 * @param {function} props.onChange - Change handler
 * @param {string} props.placeholder - Input placeholder
 * @param {boolean} props.required - Whether the input is required
 * @param {boolean} props.disabled - Whether the input is disabled
 * @param {string} props.error - Error message to display
 * @param {React.ReactNode} props.icon - Optional icon to display
 * @param {string} props.helpText - Helper text to display below the input
 * @param {boolean} props.fullWidth - Whether the input should take full width
 */
const FormInput = ({ 
  label,
  type = 'text',
  name,
  id,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  icon,
  helpText,
  fullWidth = true
}) => {
  return (
    <div className={`form-input-container ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="required-indicator">*</span>}
        </label>
      )}
      
      <div className={`input-wrapper ${error ? 'has-error' : ''} ${icon ? 'has-icon' : ''}`}>
        {icon && <div className="input-icon">{icon}</div>}
        <input
          type={type}
          name={name}
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`form-input ${error ? 'input-error' : ''}`}
        />
      </div>
      
      {helpText && !error && <div className="help-text">{helpText}</div>}
      {error && <div className="error-text">{error}</div>}
    </div>
  );
};

export default FormInput;
