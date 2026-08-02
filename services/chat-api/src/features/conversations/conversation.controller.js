const { v4: uuidv4 } = require('crypto'); // Built-in Node crypto UUID
const Conversation = require('./conversation.model');
const ChatProfile = require('../users/user.model');

// Custom UUID v4 generator using crypto
const generateUUID = () => {
  const crypto = require('crypto');
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Find conversation or create a new message request
 * Enforces Exact Username Match Privacy Rule
 */
const createOrGetConversation = async (req, res) => {
  try {
    const { targetUsername } = req.body;
    const currentUserId = req.user.userId || req.user.id || req.user._id;

    if (!targetUsername) {
      return res.status(400).json({ error: 'Target username is required.' });
    }

    const cleanedUsername = targetUsername.trim().toLowerCase();

    // 1. Lookup exact target profile
    const targetProfile = await ChatProfile.findOne({ chatUsername: cleanedUsername });
    if (!targetProfile) {
      return res.status(404).json({ error: 'User not found. Exact username match only.' });
    }

    if (String(targetProfile.userId) === String(currentUserId)) {
      return res.status(400).json({ error: 'You cannot message yourself.' });
    }

    const targetUserId = String(targetProfile.userId);

    // 2. Check existing conversation between participantA and participantB
    let conversation = await Conversation.findOne({
      $or: [
        { participantA: currentUserId, participantB: targetUserId },
        { participantA: targetUserId, participantB: currentUserId }
      ]
    });

    if (!conversation) {
      const newId = generateUUID();
      conversation = new Conversation({
        conversationId: newId,
        participantA: currentUserId,
        participantB: targetUserId,
        status: 'pending',
        requestedBy: currentUserId,
        lastMessageTimestamp: new Date()
      });
      await conversation.save();
    }

    return res.status(200).json({
      conversation,
      targetUser: {
        userId: targetProfile.userId,
        chatUsername: targetProfile.chatUsername,
        publicKey: targetProfile.publicKey,
        avatarUrl: targetProfile.avatarUrl
      }
    });
  } catch (error) {
    return res.status(500).json({ error: `Failed to initiate conversation: ${error.message}` });
  }
};

/**
 * Get all conversations for current user (Inbox & Requests)
 */
const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user.userId || req.user.id || req.user._id;

    const conversations = await Conversation.find({
      $or: [
        { participantA: currentUserId },
        { participantB: currentUserId }
      ]
    }).sort({ lastMessageTimestamp: -1 });

    // Populate partner details
    const populatedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const partnerId = String(conv.participantA) === String(currentUserId) 
          ? conv.participantB 
          : conv.participantA;

        const partnerProfile = await ChatProfile.findOne({ userId: partnerId });

        return {
          ...conv.toObject(),
          partner: partnerProfile ? {
            userId: partnerProfile.userId,
            chatUsername: partnerProfile.chatUsername,
            publicKey: partnerProfile.publicKey,
            avatarUrl: conv.status === 'active' ? partnerProfile.avatarUrl : null // Hidden if not accepted
          } : null
        };
      })
    );

    return res.status(200).json({ conversations: populatedConversations });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve conversations.' });
  }
};

/**
 * Accept Message Request (Opt-in Rule)
 */
const acceptRequest = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user.userId || req.user.id || req.user._id;

    const conversation = await Conversation.findOne({ conversationId });
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }

    // Only receiver of the request can accept
    if (String(conversation.requestedBy) === String(currentUserId)) {
      return res.status(400).json({ error: 'Sender cannot accept their own request.' });
    }

    conversation.status = 'active';
    await conversation.save();

    return res.status(200).json({ status: 'success', conversation });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to accept message request.' });
  }
};

module.exports = {
  createOrGetConversation,
  getConversations,
  acceptRequest
};
