'use client';
import Link from 'next/link';
import styles from './LoginBoxTablet.module.css';
import Logo from '../../Logo/Logo';
import Input from '../../UI/Input/Input';
import Button from '../../UI/Button/Button';

const LoginBoxTablet = ({ 
  formData, 
  isPartial, 
  onChange, 
  onSubmit, 
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
    <div className={styles.container}>
      <div className={`${styles.glassCard} glass`}>
        {twoFactorRequired ? (
          <>
            <div className={styles.header}>
              <Logo forceVersion="full" />
              <h2 className={styles.title}>Two-Factor Verification</h2>
              <p className={styles.subtitle}>
                {selected2faMethod === 'email' 
                  ? "Enter the 6-digit code sent to your email address" 
                  : "Enter the 6-digit code from your Authenticator App"}
              </p>
            </div>

            <form onSubmit={onVerify2FA} className={styles.form}>
              {twoFactorError && (
                <p style={{ color: '#ff4d4d', fontSize: '0.78rem', margin: '0 0 12px 0', textAlign: 'center' }}>
                  {twoFactorError}
                </p>
              )}
              
              <Input 
                label="Verification Code"
                placeholder="000000"
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
          </>
        ) : (
          <>
            <div className={styles.header}>
              <Logo forceVersion="full" />
              <h2 className={styles.title}>Welcome Back</h2>
              <p className={styles.subtitle}>
                {isPartial ? "Please verify your account" : "Secure access to your Cloud-Base"}
              </p>
            </div>

            <form onSubmit={onSubmit} className={styles.form}>
              <Input 
                label="Account ID"
                placeholder="Username or Email"
                name="identifier"
                value={formData.identifier}
                onChange={onChange}
                error={error?.field === 'identifier' ? error.message : null}
              />

              {isPartial ? (
                <Input 
                  label="OTP Code"
                  placeholder="6-digit code"
                  name="otp"
                  value={formData.otp}
                  onChange={onChange}
                  error={error?.field === 'otp' ? error.message : null}
                />
              ) : (
                <Input 
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  name="password"
                  value={formData.password}
                  onChange={onChange}
                  error={error?.field === 'password' ? error.message : null}
                />
              )}

              <Button type="submit" fullWidth isLoading={isLoading}>
                {isPartial ? 'Send Verification Code' : 'Sign In'}
              </Button>
            </form>
          </>
        )}

        <div className={styles.footer}>
          <p>Don't have an account? <Link href="/signup">Join now</Link></p>
        </div>
      </div>
    </div>
  );
};

export default LoginBoxTablet;
