'use client';

import React from 'react';
import styles from './Switch.module.css';

/**
 * Reusable Switch Toggle Component for CloudBase Admin
 * @param {boolean} checked - Current state
 * @param {function} onChange - Handler for toggle
 * @param {boolean} disabled - Disable the switch
 * @param {boolean} loading - Show loading/processing state
 * @param {string} className - Extra classes
 * @param {string} size - 'small' or 'default'
 */
const Switch = ({ checked, onChange, disabled, loading, className = '', size = 'default' }) => {
  const sizeClass = size === 'small' ? styles.small : '';

  return (
    <div className={`${styles.switchWrapper} ${loading ? styles.loading : ''} ${sizeClass}`}>
      <label className={`${styles.switch} ${className}`}>
        <input 
          type="checkbox" 
          checked={checked || false} 
          onChange={onChange} 
          disabled={disabled || loading}
        />
        <span className={styles.slider}></span>
      </label>
      {loading && <span className={styles.processingText}>Processing...</span>}
    </div>
  );
};

export default Switch;
