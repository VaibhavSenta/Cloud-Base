const encryptionService = require('../utils/encryptionService');

/**
 * Middleware to strictly decrypt payloads for sensitive auth routes.
 */
const decryptRequest = async (req, res, next) => {
  const { payload, key, sessionId } = req.body;

  // Log incoming packet for deep debugging
  console.log(`📦 Incoming Encrypted Packet from: ${req.ip}`);

  if (!payload || !key || !sessionId) {
    console.error('❌ Decryption Failed: Missing required fields (payload/key/sessionId)');
    return res.status(400).json({ 
        success: false, 
        message: 'Security Violation: Incomplete secure payload' 
    });
  }

  try {
    // 1. Decrypt AES Key using RSA Private Key
    const aesKey = encryptionService.decryptWithRSA(sessionId, key);

    // 2. Decrypt User Data using AES Key
    const decryptedData = encryptionService.decryptPayload(payload, aesKey);

    // 3. Replace req.body with original clean data
    req.body = decryptedData;
    
    console.log(`🔓 Request Decrypted Successfully for: ${decryptedData.identifier || decryptedData.username || 'new_user'}`);
    next();
  } catch (error) {
    console.error('❌ Decryption Middleware Critical Error:', error.message);
    res.status(401).json({ 
      success: false, 
      message: 'Secure Handshake Failure: Data mangled or session expired' 
    });
  }
};

module.exports = decryptRequest;
