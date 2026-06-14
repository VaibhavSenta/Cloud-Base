'use client';
import Link from 'next/link';
import styles from './LoginBoxDesktop.module.css';
import Logo from '../../Logo/Logo';
import Input from '../../UI/Input/Input';
import Button from '../../UI/Button/Button';

const LoginBoxDesktop = ({ formData, isPartial, onChange, onSubmit, isLoading, error }) => {
  return (
    <div className={styles.container}>
      <div className={`${styles.glassCard} glass`}>
        <div className={styles.header}>
          <Logo forceVersion="full" />
          <h2 className={styles.title}>Welcome Back</h2>
          <p className={styles.subtitle}>
            {isPartial ? "Enter the code sent to your email" : "Sign in to access your cloud hub"}
          </p>
        </div>

        <form onSubmit={onSubmit} className={styles.form}>
          <Input 
            label="Email or Username"
            placeholder="john.doe@example.com"
            name="identifier"
            value={formData.identifier}
            onChange={onChange}
            error={error?.field === 'identifier' ? error.message : null}
          />

          {isPartial ? (
             <Input 
                label="Verification Code"
                placeholder="6-digit OTP"
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

          {!isPartial && (
            <div className={styles.options}>
                <label className={styles.rememberMe}>
                <input type="checkbox" /> Remember me
                </label>
                <Link href="/forgot" className={styles.forgotPass}>Forgot password?</Link>
            </div>
          )}

          <Button type="submit" fullWidth isLoading={isLoading}>
            {isPartial ? 'Send Verification Code' : 'Sign In'}
          </Button>
        </form>

        <div className={styles.footer}>
          <p>Don't have an account? <Link href="/signup">Create one</Link></p>
          <div className={styles.legal}>
            <Link href="/privacy">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginBoxDesktop;
