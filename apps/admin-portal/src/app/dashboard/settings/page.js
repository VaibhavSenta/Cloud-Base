'use client';

import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout/AdminLayout';
import styles from './settings.module.css';
import Image from 'next/image';
import Switch from '@/components/admin/Switch/Switch';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

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
      alert("Security Error: Failed to update protocol. Please try again.");
    }
  });

  const isEncryptionEnabled = settings.is_encryption_enabled === true;

  const handleToggleEncryption = () => {
    // Mutation call: switch position changes ONLY after success/reload
    toggleSettingMutation.mutate({ 
        key: 'is_encryption_enabled', 
        value: !isEncryptionEnabled 
    });
  };

  return (
    <AdminLayout>
      <div className={styles.settingsContainer}>
        <section className={styles.headerSection}>
          <h1>Global Settings</h1>
          <p>Manage infrastructure protocols and system preferences.</p>
        </section>

        {/* SECURITY PROTOCOLS GROUP */}
        <div className={styles.settingsGroup}>
          <div className={styles.groupHeader}>
            <h2>Security Protocols</h2>
          </div>
          
          {/* Row: Encryption */}
          <div className={styles.settingRow}>
            <div className={styles.rowLeft}>
              <div className={styles.iconBox}>
                <Image src="/admin-images/lock.png" width={20} height={20} alt="Lock" />
              </div>
              <div className={styles.info}>
                <h3>Hybrid Encryption (RSA-AES)</h3>
                <p>Secure all browser-server traffic. Prevents data theft on compromised networks.</p>
              </div>
            </div>
            <div className={styles.rowRight}>
              <span className={styles.statusText} style={{ color: isEncryptionEnabled ? 'var(--primary)' : '#ef4444' }}>
                {isEncryptionEnabled ? 'Encrypted' : 'Insecure'}
              </span>
              <Switch 
                checked={isEncryptionEnabled}
                onChange={handleToggleEncryption}
                disabled={isLoading}
                loading={toggleSettingMutation.isPending}
              />
            </div>
          </div>

          {/* Row: Audit Logs (Placeholder for future) */}
          <div className={styles.settingRow} style={{ opacity: 0.6 }}>
            <div className={styles.rowLeft}>
              <div className={styles.iconBox}>
                <Image src="/admin-images/history.png" width={20} height={20} alt="History" />
              </div>
              <div className={styles.info}>
                <h3>Enhanced Audit Logging</h3>
                <p>Track every single admin action with detailed metadata and IP tracking.</p>
              </div>
            </div>
            <div className={styles.rowRight}>
              <span className={styles.statusText}>Beta</span>
              <Switch disabled />
            </div>
          </div>
        </div>

        {/* SYSTEM PREFERENCES GROUP */}
        <div className={styles.settingsGroup}>
          <div className={styles.groupHeader}>
            <h2>System Preferences</h2>
          </div>

          {/* Row: Notifications */}
          <div className={styles.settingRow}>
            <div className={styles.rowLeft}>
              <div className={styles.iconBox}>
                <Image src="/admin-images/notifications.png" width={20} height={20} alt="Notifications" />
              </div>
              <div className={styles.info}>
                <h3>Real-time Alerts</h3>
                <p>Receive push notifications for infrastructure failures and maintenance events.</p>
              </div>
            </div>
            <div className={styles.rowRight}>
              <span className={styles.statusText}>Active</span>
              <Switch checked={true} disabled />
            </div>
          </div>

          {/* Row: Dark Mode (Fixed) */}
          <div className={styles.settingRow}>
            <div className={styles.rowLeft}>
              <div className={styles.iconBox}>
                <Image src="/admin-images/dark-mode.png" width={20} height={20} alt="Dark Mode" />
              </div>
              <div className={styles.info}>
                <h3>Night Console (Dark Mode)</h3>
                <p>CloudBase default high-contrast dark interface.</p>
              </div>
            </div>
            <div className={styles.rowRight}>
              <span className={styles.statusText}>Forced</span>
              <Switch checked={true} disabled />
            </div>
          </div>
        </div>

        {/* DATA MANAGEMENT GROUP */}
        <div className={styles.settingsGroup}>
          <div className={styles.groupHeader}>
            <h2>Data Management</h2>
          </div>
          <div className={styles.settingRow}>
            <div className={styles.rowLeft}>
              <div className={styles.iconBox}>
                <Image src="/admin-images/auto-delete.png" width={20} height={20} alt="Auto Delete" />
              </div>
              <div className={styles.info}>
                <h3>Auto-Purge Expired Sessions</h3>
                <p>Automatically remove session data from database after 30 days of inactivity.</p>
              </div>
            </div>
            <div className={styles.rowRight}>
              <span className={styles.statusText}>On</span>
              <Switch checked={true} disabled />
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
