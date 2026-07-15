const { parseDeviceInfo } = require('./session.service');

/**
 * Logs a security event to the user's activity logs following industry compliance patterns.
 */
const logSecurityEvent = async (user, action, req, options = {}) => {
  if (!user) return;
  
  const deviceInfo = parseDeviceInfo(req);
  
  if (!user.activityLogs) {
    user.activityLogs = [];
  }
  
  // Create audit log event conforming to industry standards
  user.activityLogs.push({
    action,
    domain: options.domain || 'SECURITY',
    actor: options.actor || 'USER',
    status: options.status || 'SUCCESS',
    metadata: options.metadata || {},
    routePath: options.routePath || req.originalUrl || req.url || '',
    ipAddress: deviceInfo.ipAddress,
    browser: deviceInfo.browser,
    timestamp: new Date()
  });
  
  // Limit to 30 activity logs to prevent MongoDB document bloating
  if (user.activityLogs.length > 30) {
    user.activityLogs.shift();
  }
  
  // Trigger save operation
  await user.save();
};

module.exports = {
  logSecurityEvent
};
