'use client';
import Link from 'next/link';
import styles from '../public-pages.module.css';
import Logo from '../../components/Logo/Logo';

export default function TermsPage() {
  return (
    <div className={styles.container}>
      <Logo forceVersion="icon" />

      <div className={styles.card}>
        <header className={styles.header}>
          <h1 className={styles.title}>Terms of Service</h1>
          <p className={styles.subtitle}>Last Updated: June 29, 2026</p>
        </header>

        <div className={styles.content}>
          <p>
            By accessing or using the Cloud-Base portal and its services, you agree to comply with and be bound by the following Terms of Service.
          </p>

          <h3>1. Description of Service</h3>
          <p>
            Cloud-Base provides a secure web portal for managing personal profile information, settings, and integrated cloud storage. The platform is designed to give you direct ownership over your data using client-side cryptographic tools.
          </p>

          <h3>2. User Responsibilities</h3>
          <p>
            Since we operate a zero-knowledge service, you are solely responsible for managing your credentials and secure storage access tokens. If you lose your security keys or master credentials, we cannot retrieve them or recover your encrypted assets.
          </p>

          <h3>3. Acceptable Use</h3>
          <p>
            You agree to use Cloud-Base only for lawful purposes. You must not use the services to distribute malware, upload illegal materials, or attempt to compromise the network security of the Cloud-Base ecosystem.
          </p>

          <h3>4. Disclaimer & Limitation of Liability</h3>
          <p>
            Cloud-Base is provided on an "as is" and "as available" basis without warranties of any kind. In no event shall Cloud-Base be liable for any direct, indirect, incidental, or consequential damages resulting from data loss or security breaches.
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
