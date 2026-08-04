'use client';

import { useState } from 'react';
import styles from './LoginBoxMobile.module.css';
import Button from '@/components/UI/Button/Button';

export default function LoginBoxMobile({
  onSSOLogin,
  onAuthenticate,
  loading,
  error,
  clearError
}) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    if (clearError) clearError();
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    await onAuthenticate(false, email, password);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            {isLogin ? 'Cloud-Base' : 'Create Account'}
          </h1>
          <p className={styles.subtitle}>
            {isLogin
              ? 'Login via your Cloud-Base account to access messenger'
              : 'Sign up to start secure end-to-end encrypted messaging'}
          </p>
        </div>

        {isLogin ? (
          <div className={styles.formGroup}>
            {error && <div className={styles.errorMessage}>{error}</div>}

            <Button
              type="button"
              onClick={onSSOLogin}
              disabled={loading}
            >
              {loading ? 'Redirecting...' : 'Login with Cloud-Base Account'}
            </Button>

            <p className={styles.ssoHint}>
              You will be redirected to account.cloudbase.local to sign in securely.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSignupSubmit} className={styles.formGroup}>
            <input
              type="email"
              placeholder="Email"
              className={styles.inputField}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Password"
              className={styles.inputField}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            
            {error && <div className={styles.errorMessage}>{error}</div>}

            <Button type="submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Instant Sign-up'}
            </Button>
          </form>
        )}

        <div className={styles.footer}>
          <button className={styles.toggleText} onClick={toggleAuthMode} disabled={loading}>
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
}
