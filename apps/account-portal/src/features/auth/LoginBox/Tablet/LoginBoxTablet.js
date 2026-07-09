'use client';
import Link from 'next/link';
import styles from './LoginBoxTablet.module.css';
import Logo from '@/components/Logo/Logo';
import Input from '@/components/UI/Input/Input';
import Button from '@/components/UI/Button/Button';
import OtpInput from '@/components/UI/OtpInput/OtpInput';

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
  onCancel2FA,
  onResend2FA,
  resendCooldown,
  resendStatus
}) => {
  return (
    <div className={styles.container}>
      <div className={`${styles.glassCard} glass`}>
        {twoFactorRequired ? (
          <>
            <div className={styles.header}>
              <Logo forceVersion="full" theme="monochrome" className={styles.logo} />
              <h2 className={styles.title}>Two-Factor Verification</h2>
              <p className={styles.subtitle}>
                {selected2faMethod === 'email' 
                  ? "Enter the 6-digit code sent to your email address" 
                  : "Enter the 6-digit code from your Authenticator App"}
              </p>
            </div>

            <form onSubmit={onVerify2FA} className={styles.form}>
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
          </>
        ) : (
          <>
            <div className={styles.header}>
              <Logo forceVersion="full" theme="monochrome" className={styles.logo} />
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
                <OtpInput 
                  value={formData.otp}
                  onChange={(val) => onChange({ target: { name: 'otp', value: val } })}
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
