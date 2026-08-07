'use client';
import PageHeader from '@/components/UI/PageHeader/PageHeader';
import styles from './PreferencesMobile.module.css';

export default function PreferencesMobile() {
  return (
    <div className={styles.container}>
      <PageHeader 
        title="Preferences"
        subtitle="Personalize your Nothing Box experience and portal settings."
      />

      <div className={styles.card}>
        <div style={{ padding: '3rem 1.2rem', textAlign: 'center', color: '#666666', fontSize: '0.88rem' }}>
          Preferences settings are coming soon.
        </div>
      </div>
    </div>
  );
}
