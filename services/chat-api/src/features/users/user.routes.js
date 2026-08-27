/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const verifyAuth = require('../../middleware/auth.middleware');

// Open endpoints (No token needed for initial username check & Bloom Filter sync)
router.post('/check-username', userController.checkUsername);
router.get('/bloom-filter', userController.getBloomFilter);
router.post('/logout-session', userController.logoutSession);

// Secure endpoints
router.post('/profile', verifyAuth, userController.createProfile);
router.get('/profile', verifyAuth, userController.getProfile);
router.put('/profile/avatar', verifyAuth, userController.updateAvatarUrl);
router.put('/profile/username', verifyAuth, userController.updateUsername);
router.put('/profile/public-key', verifyAuth, userController.updatePublicKey);
router.put('/profile/encrypted-private-key', verifyAuth, userController.updateEncryptedPrivateKey);
router.get('/search', verifyAuth, userController.searchUser);

module.exports = router;
