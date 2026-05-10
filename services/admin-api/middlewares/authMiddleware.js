const SecurityService = require('../services/SecurityService');

const verifyToken = (req, res, next) => {

    console.log("Verifying token...");
    const token = req.cookies.login_token;

    if (!token) {
        console.log("No token found in cookies");
        return res.status(401).json({ msg: "Login Required" });
    }

    try {
        // Service ko bulaya kaam karne ke liye
        const userData = SecurityService.verifyLoginToken(token);
        req.user = userData; 
        console.log("User verified:");
        next();
    } catch (err) {
        console.log("Error verifying token:", err.message);
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