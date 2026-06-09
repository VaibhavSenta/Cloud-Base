const webauthnService = require('../services/webauthn.service');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { SESSION } = require('../models/centralstation');

/**
 * Start Registration
 */
const startRegistration = async (req, res, next) => {
    try {
        const adminId = req.user._id;
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
        const adminId = req.user._id;
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
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                deviceType: req.get('User-Agent').includes('Mobile') ? 'Mobile' : 'Desktop'
            });
            await newSession.save();

            res.json({
                success: true,
                token: loginToken,
                user: {
                    firstname: user.firstname,
                    lastname: user.lastname,
                    isloggedin: true
                }
            });
        } else {
            res.status(400).json({ error: 'Biometric verification failed' });
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    startRegistration,
    finishRegistration,
    startAuthentication,
    finishAuthentication,
};
