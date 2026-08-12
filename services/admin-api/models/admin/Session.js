/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ADMIN',
        required: true
    },
    tokenHash: {
        type: String,
        required: true
    },
    ipAddress: String,
    userAgent: String,
    deviceType: String, // Mobile, Desktop, etc.
    location: String,
    lastActive: {
        type: Date,
        default: Date.now
    },
    isValid: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// 🎯 Indexing for lightning fast session lookups
sessionSchema.index({ tokenHash: 1 });
sessionSchema.index({ adminId: 1, isValid: 1 });

// ⏳ TTL Index: Automatically purge sessions after 30 days of inactivity
sessionSchema.index({ lastActive: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const SESSION = mongoose.model('SESSION', sessionSchema);

module.exports = { SESSION };
