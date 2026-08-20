/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
const jwt = require('jsonwebtoken');

const verifyAuth = (req, res, next) => {
  try {
    let token = req.cookies?.cb_chat_token || req.cookies?.token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ error: 'Access Denied: Auth token missing.' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'CB_SUPER_SECRET_KEY_FOR_LOCAL_DEV');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Access Denied: Invalid authentication parameters.' });
  }
};

module.exports = verifyAuth;
