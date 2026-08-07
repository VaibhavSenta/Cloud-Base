'use client';

// Helper to convert ArrayBuffer to Base64 PEM-like string
const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

export const useRSA = () => {
  const generateKeyPair = async () => {
    if (typeof window === 'undefined') return;
    
    if (!window.crypto || !window.crypto.subtle) {
      throw new Error(
        'Web Cryptography is disabled by the browser. This happens when accessing over insecure HTTP (non-localhost). Please use localhost, HTTPS, or enable chrome://flags/#unsafely-treat-insecure-origin-as-secure.'
      );
    }

    try {
      // Generate RSA-OAEP Key Pair (2048-bit security targets)
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]), // 65537 EXP
          hash: 'SHA-256',
        },
        true, // extractable
        ['encrypt', 'decrypt']
      );

      // Export Public Key to SPKI Format
      const exportedPublic = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
      const publicKeyString = arrayBufferToBase64(exportedPublic);

      // Export Private Key to PKCS8 Format
      const exportedPrivate = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
      const privateKeyString = arrayBufferToBase64(exportedPrivate);

      return {
        publicKey: publicKeyString,
        privateKey: privateKeyString,
        rawPublicKey: keyPair.publicKey,
        rawPrivateKey: keyPair.privateKey
      };
    } catch (error) {
      console.warn('[RSA-Hook] Key Generation Failure:', error.message);
      throw new Error('Asymmetric crypto handshake initialization failed: ' + error.message);
    }
  };

  return { generateKeyPair };
};
