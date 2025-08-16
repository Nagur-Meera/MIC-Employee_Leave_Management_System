import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './MobileNavigation.css';

/**
 * Bottom mobile navigation bar component
 * 
 * @param {Object} props
 * @param {Array} props.items - Navigation items
 * @param {string} props.role - User role (admin, hod, employee)
 */
const MobileNavigation = ({ items, role = 'employee' }) => {
  const location = useLocation();
  
  // Check if path is active
  const isActive = (path) => {
    return location.pathname.includes(path);
  };
  
  // Get theme color based on role
  const getThemeColor = () => {
    switch (role) {
      case 'admin':
        return 'var(--mic-bright-red)';
      case 'hod':
        return 'var(--mic-deep-blue)';
      case 'employee':
        return 'var(--mic-logo-green)';
      default:
        return 'var(--mic-deep-blue)';
    }
  };

  return (
    <nav className="mobile-bottom-nav">
      {items.map((item) => (
        <Link
          key={item.name}
          to={item.href}
          className={`mobile-nav-item ${isActive(item.href) ? 'active' : ''}`}
          style={{ color: isActive(item.href) ? getThemeColor() : undefined }}
        >
          <span className="mobile-nav-icon">
            {item.icon && <item.icon size={20} />}
          </span>
          <span className="mobile-nav-text">{item.name}</span>
        </Link>
      ))}
    </nav>
  );
};

export default MobileNavigation;
