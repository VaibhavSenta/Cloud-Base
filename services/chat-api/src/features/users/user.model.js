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
    required: true // Store the client's RSA Public Key for asymmetric wrap routing
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ChatProfile', chatProfileSchema);
