/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
const express = require('express');
const router = express.Router();
const conversationController = require('./conversation.controller');

const verifyAuth = (req, res, next) => {
  try {
    let token = req.cookies?.cb_chat_token || req.cookies?.token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ error: 'Access Denied: Auth token missing.' });
    }
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'CB_SUPER_SECRET_KEY_FOR_LOCAL_DEV');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Access Denied: Invalid authentication parameters.' });
  }
};

router.post('/initiate', verifyAuth, conversationController.createOrGetConversation);
router.get('/list', verifyAuth, conversationController.getConversations);
router.post('/:conversationId/accept', verifyAuth, conversationController.acceptRequest);
router.post('/:conversationId/reject', verifyAuth, conversationController.rejectRequest);
router.post('/:conversationId/cancel', verifyAuth, conversationController.cancelRequest);

module.exports = router;
