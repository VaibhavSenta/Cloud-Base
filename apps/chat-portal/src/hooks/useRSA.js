/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
import JSEncrypt from 'jsencrypt';

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

    const hasWebCrypto = window.crypto && window.crypto.subtle;

    if (hasWebCrypto) {
      try {
        // Native Web Cryptography API Path (Fastest and highly secure)
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
        console.warn('⚠️ [RSA-Hook] Native key generation failed. Falling back to JSEncrypt:', error.message);
      }
    }

    // Fallback Path: Pure JavaScript RSA generation using JSEncrypt
    // This allows key exchange to work over insecure contexts (like custom HTTP .test domains or network IPs)
    try {
      console.log('🔑 [RSA-Hook] Context is insecure or lacks WebCrypto. Initializing JSEncrypt fallback...');
      const crypt = new JSEncrypt({ default_key_size: 2048 });
      
      const privateKeyPEM = crypt.getPrivateKey();
      const publicKeyPEM = crypt.getPublicKey();

      // Strip PEM headers/footers and whitespaces to match the raw Base64 export format of SubtleCrypto
      const cleanPEM = (pem) => {
        return pem
          .replace(/-----BEGIN [A-Z\s]+-----/g, '')
          .replace(/-----END [A-Z\s]+-----/g, '')
          .replace(/[\r\n\s]+/g, '');
      };

      return {
        publicKey: cleanPEM(publicKeyPEM),
        privateKey: cleanPEM(privateKeyPEM),
        rawPublicKey: null,
        rawPrivateKey: null
      };
    } catch (fallbackError) {
      console.warn('❌ [RSA-Hook] Cryptography fallback failed:', fallbackError);
      throw new Error('Asymmetric crypto handshake initialization failed: ' + fallbackError.message);
    }
  };

  return { generateKeyPair };
};
