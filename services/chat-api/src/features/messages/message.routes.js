/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
const express = require('express');
const router = express.Router();
const messageController = require('./message.controller');
const verifyAuth = require('../../middleware/auth.middleware');

router.post('/send', verifyAuth, messageController.sendMessage);
router.get('/conversation/:conversationId', verifyAuth, messageController.getMessages);
router.post('/status', verifyAuth, messageController.updateStatus);

module.exports = router;
