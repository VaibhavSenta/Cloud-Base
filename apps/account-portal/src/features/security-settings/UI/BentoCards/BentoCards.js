'use client';
import styles from './BentoCards.module.css';

/**
 * Bento Block 1: Identity Settings (spans 2 columns)
 */
export function IdentityVerificationCard({ user, onEditClick }) {
  return (
    <div className={`${styles.bentoCard} ${styles.span2}`}>
      <div className={styles.cardHeaderArea}>
        <span className={styles.cardCategory}>Primary Access</span>
        <h2 className={styles.cardTitle}>Identity & Verification</h2>
      </div>
      
      <div className={styles.interactiveRows}>
        {/* Email Verification Row */}
        <div className={styles.rowItem} onClick={() => onEditClick('email')}>
          <div className={styles.rowMeta}>
            <span className={styles.rowLabel}>Email Address</span>
            <span className={styles.rowValue}>{user?.email}</span>
          </div>
          <div className={styles.rowControls}>
            {user?.isEmailVerified ? (
              <span className={styles.statusBadgeGreen}>Verified</span>
            ) : (
              <span className={styles.statusBadgeRed}>Unverified</span>
            )}
            <span className={styles.actionLink}>Modify</span>
          </div>
        </div>

        {/* Mobile Number Verification Row */}
        <div className={styles.rowItem} onClick={() => onEditClick('phone')}>
          <div className={styles.rowMeta}>
            <span className={styles.rowLabel}>Mobile Number</span>
            <span className={styles.rowValue}>{user?.phonenumber || 'Not added to profile'}</span>
          </div>
          <div className={styles.rowControls}>
            {user?.phonenumber ? (
              <span className={styles.statusBadgeGreen}>Verified</span>
            ) : (
              <span className={styles.statusBadgeOrange}>Action Required</span>
            )}
            <span className={styles.actionLink}>Modify</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Bento Block 2: Password Hub
 */
export function PasswordHubCard({ onManageClick }) {
  return (
    <div className={styles.bentoCard} onClick={onManageClick}>
      <div className={styles.cardHeaderArea}>
        <span className={styles.cardCategory}>Authentication</span>
        <h2 className={styles.cardTitle}>Password Hub</h2>
      </div>
      <div className={styles.passwordPreviewArea}>
        <div className={styles.maskedPassword}>••••••••••••</div>
        <p className={styles.cardInlineDesc}>Configure secondary decryption rules and reveal options.</p>
      </div>
      <div className={styles.cardFooterArea}>
        <span className={styles.cardFooterLink}>Manage Password Options ›</span>
      </div>
    </div>
  );
}

/**
 * Bento Block 3: Two-Factor Settings
 */
export function MultifactorAuthCard({ user, onConfigureClick }) {
  const getPrimaryMethodLabel = () => {
    if (!user?.twoFactorEnabled) return 'Disabled';
    if (user.twoFactorPrimary === 'authenticator') return 'Google Authenticator (Default)';
    return 'Email OTP (Default)';
  };

  return (
    <div className={styles.bentoCard} onClick={onConfigureClick}>
      <div className={styles.cardHeaderArea}>
        <span className={styles.cardCategory}>Session Security</span>
        <h2 className={styles.cardTitle}>Multifactor Auth</h2>
      </div>
      <div className={styles.mfaStatusArea}>
        <div className={styles.mfaIndicator}>
          {user?.twoFactorEnabled && <span className={styles.statusDotActive}></span>}
          <span className={styles.mfaStatusText}>{getPrimaryMethodLabel()}</span>
        </div>
        <p className={styles.cardInlineDesc}>Add an extra layer of encryption verification during sign-in.</p>
      </div>
      <div className={styles.cardFooterArea}>
        <span className={styles.cardFooterLink}>Configure 2FA ›</span>
      </div>
    </div>
  );
}

/**
 * Bento Block 4: Recent Security Activity
 */
export function RecentActivityCard({ onViewClick }) {
  return (
    <div className={styles.bentoCard} onClick={onViewClick}>
      <div className={styles.cardHeaderArea}>
        <span className={styles.cardCategory}>Audit Logs</span>
        <h2 className={styles.cardTitle}>Recent Activity</h2>
      </div>
      <div className={styles.activityStatsArea}>
        <div className={styles.activeStandard}>RSA-2048 & AES-256</div>
        <p className={styles.cardInlineDesc}>Inspect real-time handshake records and login coordinates.</p>
      </div>
      <div className={styles.cardFooterArea}>
        <span className={styles.cardFooterLink}>View Audit Log ›</span>
      </div>
    </div>
  );
}

/**
 * Bento Block 5: Danger Zone
 */
export function DangerZoneCard({ onDeactivateClick, onDeleteClick }) {
  return (
    <div className={`${styles.bentoCard} ${styles.cardDanger}`}>
      <div className={styles.cardHeaderArea}>
        <span className={styles.cardCategoryDanger}>Account Control</span>
        <h2 className={styles.cardTitleDanger}>Danger Zone</h2>
      </div>
      <div className={styles.dangerZoneRows}>
        <div className={styles.dangerRow} onClick={onDeactivateClick}>
          <span className={styles.dangerRowLabel}>Deactivate Account</span>
          <span className={styles.dangerActionText}>Disable</span>
        </div>
        <div className={styles.dangerRow} onClick={onDeleteClick}>
          <span className={styles.dangerRowLabel}>Delete Account Permanently</span>
          <span className={styles.dangerActionText}>Wipe Vault</span>
        </div>
      </div>
    </div>
  );
}
