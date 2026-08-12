/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
const webauthnService = require('../services/webauthn.service');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { SESSION, ADMIN } = require('../models/centralstation');

/**
 * Start Registration
 */
const startRegistration = async (req, res, next) => {
    try {
        // req.user comes from verifyToken middleware (decoded JWT)
        // Usually, the ID is stored as req.user.id or req.user._id depending on how it was signed
        const adminId = req.user.id || req.user._id; 
        
        if (!adminId) {
            return res.status(401).json({ error: 'User ID not found in token' });
        }

        const options = await webauthnService.getRegistrationOptions(adminId);
        
        // Store challenge in session to verify later
        req.session.currentChallenge = options.challenge;
        
        res.json(options);
    } catch (error) {
        next(error);
    }
};

/**
 * Finish Registration
 */
const finishRegistration = async (req, res, next) => {
    try {
        const adminId = req.user.id || req.user._id;
        const expectedChallenge = req.session.currentChallenge;

        if (!expectedChallenge) {
            return res.status(400).json({ error: 'No challenge found in session' });
        }

        const verification = await webauthnService.verifyRegistration(
            adminId,
            req.body,
            expectedChallenge
        );

        req.session.currentChallenge = null;

        if (verification.verified) {
            res.json({ success: true, message: 'Biometric registered successfully' });
        } else {
            res.status(400).json({ error: 'Verification failed' });
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Start Authentication
 */
const startAuthentication = async (req, res, next) => {
    try {
        const { loginid } = req.body;
        if (!loginid) return res.status(400).json({ error: 'Login ID required' });

        const options = await webauthnService.getAuthenticationOptions(loginid);
        
        // Store challenge and loginid in session
        req.session.currentChallenge = options.challenge;
        req.session.loginidForAuth = loginid;
        
        res.json(options);
    } catch (error) {
        next(error);
    }
};

/**
 * Finish Authentication (Log the user in)
 */
const finishAuthentication = async (req, res, next) => {
    try {
        const expectedChallenge = req.session.currentChallenge;
        const loginid = req.session.loginidForAuth;

        if (!expectedChallenge || !loginid) {
            return res.status(400).json({ error: 'Authentication state missing' });
        }

        const { verification, user } = await webauthnService.verifyAuthentication(
            loginid,
            req.body,
            expectedChallenge
        );

        req.session.currentChallenge = null;
        req.session.loginidForAuth = null;

        if (verification.verified) {
            // Generate JWT and Session (same as regular login)
            const tokenData = user.toObject();
            delete tokenData.password;
            delete tokenData.webauthnCredentials;

            const loginToken = jwt.sign(tokenData, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });
            const tokenHash = crypto.createHash('sha256').update(loginToken).digest('hex');

            const newSession = new SESSION({
                adminId: user._id,
                tokenHash: tokenHash,
                ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                userAgent: req.get('User-Agent'),
                deviceType: req.get('User-Agent').includes('Mobile') ? 'Mobile' : 'Desktop'
            });
            await newSession.save();

            const userInfo = {
                firstname: user.firstname,
                lastname: user.lastname,
                isloggedin: true
            };

            // Set identical cookies as auth.controller.js
            res.cookie("login_token", loginToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 24 * 60 * 60 * 1000,
            });
            res.cookie("user_info", userInfo, {
                httpOnly: false,
                secure: process.env.NODE_ENV === "production",
                maxAge: 24 * 60 * 60 * 1000,
            });

            // Enhanced Audit Logging
            await require('../services/audit.service').createEnhancedLog({
                adminId: user._id,
                action: 'ADMIN_LOGIN',
                targetId: null,
                appTitle: 'Admin Console Access',
                details: { event: 'Successful Login (Biometric/Passkey)' },
                ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress
            });

            res.json({
                success: true,
                token: loginToken,
                user: userInfo
            });
        } else {
            res.status(400).json({ error: 'Biometric verification failed' });
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Remove all Biometric Credentials for a user
 */
const removeCredentials = async (req, res, next) => {
    try {
        const adminId = req.user.id || req.user._id;
        
        await ADMIN.findByIdAndUpdate(adminId, {
            $set: { webauthnCredentials: [] }
        });

        res.json({ success: true, message: 'All biometric access revoked successfully.' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    startRegistration,
    finishRegistration,
    startAuthentication,
    finishAuthentication,
    removeCredentials,
};
