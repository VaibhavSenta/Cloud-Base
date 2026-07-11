'use client';
import { useRouter } from 'next/navigation';
import { useSecureQuery } from '@/hooks/useSecureQuery';
import api from '@/utils/api';
import CloudSpinner from '@/components/UI/CloudSpinner/CloudSpinner';
import Link from 'next/link';

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
        background: '#000000'
      }}>
        <CloudSpinner size={72} />
        <span>Loading available services...</span>
      </div>
    );
  }

  const connectedServices = user?.connectedServices || [];

  const servicesList = [
    {
      id: 'vault',
      name: 'Cloud Vault',
      description: 'Encrypted file storage, secure document sync, and background backup rotation.',
      path: '/dashboard/connected-services/vault'
    },
    {
      id: 'chat',
      name: 'Cloud Chat',
      description: 'Encrypted end-to-end messaging, notification controls, and metadata privacy limits.',
      path: '/dashboard/connected-services/chat'
    },
    {
      id: 'social',
      name: 'Cloud Social',
      description: 'Privacy-focused social sharing, fediverse connection settings, and customizable feed bounds.',
      path: '/dashboard/connected-services/social'
    }
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'transparent',
      padding: '40px 24px',
      boxSizing: 'border-box',
      color: '#ffffff',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: '600px', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', letterSpacing: '-0.5px', margin: '0 0 8px 0' }}>
          Explore Services
        </h1>
        <p style={{ fontSize: '0.88rem', color: '#888888', margin: 0, lineHeight: 1.4 }}>
          Discover and link active cloud applications directly to your primary Cloud-Base account parameters.
        </p>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
        maxWidth: '600px',
        marginBottom: '40px'
      }}>
        {servicesList.map(service => {
          const isConnected = connectedServices.some(cs => cs.serviceId === service.id);

          return (
            <div key={service.id} style={{
              background: 'rgba(255, 255, 255, 0.01)',
              border: '1px solid #262626',
              borderRadius: '20px',
              padding: '24px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0, color: '#ffffff' }}>
                  {service.name}
                </h3>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: '600',
                  padding: '4px 10px',
                  borderRadius: '100px',
                  background: isConnected ? 'rgba(0, 149, 246, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                  color: isConnected ? '#0095f6' : '#888888',
                  border: `1px solid ${isConnected ? '#0095f6' : '#363636'}`
                }}>
                  {isConnected ? 'Connected' : 'Available'}
                </span>
              </div>

              <p style={{ fontSize: '0.82rem', color: '#a8a8a8', margin: 0, lineHeight: 1.4 }}>
                {service.description}
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                {isConnected ? (
                  <button 
                    onClick={() => router.push(service.path)}
                    style={{
                      background: 'transparent',
                      border: '1px solid #363636',
                      color: '#ffffff',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      padding: '8px 20px',
                      borderRadius: '100px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Manage Settings
                  </button>
                ) : (
                  <button 
                    onClick={() => router.push(`/dashboard/connected-services/explore/${service.id}`)}
                    style={{
                      background: '#0095f6',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      padding: '8px 24px',
                      borderRadius: '100px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Connect Service
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Link href="/dashboard/connected-services" style={{
        color: '#888888',
        fontSize: '0.82rem',
        textDecoration: 'none',
        fontWeight: '600',
        transition: 'color 0.2s'
      }}>
        Back to Connected Services
      </Link>
    </div>
  );
}
