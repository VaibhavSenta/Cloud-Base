'use client';

import BottomBar from '@/components/BottomBar/BottomBar';
import VaultLayout from '@/components/VaultLayout/VaultLayout';
import styles from './vault.module.css';

export default function StandaloneVaultPage() {
  return (
    <main className={styles.container}>
      <VaultLayout />
      <BottomBar />
    </main>
  );
}
