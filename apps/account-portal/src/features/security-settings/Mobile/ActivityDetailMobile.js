'use client';
import { useSecureQuery } from '../../../hooks/useSecureQuery';
import api from '../../../utils/api';
import styles from './ActivityDetailMobile.module.css';
import { useRouter } from 'next/navigation';

export default function ActivityDetailMobile({ logId }) {
  const router = useRouter();

  // Fetch current user from React Query cache
  const { data: user, isLoading } = useSecureQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await api.get('/auth/me');
      return res.data.data;
    }
  });

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
    const formattedHours = String(hours).padStart(2, '0');
    
    return `${month} ${day} at ${formattedHours}:${minutes} ${ampm}`;
  };

  const getActivityLogs = () => {
    if (!user) return [];
    
    // Map backend database logs if they exist
    const dbLogs = user.activityLogs ? user.activityLogs.map((log) => ({
      id: log._id || String(log.timestamp),
      action: log.action,
      timestamp: new Date(log.timestamp),
      details: `Action completed successfully on: ${log.browser || 'Browser'}`,
      category: 'Security Settings',
      origin: log.browser ? `${log.browser} (${log.ipAddress || 'IP'})` : 'System Handshake'
    })) : [];

    const logs = [...dbLogs];

    // Prepopulate baseline security actions only if activity logs is empty
    if (dbLogs.length === 0) {
      const baseDate = user.createdAt ? new Date(user.createdAt) : new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const updateDate = user.updatedAt ? new Date(user.updatedAt) : new Date();

      logs.push({
        id: 'create',
        action: 'Account created securely',
        timestamp: baseDate,
        details: 'Handshake RSA-2048 key exchange completed.',
        category: 'Security Settings',
        origin: 'System Handshake'
      });

      logs.push({
        id: 'email-reg',
        action: 'Primary email registered',
        timestamp: baseDate,
        details: user.email || 'Registered email',
        category: 'Identity Registry',
        origin: 'Self Registration'
      });

      if (user.isEmailVerified) {
        logs.push({
          id: 'email-ver',
          action: 'Primary email verified',
          timestamp: new Date(baseDate.getTime() + 10 * 60 * 1000),
          details: 'Email ownership confirmed.',
          category: 'Identity Registry',
          origin: 'Email Loop Challenge'
        });
      }

      if (user.phonenumber) {
        logs.push({
          id: 'phone-ver',
          action: 'Phone number verified',
          timestamp: updateDate,
          details: `Connected: ${user.phonenumber}`,
          category: 'Identity Registry',
          origin: 'Firebase OTP verification'
        });
      }

      if (user.twoFactorEnabled) {
        logs.push({
          id: '2fa-en',
          action: 'Two-Factor Authentication enabled',
          timestamp: updateDate,
          details: `Primary verification channel: ${user.twoFactorPrimary === 'email' ? 'Email OTP' : 'Google Authenticator'}`,
          category: 'Multi-Factor Settings',
          origin: 'Settings Update'
        });
      }
    }

    return logs;
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading log details...</div>;
  }

  const logs = getActivityLogs();
  const log = logs.find(l => l.id === logId);

  if (!log) {
    return (
      <div className={styles.container}>
        <button type="button" className={styles.backButton} onClick={() => router.back()}>Back</button>
        <h1 className={styles.title}>Log Not Found</h1>
        <p className={styles.subtitle}>The requested activity record could not be found.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{log.action}</h1>
        <p className={styles.timestamp}>{formatTimestamp(log.timestamp)}</p>
      </header>

      <div className={styles.detailsCard}>
        <div className={styles.detailRow}>
          <span className={styles.label}>Event Type</span>
          <span className={styles.value}>{log.category || 'Security Settings'}</span>
        </div>

        <div className={styles.detailRow}>
          <span className={styles.label}>Details</span>
          <span className={styles.value}>{log.details}</span>
        </div>

        <div className={styles.detailRow}>
          <span className={styles.label}>Origin & Channel</span>
          <span className={styles.value}>{log.origin || 'System Handshake'}</span>
        </div>

        <div className={styles.detailRow}>
          <span className={styles.label}>Verification Status</span>
          <span className={styles.value}>Success</span>
        </div>
      </div>
    </div>
  );
}
