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
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push notifications not supported in this browser context.');
    return false;
  }

  try {
    // 1. Request Notification Permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Push notification permission denied.');
      return false;
    }

    // 2. Fetch VAPID Public Key from backend
    const keyRes = await api.get('/chat/notifications/vapid-public-key');
    const vapidPublicKey = keyRes.data?.vapidPublicKey;
    if (!vapidPublicKey) {
      console.error('VAPID public key not returned from backend.');
      return false;
    }

    // 3. Register or get Service Worker registration
    let registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      registration = await navigator.serviceWorker.register('/sw.js');
    }
    await navigator.serviceWorker.ready;

    // 4. Check existing push subscription or create new
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });
    }

    // 5. Send subscription to backend
    await api.post('/chat/notifications/subscribe', {
      subscription: subscription.toJSON()
    });

    console.log('✅ Web Push Notification registered & subscribed successfully!');
    return true;
  } catch (err) {
    console.error('Failed to initialize push notifications:', err);
    return false;
  }
}

export async function isPushSubscribed() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return false;
  }
  try {
    if (Notification.permission !== 'granted') return false;
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return false;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch (err) {
    return false;
  }
}

export async function unsubscribePushNotifications() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return false;
  }
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await api.post('/chat/notifications/unsubscribe', { endpoint: subscription.endpoint });
        await subscription.unsubscribe();
      }
    }
    return true;
  } catch (err) {
    console.error('Failed to unsubscribe push notifications:', err);
    return false;
  }
}
