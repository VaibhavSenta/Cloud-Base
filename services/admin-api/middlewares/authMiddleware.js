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
        const userRoles = req.user.role; // Role array: ['HRD0', 'HRD1']

        // Check: is there any role in userRoles that is also in allowedRoles?
        const hasAccess = userRoles.some(role => allowedRoles.includes(role));

        if (hasAccess) {
            console.log(`Access granted for roles: ${userRoles.join(", ")}`);
            next();
        } else {
            console.log(`Access denied for roles: ${userRoles.join(", ")}. Required roles: ${allowedRoles.join(", ")}`);
            return res.status(403).json({ msg: "Access Denied" });
        }
    };
};


module.exports = { 
    
    verifyToken,
    checkRouteAccess
};