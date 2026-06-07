'use client';

import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout/AdminLayout';
import styles from './settings.module.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import SettingsGroup from '@/components/admin/Settings/SettingsGroup';
import SettingsItem from '@/components/admin/Settings/SettingsItem';

export default function SettingsPage() {
  const queryClient = useQueryClient();

  // 1. Fetch Global Settings
  const { data: settings = {}, isLoading } = useQuery({
    queryKey: ['globalSettings'],
    queryFn: async () => {
      const res = await axios.get('/api/admin/settings');
      return res.data;
    },
  });

  // 2. Toggle Mutation
  const toggleSettingMutation = useMutation({
    mutationFn: async ({ key, value }) => {
      const res = await axios.post('/api/admin/settings/update', { key, value });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['globalSettings'] });
      // Forced sync of encryption state without page reload
      if (typeof window !== 'undefined' && window.__FORCE_RE_HANDSHAKE__) {
        window.__FORCE_RE_HANDSHAKE__();
      }
    },
    onError: (err) => {
      console.error("Toggle failed:", err);
    }
  });

  const isEncryptionEnabled = settings.is_encryption_enabled === true;

  return (
    <AdminLayout>
      <div className={styles.settingsContainer}>
        <section className={styles.headerSection}>
          <h1>Global Settings</h1>
          <p>Manage infrastructure protocols and system preferences.</p>
        </section>

        <SettingsGroup title="Security Protocols">
          <SettingsItem 
            icon="/admin-images/lock.png"
            title="Hybrid Encryption (RSA-AES)"
            description="Secure all browser-server traffic. Prevents data theft on compromised networks."
            statusText={isEncryptionEnabled ? 'Encrypted' : 'Insecure'}
            statusColor={isEncryptionEnabled ? 'var(--primary)' : '#ef4444'}
            checked={isEncryptionEnabled}
            onChange={() => toggleSettingMutation.mutate({ key: 'is_encryption_enabled', value: !isEncryptionEnabled })}
            disabled={isLoading}
            loading={toggleSettingMutation.isPending}
          />
          <SettingsItem 
            icon="/admin-images/history.png"
            title="Enhanced Audit Logging"
            description="Track every single admin action with detailed metadata and IP tracking."
            statusText="Beta"
            disabled={true}
            beta={true}
          />
        </SettingsGroup>

        <SettingsGroup title="System Preferences">
          <SettingsItem 
            icon="/admin-images/notifications.png"
            title="Real-time Alerts"
            description="Receive push notifications for infrastructure failures and maintenance events."
            statusText="Active"
            checked={true}
            disabled={true}
          />
          <SettingsItem 
            icon="/admin-images/dark-mode.png"
            title="Night Console (Dark Mode)"
            description="CloudBase default high-contrast dark interface."
            statusText="Forced"
            checked={true}
            disabled={true}
          />
        </SettingsGroup>

        <SettingsGroup title="Data Management">
          <SettingsItem 
            icon="/admin-images/auto-delete.png"
            title="Auto-Purge Expired Sessions"
            description="Automatically remove session data from database after 30 days of inactivity."
            statusText="On"
            checked={true}
            disabled={true}
          />
        </SettingsGroup>

      </div>
    </AdminLayout>
  );
}
