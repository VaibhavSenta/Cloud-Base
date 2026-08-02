'use client';

import { useState } from 'react';
import styles from './AuthScreenMobile.module.css';

export default function AuthScreenMobile({
  initialStage = 'auth',
  onAuthenticate,
  onCheckUsername,
  onCreateProfile,
  loading,
  error,
  clearError,
  onSSOLogin
}) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [stage, setStage] = useState(initialStage); // stages: 'auth', 'username'
  const [username, setUsername] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameError, setUsernameError] = useState('');

  const handleLoginClick = () => {
    // SSO: Redirect to account.localhost for centralized login
    if (onSSOLogin) {
      onSSOLogin();
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    
    clearError();
    const success = await onAuthenticate(false, email, password);
    if (success) {
      // New signup moves directly to username choice stage
      setStage('username');
    }
  };

  const handleUsernameValidate = async () => {
    if (username.trim().length < 3) {
      setUsernameError('Username must be at least 3 characters.');
      return;
    }
    
    setUsernameChecking(true);
    setUsernameError('');
    try {
      const isAvailable = await onCheckUsername(username);
      setUsernameAvailable(isAvailable);
      if (!isAvailable) {
        setUsernameError('Username is already taken.');
      }
    } catch (err) {
      setUsernameError('Error checking username availability.');
    } finally {
      setUsernameChecking(false);
    }
  };

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    if (!usernameAvailable || usernameChecking) return;

    clearError();
    await onCreateProfile(username);
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    clearError();
  };

  return (
    <div className={styles.wrapper}>
      {stage === 'auth' ? (
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>
              {isLogin ? 'Cloud-Base Chat' : 'Instant Sign-up'}
            </h1>
            <p className={styles.subtitle}>
              {isLogin 
                ? 'Login via your Cloud-Base account to access messenger' 
                : 'Create an account to start secure messaging'}
            </p>
          </div>

          {isLogin ? (
            /* SSO Login Mode — Single button redirect to account.localhost */
            <div className={styles.formGroup}>
              <button 
                type="button" 
                className={styles.actionButton} 
                onClick={handleLoginClick}
                disabled={loading}
              >
                {loading ? 'Redirecting...' : 'Login with Cloud-Base Account'}
              </button>

              <p className={styles.ssoHint}>
                You will be redirected to account.cloudbase.local to sign in securely.
              </p>
            </div>
          ) : (
            /* Instant Signup Mode — In-app form */
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

              <button type="submit" className={styles.actionButton} disabled={loading}>
                {loading ? 'Creating Account...' : 'Instant Sign-up'}
              </button>
            </form>
          )}

          <div className={styles.footer}>
            <button className={styles.toggleText} onClick={toggleAuthMode} disabled={loading}>
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>Choose Username</h1>
            <p className={styles.subtitle}>Choose your unique Chat name and generate handshake keys</p>
          </div>

          <form onSubmit={handleUsernameSubmit} className={styles.formGroup}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Username (e.g. vaibhav)"
                className={styles.inputField}
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameAvailable(null);
                  setUsernameError('');
                }}
                required
                disabled={loading}
              />
              <button 
                type="button" 
                className={styles.actionButton} 
                style={{ width: 'auto', padding: '12px 18px', background: '#111111', border: '1px solid #222222' }}
                onClick={handleUsernameValidate}
                disabled={usernameChecking || loading || !username}
              >
                {usernameChecking ? '...' : 'Check'}
              </button>
            </div>

            {usernameError && <div className={styles.errorMessage}>{usernameError}</div>}
            {usernameAvailable && <div style={{ color: '#0095f6', fontSize: '0.75rem', textAlign: 'center' }}>Username is available!</div>}
            {error && <div className={styles.errorMessage}>{error}</div>}

            <button 
              type="submit" 
              className={styles.actionButton} 
              disabled={loading || !usernameAvailable}
            >
              {loading ? 'Generating Handshake Keys...' : 'Create Chat Profile'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

