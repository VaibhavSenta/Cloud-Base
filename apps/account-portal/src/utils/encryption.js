import CryptoJS from 'crypto-js';
import JSEncrypt from 'jsencrypt';
import axios from 'axios';

/**
 * Frontend Encryption Utility
 * Handles Hybrid RSA + AES encryption for secure data transfer.
 */
class EncryptionService {
  constructor() {
    this.apiBase = '/api/v1'; // Uses Next.js Proxy
  }

  /**
   * 1. Handshake: Get Public Key and Session ID from Backend
   */
  async getHandshake() {
    try {
      const response = await axios.get(`${this.apiBase}/auth/handshake`);
      return response.data; // { publicKey, sessionId }
    } catch (error) {
      console.error('Handshake failed:', error);
      throw new Error('Could not establish secure connection');
    }
  }

  /**
   * 2. Encrypt Payload: Full Hybrid Logic
   */
  async encrypt(data) {
    // A. Perform Handshake
    const { publicKey, sessionId } = await this.getHandshake();

    // B. Generate random AES Key (16 bytes)
    const aesKey = CryptoJS.lib.WordArray.random(16).toString();

    // C. Encrypt Data with AES
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), aesKey).toString();

    // D. Encrypt AES Key with RSA (Public Key)
    const encryptor = new JSEncrypt();
    encryptor.setPublicKey(publicKey);
    const encryptedAesKey = encryptor.encrypt(aesKey);

    return {
      payload: encryptedData,   // Encrypted User Data
      key: encryptedAesKey,     // Encrypted AES Key
      sessionId: sessionId      // To identify the private key on backend
    };
  }
}

export default new EncryptionService();
