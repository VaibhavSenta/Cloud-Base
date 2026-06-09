/* eslint-disable no-undef */
import { skipWaiting, clientsClaim } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkOnly } from 'workbox-strategies';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

skipWaiting();
clientsClaim();

// Precache all built assets
precacheAndRoute(self.__WB_MANIFEST);

// 1. Background Sync for Critical Admin Actions
const bgSyncPlugin = new BackgroundSyncPlugin('criticalActionsQueue', {
  maxRetentionTime: 24 * 60, // Retry for max 24 Hours
});

registerRoute(
  ({ url }) => url.pathname.includes('/api/admin/managedapps/toggle-maintenance') || 
               url.pathname.includes('/api/admin/users/status'),
  new NetworkOnly({
    plugins: [bgSyncPlugin],
  }),
  'PATCH'
);

// 2. Periodic Background Sync (Refresh Health Stats)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'refresh-health-stats') {
    event.waitUntil(refreshHealthStats());
  }
});

async function refreshHealthStats() {
  console.log('[SW] Periodic Sync: Refreshing Health Stats...');
  try {
    const response = await fetch('/api/admin/managedapps');
    const data = await response.json();
    
    // Update Badge if API available
    const downApps = data.data.filter(app => app.status === 'down' && !app.inMaintenance);
    if ('setAppBadge' in navigator) {
        if (downApps.length > 0) {
            navigator.setAppBadge(downApps.length);
        } else {
            navigator.clearAppBadge();
        }
    }
  } catch (error) {
    console.error('[SW] Periodic Sync Failed:', error);
  }
}

// 3. Web Push Notification Listener
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/logo-dark.jpeg',
    badge: '/icons/logo-dark.jpeg',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/dashboard',
    },
    actions: [
      { action: 'open', title: 'View Details' },
      { action: 'close', title: 'Close' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'close') return;

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});
