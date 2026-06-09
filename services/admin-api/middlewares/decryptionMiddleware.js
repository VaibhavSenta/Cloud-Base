const EncryptionService = require('../services/EncryptionService');
const { GLOBALCONFIG } = require('../models/centralstation');
const crypto = require('crypto');
const mongoose = require('mongoose');

/**
 * decryptionMiddleware - Decrypts req.body if encryption is enabled globally
 */
const decryptionMiddleware = async (req, res, next) => {
    try {
        // 0. Ensure DB Connection is ready
        if (mongoose.connection.readyState !== 1) {
            console.log("⏳ DB Connection not ready in middleware, skipping security check.");
            return next(); // Fail-safe: Skip if DB not ready yet
        }

        // 1. Check if Encryption is toggled ON in Settings
        const config = await GLOBALCONFIG.findOne({ key: 'is_encryption_enabled' });
        const isEnabled = config ? config.value === true : false;

        if (!isEnabled) {
            return next(); // Skip if disabled
        }

        // 2. Identify the Session
        let sessionId = null;

        // Priority 1: Trust the Frontend's explicit keyID (The most reliable source)
        if (req.body && req.body.keyID) {
            sessionId = req.body.keyID;
            console.log("🔍 Session ID from Frontend (Body):", sessionId);
        } 
        // Priority 2: Cookie login_token
        else if (req.cookies.login_token) {
            sessionId = crypto.createHash('sha256').update(req.cookies.login_token).digest('hex');
            console.log("🔍 Session ID derived from login_token:", sessionId);
        }
        // Priority 3: Fallback to Cookies or Headers
        else {
            sessionId = req.cookies.temp_key_id || req.headers['x-key-id'];
            if (sessionId) console.log("🔍 Session ID found in Temp Cookie/Header:", sessionId);
        }

        if (!sessionId) {
            return next(); 
        }

        // 3. Check if body is encrypted
        if (req.body && req.body.encryptedData && req.body.encryptedKey) {
            const { encryptedKey, encryptedData, iv } = req.body;
            
            console.log("🔓 Attempting decryption for session:", sessionId);
            
            try {
                // Decrypt using our service
                const decryptedData = EncryptionService.decryptSimple(
                    sessionId, 
                    encryptedKey, 
                    encryptedData, 
                    iv
                );

                // 4. Magic: Replace req.body so controllers don't have to change!
                req.body = decryptedData;
                console.log("✅ Decryption Successful");
            } catch (decryptErr) {
                console.error("❌ Decryption Failed:", decryptErr.message);
                // 🎯 Spacial Case: Session Expired
                if (decryptErr.message.includes("expired") || decryptErr.message.includes("not found")) {
                    return res.status(403).json({
                        success: false,
                        code: 'DECRYPTION_SESSION_EXPIRED',
                        msg: "Encryption session expired. Please retry."
                    });
                }
                throw decryptErr; 
            }
        }

        next();
    } catch (err) {
        console.error("❌ Decryption Middleware Error:", err.message);
        return res.status(400).json({ 
            success: false,
            msg: "Security Error: Decryption Failed", 
            message: err.message, // Adding 'message' for frontend compat
            error: err.message 
        });
    }
};

module.exports = decryptionMiddleware;
