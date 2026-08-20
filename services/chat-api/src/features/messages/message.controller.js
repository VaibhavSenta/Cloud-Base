/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
const Message = require('./message.model');
const Conversation = require('../conversations/conversation.model');
const { getIO } = require('../../config/socket');

/**
 * Send encrypted message payload
 * Stores zero-knowledge encrypted string in DB and broadcasts socket event
 */
const sendMessage = async (req, res) => {
  try {
    const { messageId, conversationId, receiverId, encryptedPayload } = req.body;
    const senderId = String(req.user.userId || req.user.id || req.user._id);

    if (!messageId || !conversationId || !receiverId || !encryptedPayload) {
      return res.status(400).json({ error: 'Missing required message parameters.' });
    }

    // Verify conversation exists
    const conversation = await Conversation.findOne({ conversationId });
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }

    // Deduplication check
    const existingMessage = await Message.findOne({ messageId });
    if (existingMessage) {
      return res.status(200).json({ status: 'exists', message: existingMessage });
    }

    const message = new Message({
      messageId,
      conversationId,
      senderId,
      receiverId: String(receiverId),
      encryptedPayload,
      status: 'sent',
      timestamp: new Date()
    });

    await message.save();

    // Update conversation timestamp
    conversation.lastMessageTimestamp = new Date();
    await conversation.save();

    // Broadcast real-time Socket event to receiver personal room
    try {
      const io = getIO();
      io.to(String(receiverId)).emit('new_message', {
        messageId: message.messageId,
        conversationId: message.conversationId,
        senderId: message.senderId,
        receiverId: message.receiverId,
        encryptedPayload: message.encryptedPayload,
        status: message.status,
        timestamp: message.timestamp
      });
    } catch (socketErr) {
      console.error('⚠️ Socket emit warning:', socketErr.message);
    }

    // Send background Web Push Notification to receiver
    try {
      const ChatProfile = require('../users/user.model');
      const senderProfile = await ChatProfile.findOne({ userId: senderId });
      const senderName = senderProfile?.chatUsername ? `@${senderProfile.chatUsername}` : 'Someone';

      const { sendPushNotification } = require('../notifications/notification.controller');
      sendPushNotification(String(receiverId), {
        title: senderName,
        body: 'Sent you a message',
        data: {
          conversationId: message.conversationId,
          type: 'new_message'
        }
      });
    } catch (pushErr) {
      console.error('⚠️ Web push dispatch warning:', pushErr.message);
    }

    return res.status(201).json({ status: 'success', message });
  } catch (error) {
    return res.status(500).json({ error: `Failed to send message: ${error.message}` });
  }
};

/**
 * Get messages history for a conversation
 */
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, before } = req.query;
    const currentUserId = String(req.user.userId || req.user.id || req.user._id);

    const conversation = await Conversation.findOne({ conversationId });
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }

    // Verify user is participant
    if (conversation.participantA !== currentUserId && conversation.participantB !== currentUserId) {
      return res.status(403).json({ error: 'Not authorized to view these messages.' });
    }

    const query = { conversationId };
    if (before) {
      query.timestamp = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .sort({ timestamp: 1 })
      .limit(parseInt(limit));

    return res.status(200).json({ messages });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve messages.' });
  }
};

/**
 * Mark messages as delivered or read
 */
const updateStatus = async (req, res) => {
  try {
    const { messageIds, status } = req.body;
    const currentUserId = String(req.user.userId || req.user.id || req.user._id);

    if (!Array.isArray(messageIds) || !['delivered', 'read'].includes(status)) {
      return res.status(400).json({ error: 'Invalid parameters for status update.' });
    }

    await Message.updateMany(
      { messageId: { $in: messageIds }, receiverId: currentUserId },
      { $set: { status } }
    );

    // Get affected messages to notify senders
    const updatedMessages = await Message.find({ messageId: { $in: messageIds } });

    try {
      const io = getIO();
      updatedMessages.forEach(msg => {
        io.to(String(msg.senderId)).emit('message_status_change', {
          messageId: msg.messageId,
          conversationId: msg.conversationId,
          status
        });
      });
    } catch (socketErr) {
      console.error('⚠️ Socket status update warning:', socketErr.message);
    }

    return res.status(200).json({ status: 'success', updatedCount: updatedMessages.length });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update message status.' });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  updateStatus
};
