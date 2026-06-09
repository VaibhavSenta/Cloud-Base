const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true, unique: false },
    lastname: { type: String, required: false, unique: false }, // Yahan lastname aayega
    loginid: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
      type: [String], 
      default: ['VIEWER'],
      enum: ['ROOT', 'MANAGER', 'VIEWER'] 
    },
    webauthnCredentials: [{
      credentialID: { type: Buffer, required: true },
      publicKey: { type: Buffer, required: true },
      counter: { type: Number, default: 0 },
      transports: [String],
      createdAt: { type: Date, default: Date.now }
    }],
    pushSubscriptions: [{
      endpoint: { type: String, required: true },
      expirationTime: { type: Number, default: null },
      keys: {
        p256dh: { type: String, required: true },
        auth: { type: String, required: true }
      },
      createdAt: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true },
);

const ADMIN = mongoose.model("ADMIN", adminSchema);

module.exports = {
  ADMIN,
};
