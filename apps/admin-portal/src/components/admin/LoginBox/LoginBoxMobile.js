import React from 'react';
import NextImage from 'next/image';
import styles from './LoginBoxMobile.module.css';

/**
 * LoginBoxMobile - Compact, distraction-free login for mobile
 */
const LoginBoxMobile = ({ 
  formData, 
  handleChange, 
  handleSubmit, 
  handleBiometricLogin,
  isLoading, 
  errorMsg 
}) => {
  return (
    <div className={styles.mobileBox}>
      <div className={styles.header}>
        <h2 className={styles.logo}>Cloud<span>Base</span></h2>
        <p className={styles.tagline}>Secure Console Login</p>
      </div>

      <br />

      <form className={styles.form} onSubmit={handleSubmit}>
        {errorMsg && (
          <div className={styles.errorBanner}>
            {errorMsg}
          </div>
        )}

        <div className={styles.field}>
          <input
            type="text"
            name="loginid"
            placeholder="Login ID"
            className={styles.input}
            value={formData.loginid}
            onChange={handleChange}
            required
            autoComplete="off"
          />
        </div>

        <div className={styles.field}>
          <input
            type="password"
            name="password"
            placeholder="Password"
            className={styles.input}
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" className={styles.btn} disabled={isLoading} style={{ flex: 1 }}>
            {isLoading ? 'Wait...' : 'Sign In'}
          </button>
          <button 
            type="button" 
            onClick={handleBiometricLogin} 
            className={styles.btn} 
            disabled={isLoading}
            style={{ 
              width: '56px', 
              background: '#1d2022', 
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isLoading ? '...' : <NextImage src="/admin-images/fingerprint.png" priority width={22} height={22} alt="Biometric" style={{ filter: 'brightness(0) invert(1)' }} />}
          </button>
        </div>
      </form>
      
      <p className={styles.footer}>Protected by CloudBase Perimeter</p>
    </div>
  );
};

export default LoginBoxMobile;
