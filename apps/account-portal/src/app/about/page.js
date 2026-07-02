'use client';
import Link from 'next/link';
import styles from '../public-pages.module.css';
import Logo from '../../components/Logo/Logo';

export default function AboutPage() {
  return (
    <div className={styles.container}>
      <Logo forceVersion="icon" />

      <div className={styles.card}>
        <header className={styles.header}>
          <h1 className={styles.title}>About Cloud-Base</h1>
          <p className={styles.subtitle}>The Zen-Luxury Secure Personal Portal</p>
        </header>

        <div className={styles.content}>
          <p>
            Cloud-Base is designed with a singular, uncompromised focus: to return absolute digital sovereignty, privacy, and peace of mind back to the user. We believe that your personal identity and digital footprint belong solely to you.
          </p>

          <h3>Privacy as a Luxury</h3>
          <p>
            In an era where personal data is constantly mined, tracked, and sold, true privacy has become the ultimate luxury. Cloud-Base provides a beautiful, clean, and highly secure vault to manage your identity, credentials, settings, and connected storage ecosystems.
          </p>

          <h3>Zero-Knowledge Architecture</h3>
          <p>
            Unlike traditional services, we build on zero-knowledge principles. With end-to-end payload encryption and browser in-memory caching, your data is locked away safely from network snoops, service providers, and database leaks.
          </p>

          <h3>Decentralized Identity</h3>
          <p>
            We don't hold your keys or control your assets. Cloud-Base integrates directly with your personal storage channels (such as secure Google Drive integrations) using custom client-side encryption layers, ensuring you maintain 100% data ownership.
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
