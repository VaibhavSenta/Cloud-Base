'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useSecureQuery, useSecureQueryClient } from '../../../hooks/useSecureQuery';
import api from '../../../utils/api';
import styles from './LoggedSessionsMobile.module.css';

export default function LoggedSessionsMobile() {
  const router = useRouter();
  const queryClient = useSecureQueryClient();
  const [revokingId, setRevokingId] = useState(null);
  const [isLoggingOutAllOther, setIsLoggingOutAllOther] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Fetch current user from React Query cache
  const { data: user, isLoading } = useSecureQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await api.get('/auth/me');
      return res.data.data;
    }
  });

  // Mutation to handle revoking all other sessions
  const revokeAllOtherMutation = useMutation({
    mutationFn: async () => {
      await api.delete('/auth/sessions');
    },
    onSuccess: () => {
      queryClient.setSecureQueryData(['user'], (old) => {
        if (!old || !old.sessions) return old;
        return {
          ...old,
          sessions: old.sessions.filter(s => s.isCurrent)
        };
      });
      setIsLoggingOutAllOther(false);
      setShowConfirmModal(false);
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to revoke other sessions');
      setIsLoggingOutAllOther(false);
      setShowConfirmModal(false);
    }
  });

  // Mutation to handle session revocation
  const revokeMutation = useMutation({
    mutationFn: async (sessionId) => {
      await api.delete(`/auth/sessions/${sessionId}`);
      return sessionId;
    },
    onSuccess: (sessionId) => {
      // Optimistically update the UI by removing the revoked session
      queryClient.setSecureQueryData(['user'], (old) => {
        if (!old || !old.sessions) return old;
        return {
          ...old,
          sessions: old.sessions.filter(s => s.sessionId !== sessionId)
        };
      });
      setRevokingId(null);
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to revoke session');
      setRevokingId(null);
    }
  });

  const handleRevoke = (sessionId, deviceName) => {
    const confirmed = window.confirm(`Are you sure you want to revoke the session on "${deviceName}"?`);
    if (!confirmed) return;

    setRevokingId(sessionId);
    revokeMutation.mutate(sessionId);
  };

  const handleRevokeAllOther = () => {
    setShowConfirmModal(true);
  };

  const executeLogoutAllOther = () => {
    setIsLoggingOutAllOther(true);
    revokeAllOtherMutation.mutate();
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffMonths / 12);

    if (diffSecs < 60) {
      return `${diffSecs < 0 ? 0 : diffSecs}s ago`;
    } else if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 30) {
      return `${diffDays} days ago`;
    } else if (diffMonths < 12) {
      return `${diffMonths} month ago`;
    } else {
      return `${diffYears} year ago`;
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading active sessions...</div>;
  }

  const sessions = user?.sessions || [];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <p className={styles.subtitle}>Manage your active account logins and revoke security tokens of other devices.</p>
      </header>

      <div className={styles.card}>
        <div className={styles.infoList}>
          {sessions.map((session) => (
            <div 
              key={session.sessionId} 
              className={styles.infoItem}
              onClick={() => router.push(`/dashboard/security/sessions/${session.sessionId}`)}
            >
              <div className={styles.rowMeta}>
                <div className={styles.deviceName}>
                  {session.deviceName || 'Unknown Device'}
                  {session.isCurrent && <span className={styles.currentBadge}>• This device</span>}
                </div>
                <div className={styles.sessionDetails}>
                  {session.browser || 'Browser'} • {session.isCurrent ? 'Active now' : `Last active: ${formatRelativeTime(session.lastActive)}`}
                </div>
              </div>
            </div>
          ))}
          {sessions.length === 0 && (
            <p style={{ color: '#666', textAlign: 'center', fontSize: '0.88rem', padding: '2rem 0' }}>
              No active sessions found.
            </p>
          )}
        </div>
      </div>

      {sessions.length > 1 && (
        <div className={styles.revokeActionCard}>
          <button 
            className={styles.logoutAllBtn}
            onClick={handleRevokeAllOther}
            disabled={isLoggingOutAllOther}
          >
            {isLoggingOutAllOther ? 'Logging out other devices...' : 'Logout from all other devices'}
          </button>
        </div>
      )}

      {showConfirmModal && (
        <div className={styles.modalOverlay} onClick={() => setShowConfirmModal(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Logout other devices?</h3>
            <p className={styles.modalDescription}>
              This will end all other active sessions except for this device. You will need to log back in on those devices.
            </p>
            <div className={styles.modalActions}>
              <button 
                className={styles.modalConfirmBtn} 
                onClick={executeLogoutAllOther}
                disabled={isLoggingOutAllOther}
              >
                {isLoggingOutAllOther ? 'Logging out...' : 'Logout'}
              </button>
              <button 
                className={styles.modalCancelBtn} 
                onClick={() => setShowConfirmModal(false)}
                disabled={isLoggingOutAllOther}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
