/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ServiceCard from '@/components/UI/ServiceCard/ServiceCard';
import styles from './ConnectedServicesTablet.module.css';

export default function ConnectedServicesTablet({ connectedServices }) {
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
          {connectedList.map((service, idx) => {
            const isLastSingle = connectedList.length % 2 !== 0 && idx === connectedList.length - 1;
            return (
              <div 
                key={service.id}
                className={isLastSingle ? styles.cardFull : styles.card} 
                onClick={() => router.push(service.path)}
              >
                <span className={styles.serviceName}>{service.name}</span>
              </div>
            );
          })}
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
              <ServiceCard 
                key={app.id}
                title={app.name}
                tagline={app.tagline}
                actionType="get"
                actionText="GET"
                onClick={() => router.push(`/dashboard/connected-services/explore/${app.id}`)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
