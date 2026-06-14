'use client';
import Link from 'next/link';
import styles from './LoginBoxTablet.module.css';
import Logo from '../../Logo/Logo';
import Input from '../../UI/Input/Input';
import Button from '../../UI/Button/Button';

const LoginBoxTablet = ({ formData, isPartial, onChange, onSubmit, isLoading, error }) => {
  return (
    <div className={styles.container}>
      <div className={`${styles.glassCard} glass`}>
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

        <div className={styles.footer}>
          <p>Don't have an account? <Link href="/signup">Join now</Link></p>
        </div>
      </div>
    </div>
  );
};

export default LoginBoxTablet;
