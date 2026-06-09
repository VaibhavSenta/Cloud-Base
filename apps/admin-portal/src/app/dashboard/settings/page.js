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

  const [isPushEnabled, setIsPushEnabled] = React.useState(false);
  const [isPushLoading, setIsPushLoading] = React.useState(false);

  // Check current notification permission on load
  React.useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setIsPushEnabled(true);
    }
  }, []);

  const handlePushToggle = async () => {
    if (isPushEnabled) {
      // Logic to disable (optional, for now just toggle state)
      setIsPushEnabled(false);
      return;
    }

    setIsPushLoading(true);
    try {
      console.log('--- Push Activation Debug ---');
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker is not supported by your browser.');
      }

      const permission = await Notification.requestPermission();
      console.log('Notification Permission:', permission);
      if (permission !== 'granted') throw new Error('Permission not granted by user.');

      // Wait for service worker to be ready
      console.log('Waiting for Service Worker registration...');
      let registration = await navigator.serviceWorker.getRegistration();
      
      if (!registration) {
        console.log('Registration not found, waiting for ready...');
        registration = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Service Worker registration timeout. Please ensure the app is installed or refresh.')), 6000))
        ]);
      }

      console.log('Service Worker Registration Found:', registration);

      if (!registration || !registration.pushManager) {
        throw new Error('Push Manager not available on this device/browser.');
      }
      
      // Get VAPID public key
      const { data: { publicKey } } = await axios.get('/api/admin/push/key');
      console.log('VAPID Key Fetched:', publicKey ? 'Success' : 'Failed');
      
      // Convert VAPID key to Uint8Array
      const urlBase64ToUint8Array = (base64String) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
      };

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      // Save to server
      await axios.post('/api/admin/push/subscribe', subscription);
      
      setIsPushEnabled(true);
      alert('Real-time alerts enabled successfully! 🔔');
    } catch (error) {
      console.error('Push subscription failed:', error);
      alert('Failed to enable notifications: ' + error.message);
    } finally {
      setIsPushLoading(false);
    }
  };

  const isEncryptionEnabled = settings.is_encryption_enabled === true;
  const isAutoPurgeEnabled = settings.is_auto_purge_enabled !== false; // Default to true if not set
  const isEnhancedAuditEnabled = settings.is_enhanced_audit_enabled === true;

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
            statusText={isEnhancedAuditEnabled ? 'Active' : 'Disabled'}
            statusColor={isEnhancedAuditEnabled ? 'var(--primary)' : '#888'}
            checked={isEnhancedAuditEnabled}
            onChange={() => toggleSettingMutation.mutate({ key: 'is_enhanced_audit_enabled', value: !isEnhancedAuditEnabled })}
            disabled={isLoading}
            loading={toggleSettingMutation.isPending}
            beta={true}
          />
        </SettingsGroup>

        <SettingsGroup title="System Preferences">
          <SettingsItem 
            icon="/admin-images/notification-bell.png"
            title="Real-time Alerts"
            description="Receive push notifications for infrastructure failures and maintenance events."
            statusText={isPushEnabled ? 'Active' : 'Disabled'}
            checked={isPushEnabled}
            onChange={handlePushToggle}
            loading={isPushLoading}
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
            statusText={isAutoPurgeEnabled ? "Active" : "Disabled"}
            statusColor={isAutoPurgeEnabled ? "var(--primary)" : "#ef4444"}
            checked={isAutoPurgeEnabled}
            onChange={() => toggleSettingMutation.mutate({ key: 'is_auto_purge_enabled', value: !isAutoPurgeEnabled })}
            disabled={isLoading}
            loading={toggleSettingMutation.isPending}
          />
        </SettingsGroup>

      </div>
    </AdminLayout>
  );
}
