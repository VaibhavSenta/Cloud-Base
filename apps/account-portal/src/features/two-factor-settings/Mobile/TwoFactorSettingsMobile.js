'use client';
import SuccessOverlay from '@/components/UI/SuccessOverlay/SuccessOverlay';
import InfoModal from '@/components/UI/InfoModal/InfoModal';
import Image from 'next/image';
import PageHeader from '@/components/UI/PageHeader/PageHeader';
import styles from './TwoFactorSettingsMobile.module.css';

export default function TwoFactorSettingsMobile({
  user,
  formVal,
  setFormVal,
  errorMessage,
  setErrorMessage,
  infoModalData,
  setInfoModalData,
  showSuccessOverlay,
  successOverlayText,
  authenticatorSetupData,
  setAuthenticatorSetupData,
  authenticatorCode,
  setAuthenticatorCode,
  setupAuthenticatorMutation,
  verifyAuthenticatorMutation,
  handleAutoSave,
  router
}) {
  return (
    <div className={styles.container}>
      <PageHeader 
        title="Two-Factor Authentication"
        subtitle="Enforce an extra layer of safety and security of your account."
      />

      {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}

      <div className={styles.form}>
        {authenticatorSetupData ? (
          <div className={styles.setupCard}>
            <h3 className={styles.setupTitle}>Setup Authenticator App</h3>
            <p className={styles.setupText}>
              Scan the QR code or enter this secret key inside your authenticator application (Google Authenticator / Duo):
            </p>
            {authenticatorSetupData.qrCodeUrl && (
              <div style={{ display: 'flex', justifyContent: 'center', margin: '0.5rem 0' }}>
                <Image 
                  src={authenticatorSetupData.qrCodeUrl} 
                  alt="2FA QR Code" 
                  width={160}
                  height={160}
                  unoptimized
                  style={{ background: '#ffffff', padding: '10px', borderRadius: '12px' }}
                />
              </div>
            )}
            <div className={styles.secretKey}>
              {authenticatorSetupData.secret}
            </div>
            
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Enter 6-digit verification code</label>
              <input 
                type="text" 
                value={authenticatorCode}
                onChange={(e) => setAuthenticatorCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
                className={styles.inputField}
                required
              />
            </div>

            <div className={styles.setupActions}>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => verifyAuthenticatorMutation.mutate(authenticatorCode)}
                disabled={verifyAuthenticatorMutation.isPending}
              >
                {verifyAuthenticatorMutation.isPending ? 'Verifying...' : 'Verify & Enable'}
              </button>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => {
                  setAuthenticatorSetupData(null);
                  setAuthenticatorCode('');
                  setFormVal(prev => ({ ...prev, 'twoFactorMethods.authenticator': false }));
                }}
              >
                Cancel Setup
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.settingsWrapper}>
            {user && !user.isEmailVerified ? (
              <div className={styles.warningCard}>
                <span className={styles.warningTitle}>Email Verification Required</span>
                <p className={styles.warningText}>
                  Please verify your email address to enable automatic two-factor authentication and secure your account.
                </p>
                <button 
                  type="button" 
                  className={styles.btnPrimary} 
                  style={{ width: '100%' }}
                  onClick={() => router.push('/dashboard/security')}
                >
                  Verify Email
                </button>
              </div>
            ) : (
              <>
                <div className={styles.configArea}>
                  <label className={styles.sectionLabel}>Verification Methods</label>

                  <div className={styles.methodsList}>
                    {/* Email Verification Option */}
                    <div className={styles.toggleRow}>
                      <div className={styles.toggleText}>
                        <span className={styles.label}>Email Verification</span>
                        <p className={styles.subtext}>Receive verification code at your registered email address.</p>
                      </div>
                      <label className={styles.switch}>
                        <input 
                          type="checkbox"
                          checked={true}
                          onChange={() => {
                            setInfoModalData({
                              title: "Security Requirement",
                              message: "Email verification is required to maintain a baseline of security for your account. It cannot be disabled."
                            });
                          }}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>

                    {/* Authenticator App Option */}
                    <div className={styles.toggleRow}>
                      <div className={styles.toggleText}>
                        <span className={styles.label}>Authenticator App</span>
                        <p className={styles.subtext}>Use authentication app to generate verification keys.</p>
                      </div>
                      <label className={styles.switch}>
                        <input 
                          type="checkbox"
                          checked={formVal['twoFactorMethods.authenticator'] || false}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            if (checked) {
                              if (!user?.authenticatorSecret) {
                                setupAuthenticatorMutation.mutate();
                              } else {
                                setFormVal(prev => ({ ...prev, 'twoFactorMethods.authenticator': true }));
                                handleAutoSave({ authenticator: true });
                              }
                            } else {
                              setFormVal(prev => ({ ...prev, 'twoFactorMethods.authenticator': false }));
                              handleAutoSave({ authenticator: false });
                            }
                          }}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                  </div>
                  {/* Primary Method Selector */}
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Primary Authentication Method</label>
                    <select
                      value={formVal.twoFactorPrimary || 'email'}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormVal(prev => ({ ...prev, twoFactorPrimary: val }));
                        handleAutoSave({ primary: val });
                      }}
                      className={styles.select}
                    >
                      <option value="email">Email Verification</option>
                      {((formVal['twoFactorMethods.authenticator'] && user?.authenticatorSecret) || setupAuthenticatorMutation.isPending) && (
                        <option value="authenticator">Authenticator App</option>
                      )}
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <SuccessOverlay show={showSuccessOverlay} text={successOverlayText} />
      <InfoModal 
        isOpen={!!infoModalData}
        title={infoModalData?.title}
        message={infoModalData?.message}
        onClose={() => setInfoModalData(null)}
      />
    </div>
  );
}
