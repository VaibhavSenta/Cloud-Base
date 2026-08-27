/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
const express = require('express');
const router = express.Router();
const conversationController = require('./conversation.controller');
const verifyAuth = require('../../middleware/auth.middleware');

router.post('/initiate', verifyAuth, conversationController.createOrGetConversation);
router.get('/list', verifyAuth, conversationController.getConversations);
router.post('/:conversationId/accept', verifyAuth, conversationController.acceptRequest);
router.post('/:conversationId/reject', verifyAuth, conversationController.rejectRequest);
router.post('/:conversationId/cancel', verifyAuth, conversationController.cancelRequest);

module.exports = router;
