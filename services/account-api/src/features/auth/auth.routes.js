const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('./auth.controller');
const decryptRequest = require('../../common/middlewares/decryptMiddleware');
const protect = require('../../common/middlewares/authMiddleware');

// Rate limit email verification requests: 3 requests per 5 minutes
const emailVerificationLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 3,
    message: {
        success: false,
        message: 'Too many verification requests. Please wait 5 minutes before trying again.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limit 2FA login verification attempts
const login2faLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: 'Too many verification attempts. Please wait 5 minutes before trying again.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// HANDSHAKE: Get Public Key
router.get('/handshake', authController.handshake);

// ME: Verify current user session
router.get('/me', protect, authController.getMe);

// UPDATE: Update user profile details
router.patch('/profile', protect, decryptRequest, authController.updateProfile);

// SESSIONS: Terminate a specific device session
router.delete('/sessions/:sessionId', protect, authController.terminateSession);

// EMAIL VERIFICATION: Request and Confirm verification links
router.post('/verify-email/request', protect, emailVerificationLimiter, authController.requestEmailVerification);
router.post('/verify-email/confirm', authController.confirmEmailVerification);
router.post('/change-email/request', protect, emailVerificationLimiter, authController.requestEmailChange);

// 2FA CONFIGURATION: Setup, verify, and update settings
router.post('/2fa/authenticator/setup', protect, authController.setup2faAuthenticator);
router.post('/2fa/authenticator/verify', protect, authController.verify2faAuthenticator);
router.patch('/2fa/settings', protect, authController.update2faSettings);

// 2FA LOGIN: Verify login code
router.post('/login/verify-2fa', login2faLimiter, authController.verify2faLogin);
router.post('/login/resend-2fa', authController.resend2faLogin);

// Apply decryption middleware to sensitive routes
router.post('/signup', decryptRequest, authController.signup);
router.post('/login', decryptRequest, authController.login);
router.post('/social-login', decryptRequest, authController.socialLogin);
router.post('/deactivate', protect, decryptRequest, authController.deactivateAccount);
router.post('/delete', protect, decryptRequest, authController.deleteAccount);
router.post('/reactivate', decryptRequest, authController.reactivateAccount);

// CONNECTED SERVICES: Onboard and offboard connected applications
router.post('/connected-services/connect', protect, authController.connectService);
router.post('/connected-services/disconnect', protect, authController.disconnectService);

// LOGOUT: Simple logout to clear session/cookies
router.post('/logout', authController.logout);

module.exports = router;
