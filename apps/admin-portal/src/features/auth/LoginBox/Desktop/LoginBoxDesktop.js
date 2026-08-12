/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
import React from 'react';
import NextImage from 'next/image';
import styles from './LoginBoxDesktop.module.css';

/**
 * LoginBoxDesktop Component - Reusable login card for Admin Portal (Desktop)
 */
const LoginBoxDesktop = ({ 
  formData, 
  handleChange, 
  handleSubmit, 
  handleBiometricLogin,
  isLoading, 
  errorMsg 
}) => {
  return (
    <div className={styles.loginCard}>
      <div className={styles.header}>
        <h1 className={styles.logoText}>
          Cloud<span>Base</span>
        </h1>
        <p className={styles.subtitle}>Admin Portal Security Gate</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Cyber Security Alert Box - Sirf tab dikhega jab error aayega */}
        {errorMsg && (
          <div className={styles.errorAlert}>
            ⚠️ {errorMsg}
          </div>
        )}

        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="loginid">Login ID</label>
          <input
            type="text"
            id="loginid"
            name="loginid"
            className={styles.input}
            placeholder="Enter admin loginid"
            value={formData.loginid}
            onChange={handleChange}
            required
            autoComplete="off"
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            className={styles.input}
            placeholder="Enter secure password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" className={styles.submitBtn} disabled={isLoading} style={{ flex: 2 }}>
            {isLoading ? 'Verifying...' : 'Sign In to Console'}
          </button>
          
          <button 
            type="button" 
            onClick={handleBiometricLogin} 
            className={styles.submitBtn} 
            disabled={isLoading}
            style={{ 
              flex: 1, 
              background: '#1d2022', 
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Login with Biometrics"
          >
            {isLoading ? '...' : <NextImage src="/admin-images/fingerprint.png" priority width={24} height={24} alt="Biometric" style={{ filter: 'brightness(0) invert(1)' }} />}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginBoxDesktop;
