'use client';
import Link from 'next/link';
import styles from './SignupBoxMobile.module.css';
import Logo from '@/components/Logo/Logo';
import Input from '@/components/UI/Input/Input';
import Button from '@/components/UI/Button/Button';

const SignupBoxMobile = ({ formData, step, nextStep, prevStep, onChange, onSocialLogin, showSocialAuth, isLoading, error, isPartial }) => {
  return (
    <div className={styles.mobileContainer}>
      <main className={styles.mainContent}>
        <div className={styles.logoArea}>
          <Logo forceVersion="icon" />
        </div>

        <h1 className={styles.brandTitle}>Create Account</h1>
        <p className={styles.brandSubtitle}>Sign up to see photos and videos from your friends.</p>

        {error?.field === 'general' && (
          <div style={{ color: 'var(--error, #ff453a)', fontSize: '0.85rem', textAlign: 'center', marginBottom: '12px', fontWeight: '600', padding: '0 20px' }}>
            {error.message}
          </div>
        )}
        <div className={styles.stepContainer}>
          <div className={styles.slider} style={{ transform: `translateX(-${(step - 1) * 100}%)` }}>
            
            {/* STEP 1: USERNAME */}
            <div className={styles.stepPage}>
              <h2 className={styles.stepTitle}>Pick a username</h2>
              <p className={styles.stepSubtitle}>You can always change this later.</p>
              <Input 
                placeholder="Username"
                name="username"
                value={formData.username}
                onChange={onChange}
                error={error?.field === 'username' ? error.message : null}
              />
              <Button fullWidth onClick={nextStep} isLoading={isLoading}>Next</Button>
            </div>

            {/* STEP 2: EMAIL */}
            <div className={styles.stepPage}>
              <h2 className={styles.stepTitle}>Email address</h2>
              <p className={styles.stepSubtitle}>Used for security and OTP login.</p>
              <Input 
                placeholder="Email address"
                name="email"
                value={formData.email}
                onChange={onChange}
                error={error?.field === 'email' ? error.message : null}
              />
              <div className={styles.btnRow}>
                 <button className={styles.backBtn} onClick={prevStep}>Back</button>
                 <Button onClick={nextStep} isLoading={isLoading}>
                    {isPartial ? 'Finish' : 'Next'}
                 </Button>
              </div>
            </div>

            {/* STEP 3: NAMES */}
            {!isPartial && (
              <div className={styles.stepPage}>
                <h2 className={styles.stepTitle}>Your Name</h2>
                <p className={styles.stepSubtitle}>Tell us who you are.</p>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <Input 
                        placeholder="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={onChange}
                        error={error?.field === 'firstName' ? error.message : null}
                    />
                    <Input 
                        placeholder="Last Name (Optional)"
                        name="lastName"
                        value={formData.lastName}
                        onChange={onChange}
                    />
                </div>
                <div className={styles.btnRow}>
                  <button className={styles.backBtn} onClick={prevStep}>Back</button>
                  <Button onClick={nextStep} isLoading={isLoading}>Next</Button>
                </div>
              </div>
            )}

            {/* STEP 4: PASSWORD */}
            {!isPartial && (
              <div className={styles.stepPage}>
                <h2 className={styles.stepTitle}>Set Password</h2>
                <p className={styles.stepSubtitle}>Secure your Nothing Box account.</p>
                <Input 
                  type="password"
                  placeholder="Password"
                  name="password"
                  value={formData.password}
                  onChange={onChange}
                  error={error?.field === 'password' ? error.message : null}
                />
                <div className={styles.btnRow}>
                  <button className={styles.backBtn} onClick={prevStep}>Back</button>
                  <Button onClick={nextStep} isLoading={isLoading}>Create Account</Button>
                </div>
              </div>
            )}

          </div>
        </div>

        {step === 1 && (
          <p className={styles.terms}>
            By signing up, you agree to our <strong>Terms</strong>, <strong>Privacy Policy</strong> and <strong>Cookies Policy</strong>.
          </p>
        )}

        {showSocialAuth && (
          <div className={styles.socialAuthContainer} style={{ padding: '0 20px', width: 'auto' }}>
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
      </main>

      <footer className={styles.footerArea}>
        <div className={styles.loginBox}>
          Have an account? <Link href="/">Log in</Link>
        </div>
      </footer>
    </div>
  );
};

export default SignupBoxMobile;
