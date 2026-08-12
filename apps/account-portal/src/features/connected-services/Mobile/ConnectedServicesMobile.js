/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageHeader from '@/components/UI/PageHeader/PageHeader';
import ServiceCard from '@/components/UI/ServiceCard/ServiceCard';
import styles from './ConnectedServicesMobile.module.css';

export default function ConnectedServicesMobile({ connectedServices }) {
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
      <PageHeader 
        title="Connected Services"
        subtitle="Configure settings and management parameters for your active cloud applications."
      />

      {connectedList.length > 0 ? (
        <div className={styles.content}>
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
          style={{ cursor: 'pointer' }}
        >
          <p className={styles.emptyText}>No services are connected to your account yet.</p>
        </div>
      )}

      {availableList.length > 0 && (
        <section className={styles.exploreSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.exploreTitle}>Explore Available Services</h2>
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

            {/* App Store style Explore All Card at the end of the scroll list */}
            <ServiceCard 
              title="Explore All"
              tagline="Discover more apps"
              actionType="arrow"
              onClick={() => router.push('/dashboard/connected-services/explore')}
            />
          </div>
        </section>
      )}
    </div>
  );
}
