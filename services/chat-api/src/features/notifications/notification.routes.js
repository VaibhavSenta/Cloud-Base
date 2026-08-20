/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
const express = require('express');
const router = express.Router();
const verifyAuth = require('../../common/middlewares/auth.middleware');
const {
  getVapidPublicKey,
  subscribePush,
  unsubscribePush
} = require('./notification.controller');

router.get('/vapid-public-key', verifyAuth, getVapidPublicKey);
router.post('/subscribe', verifyAuth, subscribePush);
router.post('/unsubscribe', verifyAuth, unsubscribePush);

module.exports = router;
