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
        default: '/icons/person.svg'
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
        enum: ['active', 'deactivated', 'scheduled_deletion', 'deleted', 'banned'],
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
    emailVerificationToken: {
        type: String,
        required: false
    },
    emailVerificationExpires: {
        type: Date,
        required: false
    },
    newEmailPending: {
        type: String,
        required: false
    },
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },
    twoFactorMethods: {
        email: { type: Boolean, default: true },
        authenticator: { type: Boolean, default: false }
    },
    twoFactorPrimary: {
        type: String,
        enum: ['email', 'authenticator'],
        default: 'email'
    },
    authenticatorSecret: {
        type: String,
        required: false
    },
    twoFactorTempToken: {
        type: String,
        required: false
    },
    twoFactorTempTokenExpires: {
        type: Date,
        required: false
    },
    twoFactorLoginOtp: {
        type: String,
        required: false
    },
    twoFactorLoginOtpExpires: {
        type: Date,
        required: false
    },
    lastLogin: {
        type: Date
    },
    sessions: [{
        sessionId: String,
        deviceName: String,
        deviceType: String,
        browser: String,
        ipAddress: String,
        lastActive: { type: Date, default: Date.now },
        isCurrent: Boolean
    }],
    connectedServices: [{
        serviceId: { type: String, enum: ['vault', 'chat', 'social'] },
        connectedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true, autoIndex: false });

const LocalUser = mongoose.models.USER || mongoose.model('USER', userSchema);

module.exports = {
  USER: LocalUser
};
