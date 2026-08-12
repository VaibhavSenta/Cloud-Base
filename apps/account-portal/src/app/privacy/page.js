/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';
import Link from 'next/link';
import styles from '../public-pages.module.css';
import Logo from '../../components/Logo/Logo';

export default function PrivacyPage() {
  return (
    <div className={styles.container}>
      <Logo forceVersion="icon" />

      <div className={styles.card}>
        <header className={styles.header}>
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.subtitle}>Effective Date: June 29, 2026</p>
        </header>

        <div className={styles.content}>
          <p>
            At Nothing Box, privacy is not just a policy; it is the fundamental core of our architectural design. This Privacy Policy outlines how your data is secured and managed across the Nothing Box ecosystem.
          </p>

          <h3>1. Data Sovereignty & Decryption Keys</h3>
          <p>
            We operate on a zero-knowledge architecture. We do not store, access, or decrypt your personal files. Your encryption keys are stored solely in-memory (RAM) inside your browser session and are destroyed automatically when you close your browser tab.
          </p>

          <h3>2. On-The-Wire Transport Security</h3>
          <p>
            All sensitive API communication (such as credentials, profile updates, and settings) is protected using a hybrid cryptography handshake. Incoming requests are encrypted locally in your browser using AES symmetric keys, and the AES keys themselves are wrapped using asymmetric RSA 2048-bit keys before transmission.
          </p>

          <h3>3. Memory Cache Encryption</h3>
          <p>
            To prevent client-side exploits and developer console sniffing, all cached profile information loaded in the React Query state is encrypted in-memory (RAM) inside the browser. At no point is plain text user data cached on your local disk storage.
          </p>

          <h3>4. Storage Integrations</h3>
          <p>
            When you connect personal storage services (such as Google Drive), assets are saved directly to your cloud instance. Personal assets and images are stored in an encrypted format and decrypted locally inside your browser, ensuring absolute third-party privacy.
          </p>
        </div>

        <div className={styles.footer}>
          <Link href="/" className={styles.backBtn}>
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
