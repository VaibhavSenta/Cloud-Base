/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
import api from './api';

// Convert base64 VAPID key to Uint8Array for subscription
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Initializes Push Notifications:
 * 1. Requests Notification permission
 * 2. Fetches VAPID public key from backend
 * 3. Registers service worker subscription
 * 4. Sends subscription object to backend
 */
export async function initPushNotifications() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.log('Notification API not supported in this browser.');
    return false;
  }

  try {
    // 1. Request Notification Permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Push notification permission denied by user.');
      return false;
    }

    // 2. Fetch VAPID Public Key from backend
    let vapidPublicKey = null;
    try {
      const keyRes = await api.get('/chat/notifications/vapid-public-key');
      vapidPublicKey = keyRes.data?.vapidPublicKey;
    } catch (e) {
      console.warn('⚠️ Could not fetch VAPID key:', e.message);
    }

    // 3. Register Service Worker and PushManager if available
    if ('serviceWorker' in navigator && 'PushManager' in window && vapidPublicKey) {
      try {
        let registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
          registration = await navigator.serviceWorker.register('/push-sw.js');
        }
        await navigator.serviceWorker.ready;

        let subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
          const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey
          });
        }

        if (subscription) {
          await api.post('/chat/notifications/subscribe', {
            subscription: subscription.toJSON()
          });
        }
      } catch (swErr) {
        console.warn('⚠️ Service Worker PushManager subscription warning:', swErr.message);
      }
    }

    console.log('✅ Web Push Notification permission granted & active!');
    return true;
  } catch (err) {
    console.error('Failed to initialize push notifications:', err);
    return false;
  }
}

export async function isPushSubscribed() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  try {
    if (Notification.permission !== 'granted') return false;
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) return true;
      }
    }
    return Notification.permission === 'granted';
  } catch (err) {
    return Notification.permission === 'granted';
  }
}

export async function unsubscribePushNotifications() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  try {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await api.post('/chat/notifications/unsubscribe', { endpoint: subscription.endpoint });
          await subscription.unsubscribe();
        }
      }
    }
    return true;
  } catch (err) {
    console.error('Failed to unsubscribe push notifications:', err);
    return false;
  }
}
