'use client';
import Link from 'next/link';
import styles from './LoginBoxMobile.module.css';
import Logo from '../../Logo/Logo';
import Input from '../../UI/Input/Input';
import Button from '../../UI/Button/Button';

const LoginBoxMobile = ({ 
  formData, 
  isPartial, 
  onChange, 
  onSubmit, 
  onSocialLogin,
  showSocialAuth,
  isLoading, 
  error,
  twoFactorRequired,
  twoFactorData,
  selected2faMethod,
  setSelected2faMethod,
  twoFactorCode,
  setTwoFactorCode,
  twoFactorError,
  onVerify2FA,
  onCancel2FA
}) => {
  return (
    <div className={styles.mobileContainer}>
      <div className={styles.topBar}>
        <span className={styles.topText}>English (US)</span>
      </div>

      <main className={styles.mainContent}>
        <div className={styles.logoArea}>
          <Logo forceVersion="icon" />
        </div>

        {twoFactorRequired ? (
          <form onSubmit={onVerify2FA} className={styles.formArea}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', textAlign: 'center', marginBottom: '8px', color: '#ffffff' }}>
              Two-Factor Verification
            </h2>
            <p style={{ fontSize: '0.78rem', color: '#a8a8a8', textAlign: 'center', marginBottom: '16px', lineHeight: '1.4' }}>
              {selected2faMethod === 'email' 
                ? "Enter the 6-digit code sent to your email address" 
                : "Enter the 6-digit code from your Authenticator App"}
            </p>

            {twoFactorError && (
              <p style={{ color: '#ff4d4d', fontSize: '0.78rem', margin: '0 0 12px 0', textAlign: 'center' }}>
                {twoFactorError}
              </p>
            )}

            <Input 
              placeholder="Verification Code"
              name="twoFactorCode"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              maxLength={6}
              required
            />

            {twoFactorData?.methods?.email && twoFactorData?.methods?.authenticator && (
              <div style={{ textAlign: 'center', margin: '12px 0' }}>
                <button
                  type="button"
                  onClick={() => setSelected2faMethod(prev => prev === 'email' ? 'authenticator' : 'email')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0095f6',
                    fontSize: '0.78rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Verify using {selected2faMethod === 'email' ? 'Authenticator App' : 'Email OTP'} instead
                </button>
              </div>
            )}

            <Button type="submit" fullWidth isLoading={isLoading}>
              Verify Code
            </Button>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button
                type="button"
                onClick={onCancel2FA}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#888888',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                Back to Login
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={onSubmit} className={styles.formArea}>
            {error?.field === 'general' && <p className={styles.generalError}>{error.message}</p>}
            <Input 
              placeholder="Phone number, username, or email"
              name="identifier"
              value={formData.identifier}
              onChange={onChange}
              error={error?.field === 'identifier' ? error.message : null}
            />
            
            {isPartial ? (
              <Input 
                placeholder="6-digit verification code"
                name="otp"
                value={formData.otp}
                onChange={onChange}
                error={error?.field === 'otp' ? error.message : null}
              />
            ) : (
              <Input 
                type="password"
                placeholder="Password"
                name="password"
                value={formData.password}
                onChange={onChange}
                error={error?.field === 'password' ? error.message : null}
              />
            )}

            <Button type="submit" fullWidth isLoading={isLoading}>
              {isPartial ? 'Send Verification Code' : 'Log In'}
            </Button>

            <Link href="/forgot" className={styles.forgotLink}>Forgot password?</Link>

            {showSocialAuth && (
              <div className={styles.socialAuthContainer}>
                <div className={styles.divider}>
                  <span className={styles.dividerLine}></span>
                  <span className={styles.dividerText}>or</span>
                  <span className={styles.dividerLine}></span>
                </div>
                <div className={styles.socialButtons}>
                  <button type="button" className={styles.socialBtn} onClick={() => onSocialLogin('google', null, { email: 'mockgoogle@gmail.com', name: 'Google User' })}>
                    Continue with Google
                  </button>
                  <button type="button" className={styles.socialBtn} onClick={() => onSocialLogin('apple', null, { email: 'mockapple@icloud.com', name: 'Apple User' })}>
                    Continue with Apple
                  </button>
                  <button type="button" className={styles.socialBtn} onClick={() => onSocialLogin('facebook', null, { email: 'mockfacebook@fb.com', name: 'Facebook User' })}>
                    Continue with Facebook
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </main>

      <footer className={styles.footerArea}>
        <div className={styles.signupBox}>
          Don't have an account? <Link href="/signup">Sign up</Link>
        </div>
        <div className={styles.mobileLegal}>
          <Link href="/about">About</Link>
          <span>•</span>
          <Link href="/contact">Contact</Link>
          <span>•</span>
          <Link href="/privacy">Privacy</Link>
          <span>•</span>
          <Link href="/terms">Terms</Link>
        </div>
        <div className={styles.fromCloud}>
          <span>from</span>
          <p className={styles.cloudText}>CLOUD-BASE</p>
        </div>
      </footer>
    </div>
  );
};

export default LoginBoxMobile;
