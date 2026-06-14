'use client';
import styles from './Button.module.css';

const Button = ({ children, onClick, type = 'button', variant = 'primary', isLoading = false, fullWidth = false }) => {
  return (
    <button 
      className={`${styles.button} ${styles[variant]} ${fullWidth ? styles.fullWidth : ''}`}
      onClick={onClick}
      type={type}
      disabled={isLoading}
    >
      {isLoading ? <span className={styles.loader}></span> : children}
    </button>
  );
};

export default Button;
