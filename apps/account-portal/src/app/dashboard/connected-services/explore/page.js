/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';
import { useRouter } from 'next/navigation';
import { useSecureQuery } from '@/hooks/useSecureQuery';
import api from '@/utils/api';
import CloudSpinner from '@/components/UI/CloudSpinner/CloudSpinner';
import Link from 'next/link';
import PageHeader from '@/components/UI/PageHeader/PageHeader';
import ExploreCard from '@/components/UI/ExploreCard/ExploreCard';

import styles from './ExploreServicesPage.module.css';

export default function ExploreServicesPage() {
  const router = useRouter();

  const { data: user, isLoading } = useSecureQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await api.get('/auth/me');
      return res.data.data;
    }
  });

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '70vh', 
        gap: '1.5rem',
        color: '#a8a8a8', 
        fontSize: '0.85rem',
        background: 'transparent'
      }}>
        <CloudSpinner size={72} />
        <span>Loading available services...</span>
      </div>
    );
  }

  const connectedServices = user?.connectedServices || [];

  const servicesList = [
    {
      id: 'chat',
      name: 'Nothingbox Chat',
      category: 'MESSAGING & COMMUNICATION',
      monogram: 'NC',
      description: 'Encrypted end-to-end messaging, notification controls, and metadata privacy limits.',
      path: '/dashboard/connected-services/chat'
    }
  ];

  return (
    <div className={styles.container}>
      <PageHeader 
        title="Explore Services"
        subtitle="Discover and link active cloud applications directly to your primary Nothing Box account parameters."
      />

      <div className={styles.cardsGrid}>
        {servicesList.map(service => {
          const isConnected = connectedServices.some(cs => cs.serviceId === service.id);

          return (
            <ExploreCard 
              key={service.id}
              name={service.name}
              category={service.category}
              monogram={service.monogram}
              description={service.description}
              isConnected={isConnected}
              onConnect={() => router.push(`/dashboard/connected-services/explore/${service.id}`)}
              onManage={() => router.push(service.path)}
            />
          );
        })}
      </div>

      <Link href="/dashboard/connected-services" className={styles.backLink}>
        Back to Connected Services
      </Link>
    </div>
  );
}
