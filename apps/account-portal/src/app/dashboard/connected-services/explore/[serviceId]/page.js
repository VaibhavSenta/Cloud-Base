'use client';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/utils/api';
import Link from 'next/link';
import { useState } from 'react';
import CloudSpinner from '@/components/UI/CloudSpinner/CloudSpinner';

import { localEncrypt, localDecrypt } from 'secure-query-cache';

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
      <div style={{
        width: '100%',
        maxWidth: '500px',
        background: 'rgba(255, 255, 255, 0.01)',
        border: '1px solid #262626',
        borderRadius: '24px',
        padding: '40px 32px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        <header style={{ textAlign: 'center' }}>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: '800',
            letterSpacing: '1px',
            color: '#0095f6',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: '12px'
          }}>
            Service Onboarding
          </span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-0.4px' }}>
            Link {service.name}
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#888888', margin: 0, lineHeight: 1.4 }}>
            {service.description}
          </p>
        </header>

        <div style={{ borderBottom: '1px solid #1a1a1a', margin: '8px 0' }}></div>

        <div>
          <h4 style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#888888', margin: '0 0 12px 0' }}>
            Permissions Requested
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {service.scopes.map((scope, index) => (
              <div key={index} style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                fontSize: '0.82rem',
                lineHeight: 1.4,
                color: '#d4d4d4'
              }}>
                <span style={{ color: '#0095f6', fontWeight: 'bold' }}>•</span>
                <span>{scope}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderBottom: '1px solid #1a1a1a', margin: '8px 0' }}></div>

        <p style={{ fontSize: '0.72rem', color: '#666666', lineHeight: 1.4, margin: 0 }}>
          By clicking Accept & Connect, you authorize Cloud-Base to bridge your account tokens with {service.name} and share the metadata items listed above in accordance with the application privacy parameters.
        </p>

        {errorMessage && (
          <p style={{ color: '#ff453a', fontSize: '0.78rem', margin: 0, textAlign: 'center' }}>
            {errorMessage}
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
          <button
            onClick={handleConnect}
            disabled={connectMutation.isPending}
            style={{
              background: '#0095f6',
              border: 'none',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '0.85rem',
              padding: '14px',
              borderRadius: '12px',
              cursor: connectMutation.isPending ? 'not-allowed' : 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            {connectMutation.isPending ? (
              <>
                <CloudSpinner size={16} />
                <span>Linking...</span>
              </>
            ) : (
              'Accept & Connect'
            )}
          </button>

          <button
            onClick={() => router.push('/dashboard/connected-services/explore')}
            disabled={connectMutation.isPending}
            style={{
              background: 'transparent',
              border: '1px solid #262626',
              color: '#888888',
              fontWeight: '600',
              fontSize: '0.85rem',
              padding: '14px',
              borderRadius: '12px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
