/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';
import styles from './Button.module.css';

const Button = ({ children, onClick, type = 'button', variant = 'primary', isLoading = false, disabled = false, fullWidth = false, style }) => {
  return (
    <button 
      className={`${styles.button} ${styles[variant]} ${fullWidth ? styles.fullWidth : ''}`}
      onClick={onClick}
      type={type}
      disabled={disabled || isLoading}
      style={style}
    >
      {isLoading ? <span className={styles.loader}></span> : children}
    </button>
  );
};

export default Button;
