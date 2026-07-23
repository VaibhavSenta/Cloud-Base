'use client';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/utils/api';
import Link from 'next/link';
import { useState } from 'react';
import CloudSpinner from '@/components/UI/CloudSpinner/CloudSpinner';

import { localEncrypt, localDecrypt } from 'secure-query-cache';

import ServiceConsentCard from '@/components/UI/ServiceConsentCard/ServiceConsentCard';

export default function ServiceConsentPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState('');

  const serviceId = params.serviceId;

  const servicesDetails = {
    vault: {
      name: 'Cloud Vault',
      description: 'Zero-knowledge encrypted cloud locker to archive, partition, and sync user assets.',
      scopes: [
        'Read core identity attributes (Name, Email, Profile Picture)',
        'Create and partition isolated document workspace directories',
        'Issue secure file upload/download signatures to local devices'
      ]
    },
    chat: {
      name: 'Cloud Chat',
      description: 'End-to-end encrypted messaging terminal for real-time channel sync.',
      scopes: [
        'Read core identity attributes (Name, Email, Profile Picture)',
        'Manage real-time notifications and message delivery routing parameters',
        'Store and verify asymmetric session keys for message encryption validation'
      ]
    },
    social: {
      name: 'Cloud Social',
      description: 'Privacy-first sharing hub with custom audience bounds and fediverse relays.',
      scopes: [
        'Read core identity attributes (Name, Email, Profile Picture)',
        'Publish public profile metadata and manage active network links',
        'Configure custom content safety parameters and encryption boundaries'
      ]
    }
  };

  const service = servicesDetails[serviceId];

  const connectMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/auth/connected-services/connect', { serviceId });
      return res.data;
    },
    onSuccess: async () => {
      const userCache = queryClient.getQueryData(['user']);
      if (userCache) {
        const decryptedUser = localDecrypt(userCache);
        if (decryptedUser) {
          decryptedUser.connectedServices = decryptedUser.connectedServices || [];
          if (!decryptedUser.connectedServices.some(s => s.serviceId === serviceId)) {
            decryptedUser.connectedServices.push({ serviceId, connectedAt: new Date().toISOString() });
          }
          queryClient.setQueryData(['user'], localEncrypt(decryptedUser));
        }
      }
      await queryClient.invalidateQueries({ queryKey: ['user'] });
      window.location.href = `/dashboard/connected-services/${serviceId}`;
    },
    onError: (err) => {
      setErrorMessage(err.response?.data?.message || 'Failed to authenticate and link service');
    }
  });

  if (!service) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        color: '#ffffff',
        background: '#000000',
        padding: '24px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#ff453a', fontSize: '0.9rem', marginBottom: '16px' }}>
          Invalid service identifier requested.
        </p>
        <Link href="/dashboard/connected-services/explore" style={{ color: '#0095f6', fontSize: '0.82rem', textDecoration: 'none' }}>
          Back to explore
        </Link>
      </div>
    );
  }

  const handleConnect = () => {
    setErrorMessage('');
    connectMutation.mutate();
  };

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
      <ServiceConsentCard 
        name={service.name}
        description={service.description}
        scopes={service.scopes}
        isPending={connectMutation.isPending}
        errorMessage={errorMessage}
        onConnect={handleConnect}
        onCancel={() => router.push('/dashboard/connected-services/explore')}
      />
    </div>
  );
}
