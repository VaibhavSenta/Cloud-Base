'use client';
import Link from 'next/link';

export default function VaultSettingsPage() {
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
      background: '#000000'
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
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '8px' }}>Cloud Vault Settings</h2>
        <p style={{ fontSize: '0.82rem', color: '#888888', lineHeight: 1.4, marginBottom: '24px' }}>
          Configure auto-backup schedules, encryption key rotation, and folder syncing for Cloud Vault.
        </p>
        <Link href="/dashboard/connected-services" style={{
          display: 'inline-block',
          background: '#0095f6',
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: '0.8rem',
          padding: '8px 24px',
          borderRadius: '100px',
          textDecoration: 'none'
        }}>
          Back to Services
        </Link>
      </div>
    </div>
  );
}
