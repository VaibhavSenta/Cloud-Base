/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import styles from './DefaultHeader.module.css';
import { triggerHaptic } from '@/utils/haptics';

export default function DefaultHeader({
  title,
  onBack,
  rightContent = null
}) {
  const handleBackClick = () => {
    triggerHaptic.selection();
    if (onBack) onBack();
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <button className={styles.backBtn} onClick={handleBackClick} title="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.backArrow}>
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
      </div>

      <h1 className={styles.headerTitle}>
        {title}
      </h1>

      <div className={styles.headerRight}>
        {rightContent}
      </div>
    </header>
  );
}
