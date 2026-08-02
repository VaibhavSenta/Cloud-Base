import axios from 'axios';
import CryptoJS from 'crypto-js';
import { config } from '../config';

const handshakeUrl = `${config.accountApiUrl}/auth/handshake`;

// In-Memory Variables Cache for Session Handshake Keys
let cachedPublicKey = null;
let cachedSessionId = null;
let cachedAesKey = null;

/**
 * Fetch fresh handshake details from backend
 */
async function fetchHandshake() {
  try {
    const response = await axios.get(handshakeUrl);
    return response.data; // Expected: { publicKey, sessionId }
  } catch (error) {
    console.error('Handshake failed:', error);
    throw new Error('Could not establish secure session connection');
  }
}

/**
 * Get active session keys or initialize them if empty (e.g. on F5 reload)
 */
export async function getSecureConnection() {
  if (cachedPublicKey && cachedSessionId && cachedAesKey) {
    return {
      publicKey: cachedPublicKey,
      sessionId: cachedSessionId,
      aesKey: cachedAesKey
    };
  }

  const handshake = await fetchHandshake();
  cachedPublicKey = handshake.publicKey;
  cachedSessionId = handshake.sessionId;
  
  // Generate a random 16-byte AES key for this session
  cachedAesKey = CryptoJS.lib.WordArray.random(16).toString();

  return {
    publicKey: cachedPublicKey,
    sessionId: cachedSessionId,
    aesKey: cachedAesKey
  };
}
