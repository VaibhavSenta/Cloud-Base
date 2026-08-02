import CryptoJS from 'crypto-js';
import JSEncrypt from 'jsencrypt';

/**
 * Key Rotation Engine (Approach B — Device Entropy + 2-Minute Rotation)
 * 
 * Features:
 * 1. Generates 256-bit AES symmetric keys using browser device entropy
 *    (logical cores, performance time, RAM, SHA-256 mix).
 * 2. Manages Active_AES_Key and Pending_AES_Key buffers to ensure zero UI lag.
 * 3. Encrypts key envelopes using receiver's RSA public key.
 * 4. Decrypts received envelopes using user's private RSA key (from memory window.__cb_chat_private_key).
 * 5. Handles 2-minute rotation timers per active conversation.
 */

// In-memory key store (STRICTLY NO localStorage)
const conversationKeyStore = new Map();
// Structure: conversationId -> { activeKey, pendingKey, version, timerId }

/**
 * Collect device entropy to seed AES key generation
 */
export function generateDeviceEntropySeed() {
  const time = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;
  const memory = typeof navigator !== 'undefined' && navigator.deviceMemory ? navigator.deviceMemory : 8;
  const screenMetrics = typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}` : '1920x1080x24';
  const randomBytes = CryptoJS.lib.WordArray.random(32).toString();

  const rawEntropy = `${time}-${cores}-${memory}-${screenMetrics}-${randomBytes}-${Date.now()}`;
  return CryptoJS.SHA256(rawEntropy).toString();
}

/**
 * Generate a new 256-bit AES key string
 */
export function generateAESKey() {
  const seed = generateDeviceEntropySeed();
  return CryptoJS.SHA256(seed).toString(CryptoJS.enc.Hex);
}

/**
 * Encrypt AES key using Receiver's RSA Public Key (Envelope Packaging)
 */
export function encryptKeyEnvelope(aesKey, receiverPublicKey) {
  try {
    const encryptor = new JSEncrypt();
    encryptor.setPublicKey(receiverPublicKey);
    const encrypted = encryptor.encrypt(aesKey);
    if (!encrypted) throw new Error('RSA envelope encryption returned null');
    return encrypted;
  } catch (error) {
    console.error('❌ Failed to encrypt key envelope with RSA:', error);
    throw error;
  }
}

/**
 * Decrypt received Key Envelope using User's RSA Private Key
 */
export function decryptKeyEnvelope(encryptedEnvelope) {
  try {
    const privateKey = typeof window !== 'undefined' ? window.__cb_chat_private_key : null;
    if (!privateKey) {
      throw new Error('Private RSA key missing from session memory state.');
    }
    const decryptor = new JSEncrypt();
    decryptor.setPrivateKey(privateKey);
    const decryptedKey = decryptor.decrypt(encryptedEnvelope);
    if (!decryptedKey) throw new Error('RSA envelope decryption returned null');
    return decryptedKey;
  } catch (error) {
    console.error('❌ Failed to decrypt key envelope:', error);
    throw error;
  }
}

/**
 * Initialize or retrieve key state for a conversation
 */
export function getConversationKeys(conversationId) {
  if (!conversationKeyStore.has(conversationId)) {
    // Default initial key
    const initialKey = generateAESKey();
    conversationKeyStore.set(conversationId, {
      activeKey: initialKey,
      pendingKey: null,
      version: 1,
      timerId: null
    });
  }
  return conversationKeyStore.get(conversationId);
}

/**
 * Start 2-minute rotation timer for a conversation
 */
export function startKeyRotationTimer(conversationId, receiverPublicKey, onRotateEmit) {
  const keyState = getConversationKeys(conversationId);

  // Clear existing timer if any
  if (keyState.timerId) {
    clearInterval(keyState.timerId);
  }

  // 2 Minutes = 120,000 ms
  const ROTATION_INTERVAL_MS = 2 * 60 * 1000;

  keyState.timerId = setInterval(() => {
    try {
      console.log(`🔄 [KeyRotation] Rotating AES Key for conversation ${conversationId}`);
      const newAESKey = generateAESKey();
      const newVersion = keyState.version + 1;

      // Set new key in pending buffer
      keyState.pendingKey = newAESKey;

      // Encrypt envelope for receiver
      if (receiverPublicKey) {
        const encryptedEnvelope = encryptKeyEnvelope(newAESKey, receiverPublicKey);

        // Notify socket listener to emit rotation event
        if (onRotateEmit) {
          onRotateEmit({
            conversationId,
            encryptedKeyEnvelope: encryptedEnvelope,
            keyVersion: newVersion
          });
        }
      }

      // Swap pending key to active key after short buffer window (100ms)
      setTimeout(() => {
        keyState.activeKey = newAESKey;
        keyState.pendingKey = null;
        keyState.version = newVersion;
        console.log(`✅ [KeyRotation] Swapped to new Key Version ${newVersion} for conversation ${conversationId}`);
      }, 100);

    } catch (err) {
      console.error('❌ Error during 2-minute key rotation execution:', err);
    }
  }, ROTATION_INTERVAL_MS);
}

/**
 * Handle incoming key rotation from chat partner
 */
export function applyIncomingKeyRotation(conversationId, encryptedKeyEnvelope, keyVersion) {
  try {
    const newAESKey = decryptKeyEnvelope(encryptedKeyEnvelope);
    const keyState = getConversationKeys(conversationId);

    keyState.pendingKey = newAESKey;

    setTimeout(() => {
      keyState.activeKey = newAESKey;
      keyState.pendingKey = null;
      keyState.version = keyVersion;
      console.log(`✅ [KeyRotation] Applied incoming Key Version ${keyVersion} for conversation ${conversationId}`);
    }, 100);

    return true;
  } catch (err) {
    console.error('❌ Failed to apply incoming key rotation:', err);
    return false;
  }
}

/**
 * Encrypt message payload using conversation's current active AES key
 */
export function encryptMessagePayload(plaintext, conversationId) {
  const keyState = getConversationKeys(conversationId);
  const aesKey = keyState.activeKey;
  return CryptoJS.AES.encrypt(plaintext, aesKey).toString();
}

/**
 * Decrypt message payload using active or pending key buffer
 */
export function decryptMessagePayload(ciphertext, conversationId) {
  const keyState = getConversationKeys(conversationId);

  // Try active key first
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, keyState.activeKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (decrypted) return decrypted;
  } catch (e) {
    // Fallback to pending key if active key fails
  }

  if (keyState.pendingKey) {
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, keyState.pendingKey);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      if (decrypted) return decrypted;
    } catch (e) {
      // Failed both
    }
  }

  return '[Decryption Error: Key mismatch]';
}

/**
 * Clean up key rotation timer on unmount / chat switch
 */
export function stopKeyRotationTimer(conversationId) {
  if (conversationKeyStore.has(conversationId)) {
    const keyState = conversationKeyStore.get(conversationId);
    if (keyState.timerId) {
      clearInterval(keyState.timerId);
      keyState.timerId = null;
    }
  }
}
