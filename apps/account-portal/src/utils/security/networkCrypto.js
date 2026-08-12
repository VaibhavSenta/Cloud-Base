/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
import CryptoJS from 'crypto-js';
import JSEncrypt from 'jsencrypt';
import { getSecureConnection } from './sessionKeys';

/**
 * Encrypt network request payload using RSA + AES hybrid encryption
 */
export async function encryptPayload(data) {
  const { publicKey, sessionId, aesKey } = await getSecureConnection();

  // A. Encrypt Data with AES (Fast symmetric encryption)
  const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), aesKey).toString();

  // B. Encrypt AES Key with RSA (Secure asymmetric key transfer)
  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(publicKey);
  const encryptedAesKey = encryptor.encrypt(aesKey);

  // Return formatted payload structure expected by backend decrypt middleware
  return {
    payload: encryptedData,   // Encrypted payload string
    key: encryptedAesKey,     // Encrypted AES Key
    sessionId: sessionId      // Session identifier for private key lookup
  };
}
