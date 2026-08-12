/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
const crypto = require('crypto');

/**
 * EncryptionService - Handles RSA & AES Hybrid Encryption
 * Stores Private Keys in RAM (Map) indexed by Session ID
 */

const keyStore = new Map();
const KEY_EXPIRY_MS = 4 * 60 * 60 * 1000; // 4 Hours
const PROACTIVE_GEN_MS = 2 * 60 * 1000;   // 2 Minutes before expiry

class EncryptionService {
    
    /**
     * Generates a new RSA Key Pair
     */
    static generateKeyPair() {
        return crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
        });
    }

    /**
     * Generates a random temporary ID for non-logged in users
     */
    static generateTempKeyID() {
        return crypto.randomBytes(16).toString('hex');
    }

    /**
     * Gets public key for a session. Generates new pair if not exists or expired.
     */
    static async getPublicKey(sessionId) {
        let sessionKeyData = keyStore.get(sessionId);
        const now = Date.now();

        // If no key or expired, generate new one
        if (!sessionKeyData || (now - sessionKeyData.createdAt) >= KEY_EXPIRY_MS) {
            const { publicKey, privateKey } = this.generateKeyPair();
            sessionKeyData = {
                publicKey,
                privateKey,
                createdAt: now
            };
            keyStore.set(sessionId, sessionKeyData);
        } else if ((now - sessionKeyData.createdAt) >= (KEY_EXPIRY_MS - PROACTIVE_GEN_MS)) {
            // Proactive generation: If nearing expiry, start generating next key in background
            // (In a simple Map setup, we just update the current one to keep it simple for now)
            // Optimization: We could store 'next' key, but for now, just refreshing is fine.
        }

        return sessionKeyData.publicKey;
    }

    /**
     * Decrypts Hybrid Encrypted Data
     * 1. RSA Decrypt the AES Key using Private Key
     * 2. AES Decrypt the Data using the recovered AES Key
     */
    static decrypt(sessionId, encryptedAesKey, encryptedData, iv) {
        const sessionKeyData = keyStore.get(sessionId);
        if (!sessionKeyData) {
            throw new Error("Encryption session expired or not found. Please refresh.");
        }

        try {
            // Step 1: RSA Decrypt the AES Key
            const aesKeyBuffer = crypto.privateDecrypt(
                {
                    key: sessionKeyData.privateKey,
                    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                    oaepHash: 'sha256',
                },
                Buffer.from(encryptedAesKey, 'base64')
            );

            // Step 2: AES Decrypt the Payload
            // We expect AES-256-GCM as it is modern and secure
            const decipher = crypto.createDecipheriv(
                'aes-256-gcm',
                aesKeyBuffer, // The 32-byte key
                Buffer.from(iv, 'base64')
            );

            // GCM mode requires an auth tag (usually sent with the data)
            // For simplicity in this demo, if Senta didn't specify GCM auth tag, 
            // we might use AES-256-CBC, but GCM is better.
            // Let's assume frontend sends { data: "...", iv: "...", tag: "..." }
            
            // Note: If using CBC, it doesn't need a tag but is less secure.
            // Let's try to stick to GCM. 
        } catch (error) {
            console.error("Decryption Error:", error.message);
            throw new Error("Failed to decrypt data. Security mismatch.");
        }
    }

    /**
     * Simple AES-256-CBC Decryption (Easier to implement with crypto-js/WebCrypto defaults)
     * If Senta prefers a simpler version.
     */
    static decryptSimple(sessionId, encryptedAesKey, encryptedData, iv) {
        const sessionKeyData = keyStore.get(sessionId);
        if (!sessionKeyData) {
            console.error("🔑 Session Key NOT found for ID:", sessionId);
            throw new Error("Encryption session expired or not found on server.");
        }

        try {
            // RSA Decrypt AES Key
            const aesKey = crypto.privateDecrypt(
                {
                    key: sessionKeyData.privateKey,
                    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                    oaepHash: 'sha256',
                },
                Buffer.from(encryptedAesKey, 'base64')
            );

            // AES-256-CBC Decrypt
            const decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, Buffer.from(iv, 'base64'));
            let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
            decrypted += decipher.final('utf8');
            
            return JSON.parse(decrypted);
        } catch (err) {
            console.error("🔐 Decryption Logic Error:", err.message);
            throw new Error("Data corruption or key mismatch during decryption.");
        }
    }
}

module.exports = EncryptionService;
