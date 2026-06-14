'use client';
import Link from 'next/link';
import styles from './SignupBoxTablet.module.css';
import Logo from '../../Logo/Logo';
import Input from '../../UI/Input/Input';
import Button from '../../UI/Button/Button';

const SignupBoxTablet = ({ formData, step, nextStep, prevStep, onChange, isLoading, error, isPartial }) => {
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

        <div className={styles.footer}>
          <p>Already have an account? <Link href="/">Log in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SignupBoxTablet;
