import React from 'react';
import styles from './LoginBoxMobile.module.css';

/**
 * LoginBoxMobile - Compact, distraction-free login for mobile
 */
const LoginBoxMobile = ({ 
  formData, 
  handleChange, 
  handleSubmit, 
  isLoading, 
  errorMsg 
}) => {
  return (
    <div className={styles.mobileBox}>
      <div className={styles.header}>
        <h2 className={styles.logo}>Cloud<span>Base</span></h2>
        <p className={styles.tagline}>Secure Console Login</p>
      </div>

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

        <button type="submit" className={styles.btn} disabled={isLoading}>
          {isLoading ? 'Verifying...' : 'Sign In'}
        </button>
      </form>
      
      <p className={styles.footer}>Protected by CloudBase Perimeter</p>
    </div>
  );
};

export default LoginBoxMobile;
