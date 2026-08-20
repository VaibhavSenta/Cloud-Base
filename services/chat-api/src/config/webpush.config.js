/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
const webpush = require('web-push');

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || 'BHjl_MGRxzEtHyHguCxvoDQ6nCYhPIvwQhQlsVtxu6aStUFOhB-kdm1qJmlF7BLifbZgwS1u2AYOA9VwcWIJeWY';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || 'aoW8Ae-DFGgeF0H0wbtpZsk8oMScXHU-36PWtuiOyso';
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@nothingbox.site';

webpush.setVapidDetails(
  vapidSubject,
  vapidPublicKey,
  vapidPrivateKey
);

module.exports = {
  webpush,
  vapidPublicKey
};
