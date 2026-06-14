const forge = require('node-forge');
const CryptoJS = require('crypto-js');

/**
 * Utility to manage temporary RSA keys for Hybrid Encryption.
 */
class EncryptionService {
  constructor() {
    this.keys = new Map();
  }

  generateKeyPair(sessionId) {
    const { privateKey, publicKey } = forge.pki.rsa.generateKeyPair(1024);
    const publicKeyPem = forge.pki.publicKeyToPem(publicKey);
    this.keys.set(sessionId, privateKey);
    setTimeout(() => this.keys.delete(sessionId), 10 * 60 * 1000);
    return publicKeyPem;
  }

  decryptWithRSA(sessionId, encryptedAesKey) {
    const privateKey = this.keys.get(sessionId);
    if (!privateKey) throw new Error('Session expired or Invalid handshake');

    try {
        const encryptedBytes = forge.util.decode64(encryptedAesKey);
        // Ensure we handle the binary data correctly for forge
        const decryptedAesKey = privateKey.decrypt(encryptedBytes, 'RSAES-PKCS1-V1_5'); 
        return decryptedAesKey.toString(); // Ensure it returns string
    } catch (err) {
        console.error('RSA Decryption Error:', err);
        throw new Error('RSA Decryption failed');
    }
  }

  decryptPayload(encryptedPayload, aesKey) {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedPayload, aesKey);
        const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        return decryptedData;
    } catch (err) {
        throw new Error('AES Decryption failed');
    }
  }
}

module.exports = new EncryptionService();
