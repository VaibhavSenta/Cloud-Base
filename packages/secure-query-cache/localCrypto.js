/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
import CryptoJS from 'crypto-js';

// Generate a random local key in memory (RAM) for this session
const localMemoryKey = CryptoJS.lib.WordArray.random(32).toString();

/**
 * Encrypt data for React Query cache storage
 */
export function localEncrypt(data) {
  if (data === null || data === undefined) return data;
  return CryptoJS.AES.encrypt(JSON.stringify(data), localMemoryKey).toString();
}

/**
 * Decrypt data retrieved from React Query cache
 */
export function localDecrypt(encryptedStr) {
  if (!encryptedStr || typeof encryptedStr !== 'string') return encryptedStr;
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedStr, localMemoryKey);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedText) return null;
    return JSON.parse(decryptedText);
  } catch (error) {
    console.error('Local decryption failed:', error);
    return null;
  }
}
