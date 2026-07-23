'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useSecureQuery, useSecureQueryClient } from '../../../../hooks/useSecureQuery';
import api from '../../../../utils/api';
import styles from './SessionDetailMobile.module.css';

export default function SessionDetailMobile({ sessionId }) {
  const router = useRouter();
  const queryClient = useSecureQueryClient();
  const [isPending, setIsPending] = useState(false);

  // Fetch current user from React Query cache
  const { data: user, isLoading } = useSecureQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await api.get('/auth/me');
      return res.data.data;
    }
  });

  // Revoke OTHER session mutation
  const revokeMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/auth/sessions/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.setSecureQueryData(['user'], (old) => {
        if (!old || !old.sessions) return old;
        return {
          ...old,
          sessions: old.sessions.filter(s => s.sessionId !== id)
        };
      });
      router.push('/dashboard/security/sessions');
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to revoke session');
      setIsPending(false);
    }
  });

  const handleRevoke = () => {
    if (!session) return;
    const confirmed = window.confirm(`Are you sure you want to revoke the session on "${session.deviceName || 'Device'}"?`);
    if (!confirmed) return;

    setIsPending(true);
    revokeMutation.mutate(sessionId);
  };

  const handleLogout = async () => {
    const confirmed = window.confirm('Are you sure you want to log out of this device?');
    if (!confirmed) return;

    setIsPending(true);
    try {
      await api.post('/auth/logout');
      queryClient.clear();
      window.location.href = '/';
    } catch (err) {
      console.error("Logout failed:", err);
      alert('Failed to log out');
      setIsPending(false);
    }
  };

  const formatTimestamp = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    return `${month} ${day} at ${hours}:${minutes}${ampm}`;
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading session details...</div>;
  }

  const session = user?.sessions?.find(s => s.sessionId === sessionId);

  if (!session) {
    return (
      <div className={styles.container}>
        <p style={{ color: '#666', textAlign: 'center', marginTop: '5rem' }}>
          Session not found or has been revoked.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{session.deviceName || 'Device Details'}</h1>
        <p className={styles.timestamp}>
          {session.isCurrent ? 'Current Session' : `Last active: ${formatTimestamp(session.lastActive)}`}
        </p>
      </header>

      <div className={styles.detailsCard}>
        <div className={styles.detailRow}>
          <span className={styles.label}>Device Type</span>
          <span className={styles.value}>{session.deviceType || 'Unknown'}</span>
        </div>

        <div className={styles.detailRow}>
          <span className={styles.label}>Browser Specifications</span>
          <span className={styles.value}>{session.browser || 'Unknown Browser'}</span>
        </div>

        <div className={styles.detailRow}>
          <span className={styles.label}>Network Location (IP)</span>
          <span className={styles.value}>{session.ipAddress || 'IP Address Unknown'}</span>
        </div>

        <div className={styles.detailRow}>
          <span className={styles.label}>Session Status</span>
          <span className={styles.value}>{session.isCurrent ? 'Active Now' : 'Disconnected'}</span>
        </div>
      </div>

      <div className={styles.revokeActionCard}>
        {session.isCurrent ? (
          <button 
            className={styles.revokeBtn} 
            onClick={handleLogout}
            disabled={isPending}
          >
            {isPending ? 'Logging Out...' : 'Logout Device'}
          </button>
        ) : (
          <button 
            className={styles.revokeBtn} 
            onClick={handleRevoke}
            disabled={isPending}
          >
            {isPending ? 'Revoking...' : 'Logout Device'}
          </button>
        )}
      </div>
    </div>
  );
}
