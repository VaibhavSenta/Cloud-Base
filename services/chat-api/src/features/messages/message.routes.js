const express = require('express');
const router = express.Router();
const messageController = require('./message.controller');

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

router.post('/send', verifyAuth, messageController.sendMessage);
router.get('/conversation/:conversationId', verifyAuth, messageController.getMessages);
router.post('/status', verifyAuth, messageController.updateStatus);

module.exports = router;
