// middleware/authMiddleware.js
const sessionMap = require('../config/sessionStore');

const verifyActiveSession = (req, res, next) => {

    // Check karo ki kya Map khali hai ya is user ka data missing hai
    if (sessionMap.size === 0) {
        // Clearing cookies and logging out
        res.clearCookie('login_token')
        res.clearCookie('rsa_public_key')
        res.clearCookie('session_sec_key')

        return res.status(401).json({ 
            error: "Security Session Expired", 
            message: "Please login...." 
        });
    }

    next(); // Sab sahi hai, aage badho
};

module.exports = { verifyActiveSession };