'use client';
import Link from 'next/link';
import styles from './LoginBoxMobile.module.css';
import Logo from '@/components/Logo/Logo';
import Input from '@/components/UI/Input/Input';
import Button from '@/components/UI/Button/Button';
import OtpInput from '@/components/UI/OtpInput/OtpInput';

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
  onCancel2FA,
  onResend2FA,
  resendCooldown,
  resendStatus
}) => {
  return (
    <div className={styles.mobileContainer}>
      <div className={styles.topBar}>
        <span className={styles.topText}>English (US)</span>
      </div>

      <main className={styles.mainContent}>
        <div className={styles.logoArea}>
          <Logo forceVersion="icon" theme="monochrome" />
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

            <OtpInput 
              value={twoFactorCode}
              onChange={setTwoFactorCode}
              error={twoFactorError}
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

            {selected2faMethod === 'email' && (
              <div style={{ textAlign: 'center', margin: '12px 0' }}>
                <button
                  type="button"
                  onClick={onResend2FA}
                  disabled={resendCooldown > 0 || resendStatus === 'sending'}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: resendCooldown > 0 ? '#555555' : '#0095f6',
                    fontSize: '0.78rem',
                    fontWeight: 'bold',
                    cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  {resendStatus === 'sending' ? 'Sending...' : 
                   resendStatus === 'success' ? 'Code Sent! ✓' : 
                   resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : 'Resend Code'}
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
              <OtpInput 
                value={formData.otp}
                onChange={(val) => onChange({ target: { name: 'otp', value: val } })}
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
          <p className={styles.cloudText}>NOTHING BOX</p>
        </div>
      </footer>
    </div>
  );
};

export default LoginBoxMobile;
