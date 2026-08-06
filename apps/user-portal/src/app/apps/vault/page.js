'use client';

import BottomBar from '@/components/BottomBar/BottomBar';
import styles from './vault.module.css';

export default function StandaloneVaultPage() {
  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Playground & Vault</h1>
        <p className={styles.subtitle}>Secure vault module is under development.</p>
      </div>
      <BottomBar />
    </main>
  );
}
