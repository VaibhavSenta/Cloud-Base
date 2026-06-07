import React from 'react';
import styles from './LoginBoxDesktop.module.css';

/**
 * LoginBoxDesktop Component - Reusable login card for Admin Portal (Desktop)
 */
const LoginBoxDesktop = ({ 
  formData, 
  handleChange, 
  handleSubmit, 
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

        <button type="submit" className={styles.submitBtn} disabled={isLoading}>
          {isLoading ? 'Verifying Credentials...' : 'Sign In to Console'}
        </button>
      </form>
    </div>
  );
};

export default LoginBoxDesktop;
