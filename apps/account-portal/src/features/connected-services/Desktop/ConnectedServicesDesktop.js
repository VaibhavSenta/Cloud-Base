'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './ConnectedServicesDesktop.module.css';

export default function ConnectedServicesDesktop({ connectedServices }) {
  const router = useRouter();

  const services = [
    { id: 'vault', name: 'Cloud Vault', tagline: 'Secure storage & sync parameters', path: '/dashboard/connected-services/vault' },
    { id: 'chat', name: 'Cloud Chat', tagline: 'Encrypted communication terminal', path: '/dashboard/connected-services/chat' },
    { id: 'social', name: 'Cloud Social', tagline: 'Privacy-focused fediverse sharing', path: '/dashboard/connected-services/social' }
  ];

  const connectedList = services.filter(service => 
    connectedServices.some(cs => cs.serviceId === service.id)
  );

  const availableList = services.filter(service => 
    !connectedServices.some(cs => cs.serviceId === service.id)
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Connected Services</h1>
        <p className={styles.subtitle}>
          Configure settings and management parameters for your active cloud applications.
        </p>
      </header>

      {connectedList.length > 0 ? (
        <div className={styles.grid}>
          {connectedList.map(service => (
            <div 
              key={service.id}
              className={styles.card} 
              onClick={() => router.push(service.path)}
            >
              <span className={styles.serviceName}>{service.name}</span>
            </div>
          ))}
        </div>
      ) : (
        <div 
          className={styles.emptyState} 
          onClick={() => router.push('/dashboard/connected-services/explore')}
        >
          <p className={styles.emptyText}>No services are connected to your account yet.</p>
        </div>
      )}

      {availableList.length > 0 && (
        <section className={styles.exploreSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.exploreTitle}>Explore Available Services</h2>
            <Link href="/dashboard/connected-services/explore" className={styles.seeAllLink}>
              See All
            </Link>
          </div>
          <div className={styles.exploreGrid}>
            {availableList.map(app => (
              <div key={app.id} className={styles.appStoreCard}>
                <div className={styles.appInfo}>
                  <span className={styles.appName}>{app.name}</span>
                  <span className={styles.appTagline}>{app.tagline}</span>
                </div>
                <button 
                  className={styles.getBtn}
                  onClick={() => router.push(`/dashboard/connected-services/explore/${app.id}`)}
                >
                  GET
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
