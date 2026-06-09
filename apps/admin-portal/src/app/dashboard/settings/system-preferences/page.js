'use client';

import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout/AdminLayout';
import styles from '../settings.module.css';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import SettingsGroup from '@/components/admin/Settings/SettingsGroup';
import SettingsItem from '@/components/admin/Settings/SettingsItem';

export default function SystemPreferencesPage() {
  const { isLoading } = useQuery({
    queryKey: ['globalSettings'],
    queryFn: async () => {
      const res = await axios.get('/api/admin/settings');
      return res.data;
    },
  });

  const [isPushEnabled, setIsPushEnabled] = React.useState(false);
  const [isPushLoading, setIsPushLoading] = React.useState(false);

  React.useEffect(() => {
    const checkPushStatus = async () => {
      if ('serviceWorker' in navigator && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          const registration = await navigator.serviceWorker.getRegistration();
          const subscription = await registration?.pushManager.getSubscription();
          setIsPushEnabled(!!subscription);
        }
      }
    };
    checkPushStatus();
  }, []);

  const handlePushToggle = async () => {
    if (isPushEnabled) {
      if (confirm('Do you want to disable real-time alerts? (This will remove your subscription on this device)')) {
          setIsPushLoading(true);
          try {
            const registration = await navigator.serviceWorker.getRegistration();
            const subscription = await registration?.pushManager.getSubscription();
            if (subscription) {
              await subscription.unsubscribe();
              setIsPushEnabled(false);
            }
          } catch (error) {
            console.error('Failed to unsubscribe:', error);
          } finally {
            setIsPushLoading(false);
          }
      }
      return;
    }

    setIsPushLoading(true);
    try {
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker is not supported by your browser.');
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') throw new Error('Permission not granted by user.');

      let registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        registration = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Service Worker registration timeout.')), 15000))
        ]);
      }

      const { data: { publicKey } } = await axios.get('/api/admin/push/key');
      
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

  return (
    <AdminLayout>
      <div className={styles.settingsContainer}>
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
      </div>
    </AdminLayout>
  );
}
