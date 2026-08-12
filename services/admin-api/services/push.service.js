/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
const webpush = require('web-push');
const { ADMIN } = require('../models/admin/admin');

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BAq8ZUZgMdGXgqtGlMgQjJ4C1sIlzED6wv8fofPoEFej8FBT-KKXFn8_WkI0HdRHeGHZFf0bYRBcrsQ-uJVRVaQ';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'KAbBbcMqkAbZu8CKJhbhR0RQf-f1gbpyG4lddGvdhZ8';

webpush.setVapidDetails(
    'mailto:admin@cloudbase.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
);

/**
 * Save a push subscription for an admin
 */
async function saveSubscription(adminId, subscription) {
    const user = await ADMIN.findById(adminId);
    if (!user) throw new Error('Admin not found');

    // Check if subscription already exists
    const exists = user.pushSubscriptions.some(sub => sub.endpoint === subscription.endpoint);
    if (!exists) {
        user.pushSubscriptions.push(subscription);
        await user.save();
    }
    return { success: true };
}

/**
 * Send notification to all subscribed devices of an admin
 */
async function sendNotificationToAdmin(adminId, payload) {
    const user = await ADMIN.findById(adminId);
    if (!user) return;

    const notifications = user.pushSubscriptions.map(sub => {
        return webpush.sendNotification(sub, JSON.stringify(payload))
            .catch(err => {
                if (err.statusCode === 410 || err.statusCode === 404) {
                    // Subscription expired or no longer valid
                    return ADMIN.updateOne(
                        { _id: adminId },
                        { $pull: { pushSubscriptions: { endpoint: sub.endpoint } } }
                    );
                }
                console.error('Error sending push:', err);
            });
    });

    return Promise.all(notifications);
}

/**
 * Global Broadcast (Send to all admins)
 */
async function broadcastNotification(payload) {
    const admins = await ADMIN.find({});
    const tasks = admins.map(admin => sendNotificationToAdmin(admin._id, payload));
    return Promise.all(tasks);
}

module.exports = {
    saveSubscription,
    sendNotificationToAdmin,
    broadcastNotification,
    VAPID_PUBLIC_KEY
};
