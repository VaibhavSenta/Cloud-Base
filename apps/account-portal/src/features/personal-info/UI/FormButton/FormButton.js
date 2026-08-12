/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';
import styles from './FormButton.module.css';

/**
 * Reusable Form Button Component
 * Supports variants: 'primary' and 'secondary'.
 */
export default function FormButton({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${styles.btn} ${variant === 'primary' ? styles.btnPrimary : styles.btnSecondary}`}
    >
      {children}
    </button>
  );
}
