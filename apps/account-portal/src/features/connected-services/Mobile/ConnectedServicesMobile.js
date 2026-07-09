'use client';
import { useRouter } from 'next/navigation';
import styles from './ConnectedServicesMobile.module.css';

export default function ConnectedServicesMobile() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Connected Services</h1>
        <p className={styles.subtitle}>
          Configure settings and management parameters for your active cloud applications.
        </p>
      </header>

      <div className={styles.content}>
        {/* Card 1: Cloud Vault */}
        <div 
          className={styles.card} 
          onClick={() => router.push('/dashboard/connected-services/vault')}
        >
          <span className={styles.serviceName}>Cloud Vault</span>
        </div>

        {/* Card 2: Cloud Chat */}
        <div 
          className={styles.card} 
          onClick={() => router.push('/dashboard/connected-services/chat')}
        >
          <span className={styles.serviceName}>Cloud Chat</span>
        </div>

        {/* Card 3: Cloud Social */}
        <div 
          className={styles.card} 
          onClick={() => router.push('/dashboard/connected-services/social')}
        >
          <span className={styles.serviceName}>Cloud Social</span>
        </div>
      </div>
    </div>
  );
}
