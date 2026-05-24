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

const SESSION = mongoose.model('SESSION', sessionSchema);

module.exports = { SESSION };
