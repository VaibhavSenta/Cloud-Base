'use client';
import FormInput from '@/features/personal-info/UI/FormInput/FormInput';
import FormSelect from '@/features/personal-info/UI/FormSelect/FormSelect';
import FormButton from '@/features/personal-info/UI/FormButton/FormButton';
import styles from './SecurityFormFields.module.css';

/**
 * Reusable Security Form Fields Component
 * Renders all form fields for Email verify, SMS verification, MFA setups, and account states.
 * Shared across both Desktop Modal and Mobile Bottom Sheet components.
 */
export default function SecurityFormFields({
  editField,
  user,
  formVal,
  handleInputChange,
  isOtpSent,
  authenticatorSetupData,
  authenticatorCode,
  setAuthenticatorCode,
  verifyAuthenticatorMutation,
  setupAuthenticatorMutation,
  isSupportSubmitted,
  setIsSupportSubmitted,
  errorMessage,
  setErrorMessage,
  setFormVal
}) {
  return (
    <>
      {errorMessage && (
        errorMessage === 'UNSUPPORTED_REGION' ? (
          <div className={styles.errorSupportBox}>
            {isSupportSubmitted ? (
              <p className={styles.successSupportText}>
                ✓ Request logged. Our operations team has received your country review request.
              </p>
            ) : (
              <>
                <p className={styles.errorSupportTitle}>
                  SMS Region Restriction Active
                </p>
                <p className={styles.errorSupportDesc}>
                  This region is currently not supported for SMS verification. Please submit your review request below:
                </p>
                <textarea
                  placeholder="Briefly state your region support requirement..."
                  value={formVal.supportFeedback || ''}
                  onChange={(e) => setFormVal(prev => ({ ...prev, supportFeedback: e.target.value }))}
                  className={styles.supportTextarea}
                />
                <div className={styles.supportActions}>
                  <FormButton
                    variant="primary"
                    onClick={() => setIsSupportSubmitted(true)}
                  >
                    Submit Review
                  </FormButton>
                  <FormButton
                    variant="secondary"
                    onClick={() => {
                      setErrorMessage('');
                      setIsSupportSubmitted(false);
                    }}
                  >
                    Cancel
                  </FormButton>
                </div>
              </>
            )}
          </div>
        ) : (
          <p className={styles.errorText}>{errorMessage}</p>
        )
      )}

      {/* EMAIL FIELDS */}
      {editField === 'email' && (
        <div className={styles.fieldBody}>
          {user?.isEmailVerified ? (
            <FormInput
              label="New Email Address"
              type="email"
              name="newEmail"
              value={formVal.newEmail}
              onChange={handleInputChange}
              placeholder="name@example.com"
              required
            />
          ) : user?.emailVerificationExpires && new Date(user.emailVerificationExpires) > new Date() ? (
            <p className={styles.helpText}>
              A verification link is currently active and was sent to <strong>{user?.email}</strong>. Please check your inbox. If you did not receive it, you can request a new link below.
            </p>
          ) : (
            <p className={styles.helpText}>
              We will send a secure verification link to <strong>{user?.email}</strong>. Clicking the link will verify and unlock all features of your Cloud-Base account.
            </p>
          )}
        </div>
      )}

      {/* PHONE FIELDS */}
      {editField === 'phone' && (
        <div className={styles.fieldBody}>
          {!isOtpSent ? (
            <div className={styles.phoneInputRow}>
              <div className={styles.phoneSelectWrapper}>
                <FormSelect
                  label="Code"
                  name="countryCode"
                  value={formVal.countryCode || '+91'}
                  onChange={handleInputChange}
                  options={[
                    { value: '+91', label: 'IND (+91)' },
                    { value: '+1', label: 'USA (+1)' },
                    { value: '+971', label: 'ARE (+971)' }
                  ]}
                />
              </div>
              <div className={styles.phoneFieldWrapper}>
                <FormInput
                  label="Phone Number"
                  type="tel"
                  name="phonenumberRaw"
                  value={formVal.phonenumberRaw}
                  onChange={handleInputChange}
                  placeholder="99999 99999"
                  required
                />
              </div>
            </div>
          ) : (
            <FormInput
              label="Enter 6-digit OTP Code"
              type="text"
              name="otpCode"
              value={formVal.otpCode}
              onChange={handleInputChange}
              placeholder="000000"
              required
            />
          )}
        </div>
      )}

      {/* PASSWORD FIELDS (Mobile only) */}
      {editField === 'password' && (
        <div className={styles.fieldBody}>
          <FormInput
            label="Current Password"
            type="password"
            name="currentPassword"
            value={formVal.currentPassword}
            onChange={handleInputChange}
            required
          />
          <FormInput
            label="New Password"
            type="password"
            name="newPassword"
            value={formVal.newPassword}
            onChange={handleInputChange}
            required
          />
          <FormInput
            label="Confirm New Password"
            type="password"
            name="confirmPassword"
            value={formVal.confirmPassword}
            onChange={handleInputChange}
            required
          />
        </div>
      )}

      {/* 2FA SETUP FIELDS */}
      {editField === '2fa' && (
        <div className={styles.fieldBody}>
          {authenticatorSetupData ? (
            <div className={styles.authenticatorSetupBox}>
              <p className={styles.authenticatorTitle}>
                Setup Authenticator App
              </p>
              <p className={styles.authenticatorDesc}>
                Enter this secret key in your authenticator app (like Google Authenticator):
              </p>
              <div className={styles.secretKeyBox}>
                {authenticatorSetupData.secret}
              </div>
              <FormInput
                label="Enter 6-digit Code"
                type="text"
                value={authenticatorCode}
                onChange={(e) => setAuthenticatorCode(e.target.value)}
                placeholder="000000"
                required
              />
              <div className={styles.authenticatorActions}>
                <FormButton
                  variant="primary"
                  onClick={() => verifyAuthenticatorMutation.mutate(authenticatorCode)}
                  disabled={verifyAuthenticatorMutation.isPending}
                >
                  {verifyAuthenticatorMutation.isPending ? 'Verifying...' : 'Verify and Enable'}
                </FormButton>
                <FormButton
                  variant="secondary"
                  onClick={() => {
                    setAuthenticatorSetupData(null);
                    setAuthenticatorCode('');
                    setFormVal(prev => ({ ...prev, 'twoFactorMethods.authenticator': false }));
                  }}
                >
                  Cancel
                </FormButton>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.toggleRow}>
                <div>
                  <p className={styles.toggleTitle}>
                    Enable Two-Factor Authentication
                  </p>
                  <p className={styles.toggleDesc}>
                    Secure account logins with a secondary validation step.
                  </p>
                </div>
                <input 
                  type="checkbox"
                  checked={formVal.twoFactorEnabled || false}
                  onChange={(e) => setFormVal(prev => ({ ...prev, twoFactorEnabled: e.target.checked }))}
                  className={styles.checkbox}
                />
              </div>

              {formVal.twoFactorEnabled && (
                <div className={styles.mfaOptionsList}>
                  <label className={styles.inputLabel}>Verification Methods</label>
                  
                  {/* Email Method Toggle */}
                  <div className={styles.toggleRow}>
                    <div>
                      <p className={styles.toggleMethodTitle}>
                        Email Verification
                      </p>
                      <p className={styles.toggleDesc}>
                        Send OTP to your registered email address.
                      </p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={formVal['twoFactorMethods.email'] || false}
                      onChange={(e) => setFormVal(prev => ({ ...prev, 'twoFactorMethods.email': e.target.checked }))}
                      className={styles.checkboxSmall}
                    />
                  </div>

                  {/* Authenticator Method Toggle */}
                  <div className={styles.toggleRow}>
                    <div>
                      <p className={styles.toggleMethodTitle}>
                        Google Authenticator App
                      </p>
                      <p className={styles.toggleDesc}>
                        Use an authenticator app to generate codes.
                      </p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={formVal['twoFactorMethods.authenticator'] || false}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        if (checked && !user?.authenticatorSecret) {
                          setupAuthenticatorMutation.mutate();
                        } else {
                          setFormVal(prev => ({ ...prev, 'twoFactorMethods.authenticator': checked }));
                        }
                      }}
                      className={styles.checkboxSmall}
                    />
                  </div>

                  {/* Primary Method Selector */}
                  <FormSelect
                    label="Primary Verification Channel"
                    name="twoFactorPrimary"
                    value={formVal.twoFactorPrimary || 'email'}
                    onChange={handleInputChange}
                    options={[
                      { value: 'email', label: 'Email OTP Code' },
                      ...( ( (formVal['twoFactorMethods.authenticator'] && user?.authenticatorSecret) || setupAuthenticatorMutation.isPending ) 
                        ? [{ value: 'authenticator', label: 'Google Authenticator App' }] 
                        : [] )
                    ]}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ACCOUNT DEACTIVATION / DELETION DETAILS */}
      {(editField === 'deactivate' || editField === 'delete') && (
        <div className={styles.fieldBody}>
          <div className={styles.warningInfoBox}>
            <span className={styles.warningHeader}>
              {editField === 'delete' ? 'Permanent Account Deletion Warning' : 'Account Deactivation Info'}
            </span>
            <div className={styles.warningText}>
              {editField === 'delete' ? (
                <p style={{ margin: 0 }}>
                  This is a permanent action under <strong>GDPR Article 17 (Right to Erasure)</strong>. 
                  Your account will be deactivated immediately and all active sessions will be terminated. 
                  Your personal data will be completely deleted from our database after a <strong>3-day grace period</strong>. 
                  You can cancel deletion and reactivate by logging in before the grace period ends.
                </p>
              ) : (
                <p style={{ margin: 0 }}>
                  Deactivating your account will temporarily disable it and revoke all active sessions. 
                  Your profile information and data logs will be archived securely in compliance with privacy regulations. 
                  You can reactivate your account at any time by simply logging in again.
                </p>
              )}
            </div>
          </div>
          <FormInput
            label="Enter Account Password"
            type="password"
            name="password"
            value={formVal.password || ''}
            onChange={handleInputChange}
            placeholder="••••••••••••"
            required
          />
          <FormInput
            label={`Type ${editField.toUpperCase()} to confirm`}
            type="text"
            name="confirmText"
            value={formVal.confirmText || ''}
            onChange={handleInputChange}
            placeholder={editField.toUpperCase()}
            required
          />
        </div>
      )}
    </>
  );
}
