/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
const { webpush, vapidPublicKey } = require('../../config/webpush.config');
const ChatProfile = require('../users/user.model');

// Get VAPID Public Key
const getVapidPublicKey = async (req, res) => {
  try {
    return res.status(200).json({ vapidPublicKey });
  } catch (error) {
    console.error('Error fetching VAPID public key:', error);
    return res.status(500).json({ error: 'Failed to fetch VAPID key' });
  }
};

// Subscribe device for Web Push
const subscribePush = async (req, res) => {
  try {
    const currentUserId = req.user.userId || req.user.id || req.user._id;
    const { subscription } = req.body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ error: 'Valid subscription object is required' });
    }

    const profile = await ChatProfile.findOne({ userId: String(currentUserId) });
    if (!profile) {
      return res.status(404).json({ error: 'Chat profile not found' });
    }

    // Filter out existing subscription with same endpoint to avoid duplicates
    profile.pushSubscriptions = (profile.pushSubscriptions || []).filter(
      sub => sub.endpoint !== subscription.endpoint
    );

    profile.pushSubscriptions.push({
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth
      },
      createdAt: new Date()
    });

    await profile.save();
    return res.status(200).json({ success: true, message: 'Push subscription saved successfully' });
  } catch (error) {
    console.error('Error saving push subscription:', error);
    return res.status(500).json({ error: 'Failed to save push subscription' });
  }
};

// Unsubscribe device from Web Push
const unsubscribePush = async (req, res) => {
  try {
    const currentUserId = req.user.userId || req.user.id || req.user._id;
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({ error: 'Subscription endpoint is required' });
    }

    const profile = await ChatProfile.findOne({ userId: String(currentUserId) });
    if (profile) {
      profile.pushSubscriptions = (profile.pushSubscriptions || []).filter(
        sub => sub.endpoint !== endpoint
      );
      await profile.save();
    }

    return res.status(200).json({ success: true, message: 'Push subscription removed' });
  } catch (error) {
    console.error('Error removing push subscription:', error);
    return res.status(500).json({ error: 'Failed to remove push subscription' });
  }
};

// Utility function to send Web Push notification to a target user
const sendPushNotification = async (targetUserId, payload) => {
  try {
    const profile = await ChatProfile.findOne({ userId: String(targetUserId) });
    if (!profile || !profile.pushSubscriptions || profile.pushSubscriptions.length === 0) {
      return;
    }

    const expiredEndpoints = [];

    const sendPromises = profile.pushSubscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth
        }
      };

      try {
        await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          expiredEndpoints.push(sub.endpoint);
        } else {
          console.error(`Error sending web push to endpoint ${sub.endpoint}:`, err.message);
        }
      }
    });

    await Promise.all(sendPromises);

    // Auto-clean expired endpoints if any
    if (expiredEndpoints.length > 0) {
      profile.pushSubscriptions = profile.pushSubscriptions.filter(
        sub => !expiredEndpoints.includes(sub.endpoint)
      );
      await profile.save();
    }
  } catch (error) {
    console.error('Error in sendPushNotification:', error);
  }
};

module.exports = {
  getVapidPublicKey,
  subscribePush,
  unsubscribePush,
  sendPushNotification
};
