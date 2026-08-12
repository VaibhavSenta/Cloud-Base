/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
const crypto = require('crypto');

/**
 * Parses the User-Agent string to identify device and browser.
 */
const parseDeviceInfo = (req) => {
  const ua = req.headers['user-agent'] || '';
  let deviceName = 'Unknown Device';
  let deviceType = 'Desktop';
  let browser = 'Unknown Browser';

  // Basic Device Detection
  if (/iPhone/i.test(ua)) {
    deviceName = 'iPhone';
    deviceType = 'Mobile';
  } else if (/Android/i.test(ua)) {
    deviceName = 'Android Device';
    deviceType = 'Mobile';
  } else if (/iPad/i.test(ua)) {
    deviceName = 'iPad';
    deviceType = 'Tablet';
  } else if (/Windows/i.test(ua)) {
    deviceName = 'Windows PC';
    deviceType = 'Desktop';
  } else if (/Macintosh/i.test(ua)) {
    deviceName = 'MacBook';
    deviceType = 'Desktop';
  }

  // Basic Browser Detection
  if (/Chrome/i.test(ua)) browser = 'Chrome';
  else if (/Safari/i.test(ua)) browser = 'Safari';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Edg/i.test(ua)) browser = 'Edge';

  return {
    deviceName,
    deviceType,
    browser,
    ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
    sessionId: crypto.randomBytes(16).toString('hex')
  };
};

/**
 * Adds or updates a session in the user's sessions array.
 */
const registerSession = async (user, deviceInfo) => {
  // Keep only the last 5 sessions to prevent array bloat
  if (user.sessions.length >= 10) {
    user.sessions.shift();
  }

  user.sessions.push({
    ...deviceInfo,
    lastActive: new Date()
  });

  await user.save();
  return deviceInfo.sessionId;
};

module.exports = {
  parseDeviceInfo,
  registerSession
};
