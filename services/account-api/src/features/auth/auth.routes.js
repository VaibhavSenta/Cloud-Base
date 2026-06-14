const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const decryptRequest = require('../../common/middlewares/decryptMiddleware');
const protect = require('../../common/middlewares/authMiddleware');

// HANDSHAKE: Get Public Key
router.get('/handshake', authController.handshake);

// ME: Verify current user session
router.get('/me', protect, authController.getMe);

// UPDATE: Update user profile details
router.patch('/profile', protect, authController.updateProfile);

// SESSIONS: Terminate a specific device session
router.delete('/sessions/:sessionId', protect, authController.terminateSession);

// Apply decryption middleware to sensitive routes
router.post('/signup', decryptRequest, authController.signup);
router.post('/login', decryptRequest, authController.login);

// LOGOUT: Simple logout to clear session/cookies
router.post('/logout', authController.logout);

module.exports = router;
