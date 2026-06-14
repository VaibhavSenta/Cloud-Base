'use client';
import Link from 'next/link';
import styles from './LoginBoxMobile.module.css';
import Logo from '../../Logo/Logo';
import Input from '../../UI/Input/Input';
import Button from '../../UI/Button/Button';

const LoginBoxMobile = ({ formData, isPartial, onChange, onSubmit, isLoading, error }) => {
  return (
    <div className={styles.mobileContainer}>
      <div className={styles.topBar}>
        <span className={styles.topText}>English (US)</span>
      </div>

      <main className={styles.mainContent}>
        <div className={styles.logoArea}>
          <Logo forceVersion="icon" />
        </div>

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
        </form>
      </main>

      <footer className={styles.footerArea}>
        <div className={styles.signupBox}>
          Don't have an account? <Link href="/signup">Sign up</Link>
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
