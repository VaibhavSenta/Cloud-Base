const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    recoveryEmail: {
        type: String,
        required: false,
        default: 'not added'
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: false
    },
    lastName: {
        type: String,
        required: false
    },
    profilePic: {
        type: String,
        required: false,
        default: '/user-icon.png'
    },
    dob: {
        type: Date,
        required: false
    },
    gender: {
        type: String,
        required: false,
        enum: ['Male', 'Female', 'Other', 'Not selected'],
        default: 'Not selected'
    },
    countryCode: {
        type: String,
        required: false
    },
    phonenumber: {
        type: String,
        required: false,
        unique: true,
        sparse: true
    },
    accountStatus: {
        type: String,
        enum: ['active', 'deleted', 'banned', 'deactivated', 'scheduled_deletion'],
        default: 'active'
    },
    deletionDate: {
        type: Date,
        required: false
    },
    role: {
        type: String,
        enum: ['User', 'PartialUser', 'Admin'],
        default: 'User'
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    lastLogin: {
        type: Date
    },
    sessions: [{
        sessionId: String,
        deviceName: String,
        deviceType: String, // Mobile, Tablet, Desktop
        browser: String,
        ipAddress: String,
        lastActive: { type: Date, default: Date.now },
        isCurrent: Boolean // Temporary flag for UI convenience
    }]
}, { timestamps: true });

const USER = mongoose.model('USER', userSchema);

module.exports = {
    USER
};
