/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
import styles from './SuccessOverlay.module.css';

export default function SuccessOverlay({ show, text }) {
  if (!show) return null;
  return (
    <div className={styles.successOverlay}>
      <div className={styles.successBox}>
        <svg className={styles.checkmark} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
          <circle className={styles.checkmarkCircle} cx="26" cy="26" r="25" fill="none"/>
          <path className={styles.checkmarkCheck} fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
        </svg>
        <span className={styles.successTextOverlay}>{text}</span>
      </div>
    </div>
  );
}
