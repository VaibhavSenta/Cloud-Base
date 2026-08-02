const express = require('express');
const router = express.Router();
const userController = require('./user.controller');

// Global Auth verification parser middleware matching socket logic
// In Phase 3, we extend to support double-decrypted tokens validation
const verifyAuth = (req, res, next) => {
  try {
    let token = req.cookies?.token;

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

// Open endpoint (No token needed for initial username avail checking)
router.post('/check-username', userController.checkUsername);

// Secure endpoints
router.post('/profile', verifyAuth, userController.createProfile);
router.get('/profile', verifyAuth, userController.getProfile);
router.get('/search', verifyAuth, userController.searchUser);

module.exports = router;
