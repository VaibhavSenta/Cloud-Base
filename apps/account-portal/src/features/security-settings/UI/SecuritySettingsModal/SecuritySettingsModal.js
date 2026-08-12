/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';
import FormButton from '@/features/personal-info/UI/FormButton/FormButton';
import SecurityFormFields from '../SecurityFormFields/SecurityFormFields';
import styles from './SecuritySettingsModal.module.css';

/**
 * Reusable Security Settings Modal Component (Desktop)
 * Encapsulates modal dialog structure, close button trigger, title area, and actions.
 */
export default function SecuritySettingsModal({
  isOpen,
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
  setFormVal,
  isPending,
  isVerifyRequestSent,
  handleCloseModal,
  handleSubmit
}) {
  if (!isOpen) return null;

  const getTitle = () => {
    switch (editField) {
      case 'email': return 'Email Verification';
      case 'phone': return 'Phone Setup';
      case '2fa': return 'Two-Factor Authentication';
      case 'deactivate': return 'Deactivate Account';
      case 'delete': return 'Delete Account';
      default: return '';
    }
  };

  const getSubtitle = () => {
    switch (editField) {
      case 'email':
        return user?.isEmailVerified ? 'Modify your primary contact and login email.' : 'Verify ownership of your account email.';
      case 'phone':
        return 'Verify your phone number using SMS verification.';
      case '2fa':
        return 'Choose an authentication channel to protect login sessions.';
      case 'deactivate':
        return 'Verify identity to temporarily lock your account.';
      case 'delete':
        return 'This action is irreversible. All databases will be wiped.';
      default:
        return '';
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleCloseModal}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>{getTitle()}</h3>
            <p className={styles.modalSubtitle}>{getSubtitle()}</p>
          </div>
          <button className={styles.modalCloseBtn} onClick={handleCloseModal}>✕</button>
        </div>

        {isVerifyRequestSent ? (
          <div className={styles.successWrapper}>
            <div className={styles.successIcon}>✓</div>
            <h4 className={styles.successTitle}>Verification Link Sent</h4>
            <p className={styles.successDescription}>
              A secure link has been sent to <strong>{user?.email}</strong>. Please check your inbox to complete the verification process.
            </p>
            <div className={styles.modalActions}>
              <FormButton variant="primary" onClick={handleCloseModal}>
                Done
              </FormButton>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.modalForm}>
            
            <SecurityFormFields
              editField={editField}
              user={user}
              formVal={formVal}
              handleInputChange={handleInputChange}
              isOtpSent={isOtpSent}
              authenticatorSetupData={authenticatorSetupData}
              authenticatorCode={authenticatorCode}
              setAuthenticatorCode={setAuthenticatorCode}
              verifyAuthenticatorMutation={verifyAuthenticatorMutation}
              setupAuthenticatorMutation={setupAuthenticatorMutation}
              isSupportSubmitted={isSupportSubmitted}
              setIsSupportSubmitted={setIsSupportSubmitted}
              errorMessage={errorMessage}
              setErrorMessage={setErrorMessage}
              setFormVal={setFormVal}
            />

            {/* Render actions ONLY if authenticator QR setup is NOT active */}
            {!authenticatorSetupData && (
              <div className={styles.modalActions}>
                <FormButton variant="secondary" onClick={handleCloseModal}>
                  Cancel
                </FormButton>
                <FormButton type="submit" variant="primary" disabled={isPending}>
                  {isPending ? 'Saving...' : 'Save'}
                </FormButton>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
