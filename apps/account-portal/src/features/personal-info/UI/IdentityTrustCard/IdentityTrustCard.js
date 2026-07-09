'use client';
import styles from './IdentityTrustCard.module.css';

/**
 * Presentation component for Identity & Trust Card (Column 1)
 */
export default function IdentityTrustCard() {
  return (
    <div className={styles.cardFront}>
      <h3 className={styles.cardTitle}>Identity & Trust</h3>
      <div className={styles.statusList}>
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>Verification Status</span>
          <span className={styles.statusValueActive}>Verified</span>
        </div>
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>Account Standard</span>
          <span className={styles.statusValue}>Decentralized</span>
        </div>
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>Identity Key</span>
          <span className={styles.statusValueSecure}>Secured via RSA-2048</span>
        </div>
      </div>
    </div>
  );
}
