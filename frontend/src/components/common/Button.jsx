import React, { useState } from 'react';

const Button = ({ children, onClick, variant = 'primary', icon, style }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Define our color themes
  const variants = {
    primary: { // Your new Purple Theme
      background: 'linear-gradient(135deg, #9B6BAF 0%, #7A4D8F 100%)',
      boxShadow: '0 4px 15px rgba(122, 77, 143, 0.3)',
      color: 'white',
    },
    success: { // Green for "Identify"
      background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
      boxShadow: '0 4px 15px rgba(46, 125, 50, 0.3)',
      color: 'white',
    },
    danger: { // Red for "Remove"
      background: 'transparent',
      border: '2px solid #ff4d4d',
      color: '#ff4d4d',
      boxShadow: 'none',
    }
  };

  // Select the style based on the 'variant' prop
  const currentTheme = variants[variant] || variants.primary;

  const baseStyle = {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '50px', // Pill shape
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px', // Space between icon and text
    transition: 'all 0.3s ease',
    transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
    outline: 'none',
    ...currentTheme, // Merge theme styles
    ...style // Allow custom overrides
  };

  return (
    <button
      onClick={onClick}
      style={baseStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;