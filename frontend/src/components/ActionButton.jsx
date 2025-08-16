import React from 'react';
import './ActionButton.css';

/**
 * ActionButton component for mobile-friendly action buttons
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Icon to display
 * @param {string} props.label - Button label text
 * @param {function} props.onClick - Click handler
 * @param {string} props.variant - Button variant (primary, secondary, success, danger, warning, default)
 * @param {string} props.size - Button size (sm, md, lg)
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {boolean} props.fullWidth - Whether the button should take full width
 * @param {boolean} props.showIconOnly - Whether to show only the icon on mobile
 */
const ActionButton = ({ 
  icon, 
  label, 
  onClick, 
  variant = 'default', 
  size = 'md', 
  disabled = false,
  fullWidth = false,
  showIconOnly = false
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`action-button size-${size} variant-${variant} ${fullWidth ? 'full-width' : ''}`}
      aria-label={label}
    >
      {icon && <span className="button-icon">{icon}</span>}
      <span className={`button-label ${showIconOnly ? 'mobile-hidden' : ''}`}>{label}</span>
    </button>
  );
};

export default ActionButton;
