'use client';
import SuccessOverlay from '../../UI/SuccessOverlay/SuccessOverlay';
import InfoModal from '../../UI/InfoModal/InfoModal';
import styles from './TwoFactorSettingsDesktop.module.css';

export default function TwoFactorSettingsDesktop({
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
      <header className={styles.header}>
        <h1 className={styles.title}>Two-Factor Authentication</h1>
        <p className={styles.subtitle}>Enforce an extra layer of safety and security of your account.</p>
      </header>

      <div className={styles.contentGrid}>
        <div className={`${styles.settingsCard} glass`}>
          {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}

          <div className={styles.form}>
            {authenticatorSetupData ? (
              <div className={styles.setupContainer}>
                <h3 className={styles.setupTitle}>Setup Authenticator App</h3>
                <p className={styles.setupSubtitle}>
                  Please scan the QR code or enter the secret key below inside your Google Authenticator app:
                </p>
                
                {authenticatorSetupData.qrCodeUrl && (
                  <div style={{ display: 'flex', justifyContent: 'center', margin: '0.5rem 0' }}>
                    <img 
                      src={authenticatorSetupData.qrCodeUrl} 
                      alt="2FA QR Code" 
                      style={{ background: '#ffffff', padding: '10px', borderRadius: '12px', width: '160px', height: '160px' }}
                    />
                  </div>
                )}

                <div className={styles.secretBox}>
                  <span className={styles.secretLabel}>Secret Key</span>
                  <span className={styles.secretValue}>{authenticatorSetupData.secret}</span>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Enter 6-Digit Code</label>
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
                    {verifyAuthenticatorMutation.isPending ? 'Verifying...' : 'Verify and Enable'}
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
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
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
                        {/* Email Verification toggle */}
                        <div className={styles.toggleRowNested}>
                          <div>
                            <span className={styles.labelNested}>Email Verification</span>
                            <p className={styles.subtextNested}>Send OTP codes to your primary email address.</p>
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

                        {/* Authenticator App toggle */}
                        <div className={styles.toggleRowNested}>
                          <div>
                            <span className={styles.labelNested}>Authenticator App</span>
                            <p className={styles.subtextNested}>Use standard TOTP apps to generate validation keys.</p>
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
              </>
            )}
          </div>
        </div>
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
