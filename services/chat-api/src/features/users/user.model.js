/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
const mongoose = require('mongoose');

const chatProfileSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  chatUsername: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
    minlength: 3,
    maxlength: 30
  },
  publicKey: {
    type: String,
    required: false,
    default: ''
  },
  encryptedPrivateKey: {
    type: String,
    required: false,
    default: ''
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['online', 'offline'],
    default: 'offline'
  },
  pushSubscriptions: [
    {
      endpoint: { type: String, required: true },
      keys: {
        p256dh: { type: String, required: true },
        auth: { type: String, required: true }
      },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ChatProfile', chatProfileSchema);
