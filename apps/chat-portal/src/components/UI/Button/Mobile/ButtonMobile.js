'use client';

import styles from './ButtonMobile.module.css';

/**
 * ButtonMobile — Standardized Mobile Button Component
 * Supports variants: 'primary' (default), 'secondary', 'outline'
 */
export default function ButtonMobile({
  children,
  type = 'button',
  variant = 'primary',
  disabled = false,
  onClick,
  className = '',
  ...props
}) {
  const variantClass = styles[variant] || styles.primary;

  return (
    <button
      type={type}
      className={`${styles.button} ${variantClass} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
