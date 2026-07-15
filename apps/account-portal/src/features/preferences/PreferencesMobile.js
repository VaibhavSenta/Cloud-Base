'use client';
import styles from './PreferencesMobile.module.css';

export default function PreferencesMobile() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Preferences</h1>
        <p className={styles.subtitle}>Personalize your Cloud-Base experience and portal settings.</p>
      </header>

      <div className={styles.card}>
        <div style={{ padding: '3rem 1.2rem', textAlign: 'center', color: '#666666', fontSize: '0.88rem' }}>
          Preferences settings are coming soon.
        </div>
      </div>
    </div>
  );
}
