const express = require('express');
const router = express.Router();
const userController = require('./user.controller');

// Global Auth verification parser middleware matching socket logic
// In Phase 3, we extend to support double-decrypted tokens validation
const verifyAuth = (req, res, next) => {
  try {
    let token = req.cookies?.cb_chat_token || req.cookies?.token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Access Denied: Auth token missing.' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'CB_SUPER_SECRET_KEY_FOR_LOCAL_DEV');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Access Denied: Invalid authentication parameters.' });
  }
};

// Open endpoints (No token needed for initial username check & Bloom Filter sync)
router.post('/check-username', userController.checkUsername);
router.get('/bloom-filter', userController.getBloomFilter);
router.post('/logout-session', userController.logoutSession);

// Secure endpoints
router.post('/profile', verifyAuth, userController.createProfile);
router.get('/profile', verifyAuth, userController.getProfile);
router.put('/profile/public-key', verifyAuth, userController.updatePublicKey);
router.get('/search', verifyAuth, userController.searchUser);

module.exports = router;
