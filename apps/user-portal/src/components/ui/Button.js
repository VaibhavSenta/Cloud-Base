'use client';
import './Button.css'; // CSS import karna mat bhoolna

export default function Button({ children, onClick, variant = 'primary', className = '' }) {
  
  // Mapping variants to CSS classes
  const variantClass = {
    primary: 'btn-primary',
    outline: 'btn-outline',
    danger: 'btn-danger'
  };

  return (
    <button 
      onClick={onClick} 
      className={`btn ${variantClass[variant]} ${className}`}
    >
      {children}
    </button>
  );
}