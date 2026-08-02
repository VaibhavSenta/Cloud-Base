const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    participantA: {
      type: String,
      required: true,
      index: true
    },
    participantB: {
      type: String,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'rejected'],
      default: 'pending'
    },
    requestedBy: {
      type: String,
      required: true
    },
    lastMessageTimestamp: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Composite index for fast participant lookups
conversationSchema.index({ participantA: 1, participantB: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
