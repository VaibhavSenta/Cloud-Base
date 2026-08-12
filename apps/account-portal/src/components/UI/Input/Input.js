/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';
import { useState } from 'react';
import styles from './Input.module.css';

const Input = ({ label, type = 'text', placeholder, value, onChange, name, error }) => {
  return (
    <div className={`${styles.inputGroup} ${error ? 'shake' : ''}`}>
      {label && <label className={styles.label}>{label}</label>}
      <input 
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        name={name}
      />
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};

export default Input;
