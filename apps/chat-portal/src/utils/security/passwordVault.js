/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
import CryptoJS from 'crypto-js';

/**
 * Derives a 256-bit AES master key from the user's passphrase/PIN and a salt.
 * Enforces 1000 PBKDF2 iterations.
 */
export function deriveMasterKey(passphrase, salt) {
  if (!passphrase || !salt) {
    throw new Error('Passphrase and salt are required to derive key.');
  }
  return CryptoJS.PBKDF2(passphrase, salt, {
    keySize: 256 / 32,
    iterations: 1000
  }).toString();
}

/**
 * Encrypts a raw private key string using a derived Master Key.
 */
export function encryptPrivateKey(rawPrivateKey, masterKey) {
  if (!rawPrivateKey || !masterKey) {
    throw new Error('Raw private key and master key are required.');
  }
  return CryptoJS.AES.encrypt(rawPrivateKey, masterKey).toString();
}

/**
 * Decrypts an encrypted private key string using a derived Master Key.
 */
export function decryptPrivateKey(encryptedPrivateKey, masterKey) {
  if (!encryptedPrivateKey || !masterKey) {
    throw new Error('Encrypted private key and master key are required.');
  }
  const bytes = CryptoJS.AES.decrypt(encryptedPrivateKey, masterKey);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  if (!decrypted) {
    throw new Error('Decryption failed: Invalid Master Key or corrupted payload.');
  }
  return decrypted;
}
