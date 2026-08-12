/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import BottomBar from '@/components/BottomBar/BottomBar';
import styles from './account.module.css';

export default function StandaloneAccountPage() {
  return (
    <main className={styles.container}>
      <iframe
        src="http://account.nothingbox.site"
        className={styles.iframe}
        title="Nothing Box Account"
        allow="clipboard-read; clipboard-write"
      />
      <BottomBar />
    </main>
  );
}
