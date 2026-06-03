const SecurityService = require('../services/SecurityService');
const { SESSION } = require('../models/centralstation');
const crypto = require('crypto');

const verifyToken = async (req, res, next) => {

    const token = req.cookies.login_token;

    if (!token) {
        return res.status(401).json({ msg: "Login Required" });
    }

    try {
        // 1. Verify JWT basic integrity
        const userData = SecurityService.verifyLoginToken(token);
        
        // 2. 🎯 Check if Session is still valid in DB
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const session = await SESSION.findOne({ tokenHash, isValid: true });

        if (!session) {
            res.clearCookie('login_token');
            return res.status(401).json({ msg: "Session Expired or Terminated" });
        }

        // Update last active timestamp (Async, don't wait)
        SESSION.updateOne({ _id: session._id }, { lastActive: new Date() }).exec();

        req.user = userData; 
        next();
    } catch (err) {
        return res.status(401).json({ msg: err.message });
    }
};


// Role-based access control middleware
const checkRouteAccess = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            console.error("❌ RBAC Error: No user roles found in request.");
            return res.status(403).json({ msg: "Access Denied: No Roles Assigned" });
        }

        const userRoles = req.user.role; // Role array: ['ROOT', 'MANAGER']

        try {
            // Check: is there any role in userRoles that is also in allowedRoles?
            const hasAccess = Array.isArray(userRoles) 
                ? userRoles.some(role => allowedRoles.includes(role))
                : allowedRoles.includes(userRoles);

            if (hasAccess) {
                next();
            } else {
                console.log(`🚫 Access denied for roles: ${userRoles}. Required roles: ${allowedRoles.join(", ")}`);
                return res.status(403).json({ msg: "Access Denied: Insufficient Permissions" });
            }
        } catch (err) {
            console.error("❌ RBAC Middleware Crash:", err.message);
            return res.status(500).json({ msg: "Internal Security Error" });
        }
    };
};


module.exports = { 
    
    verifyToken,
    checkRouteAccess
};