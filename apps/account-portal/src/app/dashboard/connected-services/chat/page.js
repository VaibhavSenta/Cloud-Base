/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';
import { useRouter } from 'next/navigation';
import { useSecureQuery } from '@/hooks/useSecureQuery';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/utils/api';
import Link from 'next/link';
import { useState } from 'react';
import CloudSpinner from '@/components/UI/CloudSpinner/CloudSpinner';

import { localEncrypt, localDecrypt } from 'secure-query-cache';

export default function ChatSettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState('');

  const { data: user, isLoading } = useSecureQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await api.get('/auth/me');
      return res.data.data;
    }
  });

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/auth/connected-services/disconnect', { serviceId: 'chat' });
      return res.data;
    },
    onSuccess: async () => {
      const userCache = queryClient.getQueryData(['user']);
      if (userCache) {
        const decryptedUser = localDecrypt(userCache);
        if (decryptedUser) {
          decryptedUser.connectedServices = decryptedUser.connectedServices || [];
          decryptedUser.connectedServices = decryptedUser.connectedServices.filter(s => s.serviceId !== 'chat');
          queryClient.setQueryData(['user'], localEncrypt(decryptedUser));
        }
      }
      await queryClient.invalidateQueries({ queryKey: ['user'] });
      window.location.href = '/dashboard/connected-services';
    },
    onError: (err) => {
      setErrorMessage(err.response?.data?.message || 'Failed to disconnect service');
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
        <span>Verifying connection...</span>
      </div>
    );
  }

  const isConnected = user?.connectedServices?.some(cs => cs.serviceId === 'chat');

  if (!isConnected) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        textAlign: 'center',
        padding: '24px',
        color: '#ffffff',
        background: 'transparent'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid #262626',
          borderRadius: '16px',
          padding: '40px 24px',
          maxWidth: '400px',
          width: '100%',
          boxSizing: 'border-box'
        }} className="glass">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '8px' }}>Chat Not Linked</h2>
          <p style={{ fontSize: '0.82rem', color: '#888888', lineHeight: 1.4, marginBottom: '24px' }}>
            Cloud Chat settings are only configurable once you authorize the service connection.
          </p>
          <button 
            onClick={() => router.push('/dashboard/connected-services/explore/chat')}
            style={{
              display: 'block',
              width: '100%',
              background: '#0095f6',
              border: 'none',
              color: '#ffffff',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              padding: '12px',
              borderRadius: '100px',
              cursor: 'pointer',
              marginBottom: '16px'
            }}
          >
            Connect Chat
          </button>
          <Link href="/dashboard/connected-services" style={{ color: '#888888', fontSize: '0.8rem', textDecoration: 'none' }}>
            Back to services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '70vh',
      textAlign: 'center',
      padding: '24px',
      color: '#ffffff',
      background: 'transparent'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid #262626',
        borderRadius: '16px',
        padding: '40px 24px',
        maxWidth: '400px',
        width: '100%',
        boxSizing: 'border-box'
      }} className="glass">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '8px' }}>Nothingbox Chat Settings</h2>
        <p style={{ fontSize: '0.82rem', color: '#888888', lineHeight: 1.4, marginBottom: '24px' }}>
          Configure message retention policies, notification settings, and encrypted peer keys for Nothingbox Chat.
        </p>
        
        {errorMessage && (
          <p style={{ color: '#ff453a', fontSize: '0.78rem', marginBottom: '16px' }}>{errorMessage}</p>
        )}

        <button 
          onClick={() => {
            const chatPortalUrl = process.env.NEXT_PUBLIC_CHAT_PORTAL_URL || 'http://chat.nothingbox.test';
            window.location.href = chatPortalUrl;
          }}
          style={{
            display: 'block',
            width: '100%',
            background: '#0095f6',
            border: 'none',
            color: '#ffffff',
            fontWeight: 'bold',
            fontSize: '0.85rem',
            padding: '12px',
            borderRadius: '100px',
            cursor: 'pointer',
            marginBottom: '12px'
          }}
        >
          Launch Nothingbox Chat
        </button>

        <button 
          onClick={() => disconnectMutation.mutate()}
          disabled={disconnectMutation.isPending}
          style={{
            display: 'block',
            width: '100%',
            background: 'rgba(255, 69, 58, 0.1)',
            border: '1px solid #ff453a',
            color: '#ff453a',
            fontWeight: 'bold',
            fontSize: '0.85rem',
            padding: '12px',
            borderRadius: '100px',
            cursor: disconnectMutation.isPending ? 'not-allowed' : 'pointer',
            marginBottom: '16px'
          }}
        >
          {disconnectMutation.isPending ? 'Disconnecting...' : 'Disconnect Chat'}
        </button>

        <Link href="/dashboard/connected-services" style={{
          display: 'inline-block',
          color: '#888888',
          fontWeight: 'bold',
          fontSize: '0.8rem',
          textDecoration: 'none'
        }}>
          Back to Services
        </Link>
      </div>
    </div>
  );
}
