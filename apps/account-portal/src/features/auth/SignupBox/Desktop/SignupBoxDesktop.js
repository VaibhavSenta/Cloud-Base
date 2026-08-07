'use client';
import Link from 'next/link';
import styles from './SignupBoxDesktop.module.css';
import Logo from '@/components/Logo/Logo';
import Input from '@/components/UI/Input/Input';
import Button from '@/components/UI/Button/Button';

const SignupBoxDesktop = ({ formData, step, nextStep, prevStep, onChange, onSocialLogin, showSocialAuth, isLoading, error, isPartial }) => {
  return (
    <div className={styles.container}>
      <div className={`${styles.glassCard} glass`}>
        <div className={styles.header}>
          <Logo forceVersion="full" />
          <h2 className={styles.title}>
            {step === 1 && "Pick a username"}
            {step === 2 && "Enter your email"}
            {step === 3 && "Tell us your name"}
            {step === 4 && "Secure your account"}
          </h2>
          <p className={styles.subtitle}>Step {step} of {isPartial ? 2 : 4}</p>
        </div>

        <div className={styles.formContainer}>
            {error?.field === 'general' && (
                <div style={{ color: 'var(--error, #ff453a)', fontSize: '0.85rem', textAlign: 'center', marginBottom: '12px', fontWeight: '600' }}>
                  {error.message}
                </div>
            )}
            {step === 1 && (
                <Input 
                    label="Username"
                    placeholder="johndoe123"
                    name="username"
                    value={formData.username}
                    onChange={onChange}
                    error={error?.field === 'username' ? error.message : null}
                />
            )}
            {step === 2 && (
                <Input 
                    label="Email Address"
                    type="email"
                    placeholder="john@example.com"
                    name="email"
                    value={formData.email}
                    onChange={onChange}
                    error={error?.field === 'email' ? error.message : null}
                />
            )}
            {step === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <Input 
                        label="First Name"
                        placeholder="John"
                        name="firstName"
                        value={formData.firstName}
                        onChange={onChange}
                        error={error?.field === 'firstName' ? error.message : null}
                    />
                    <Input 
                        label="Last Name"
                        placeholder="Doe"
                        name="lastName"
                        value={formData.lastName}
                        onChange={onChange}
                    />
                </div>
            )}
            {step === 4 && (
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

            <div className={styles.actionRow}>
                {step > 1 && <button className={styles.backBtn} onClick={prevStep}>Back</button>}
                <Button onClick={nextStep} isLoading={isLoading} fullWidth={step === 1}>
                    {step === (isPartial ? 2 : 4) ? 'Create Account' : 'Continue'}
                </Button>
            </div>
        </div>

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

        <div className={styles.footer}>
          <p>Already have an account? <Link href="/">Log in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SignupBoxDesktop;
