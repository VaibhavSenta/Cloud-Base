/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import styles from './ActiveChatHeader.module.css';

export default function ActiveChatHeader({
  activeConv,
  setActiveConv
}) {
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <button className={styles.backBtn} onClick={() => setActiveConv(null)} title="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.backArrow}>
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
      </div>

      <h1 className={styles.headerTitle}>
        @{activeConv.partner?.chatUsername || 'User'}
      </h1>

      <div className={styles.headerRight}>
        <button className={styles.moreBtn} onClick={() => console.log('More options clicked')}>
          ...
        </button>
      </div>
    </header>
  );
}
