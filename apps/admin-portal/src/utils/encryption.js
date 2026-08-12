/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
/**
 * Encryption Utility for Web Crypto API
 * Handles RSA Key Import and AES Data Encryption
 */

export class EncryptionUtils {
    /**
     * Converts a PEM Public Key string to an ArrayBuffer
     */
    static pemToArrayBuffer(pem) {
        const b64Lines = pem.replace(/-----BEGIN PUBLIC KEY-----/, "")
                          .replace(/-----END PUBLIC KEY-----/, "")
                          .replace(/\s/g, "");
        const binaryDerString = window.atob(b64Lines);
        const binaryDer = new Uint8Array(binaryDerString.length);
        for (let i = 0; i < binaryDerString.length; i++) {
            binaryDer[i] = binaryDerString.charCodeAt(i);
        }
        return binaryDer.buffer;
    }

    /**
     * Robust Base64 conversion for binary data
     */
    static arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    /**
     * Imports a SPKI Public Key for RSA-OAEP
     */
    static async importPublicKey(pem) {
        const buffer = this.pemToArrayBuffer(pem);
        return await window.crypto.subtle.importKey(
            "spki",
            buffer,
            {
                name: "RSA-OAEP",
                hash: "SHA-256",
            },
            true,
            ["encrypt"]
        );
    }

    /**
     * Generates a random AES-256-CBC key (32 bytes)
     */
    static generateAESKey() {
        return window.crypto.getRandomValues(new Uint8Array(32));
    }

    /**
     * Encrypts the AES key using the RSA Public Key
     */
    static async encryptAESKey(publicKey, aesKey) {
        const encrypted = await window.crypto.subtle.encrypt(
            { name: "RSA-OAEP" },
            publicKey,
            aesKey
        );
        return this.arrayBufferToBase64(encrypted);
    }

    /**
     * Encrypts data using AES-256-CBC
     */
    static async encryptData(aesKey, data) {
        const iv = window.crypto.getRandomValues(new Uint8Array(16));
        const encoder = new TextEncoder();
        const encodedData = encoder.encode(JSON.stringify(data));

        const cryptoKey = await window.crypto.subtle.importKey(
            "raw",
            aesKey,
            { name: "AES-CBC" },
            false,
            ["encrypt"]
        );

        const encrypted = await window.crypto.subtle.encrypt(
            { name: "AES-CBC", iv },
            cryptoKey,
            encodedData
        );

        return {
            encryptedData: this.arrayBufferToBase64(encrypted),
            iv: this.arrayBufferToBase64(iv)
        };
    }

    /**
     * Hybrid Encryption Flow
     */
    static async hybridEncrypt(publicKeyPem, data) {
        try {
            const publicKey = await this.importPublicKey(publicKeyPem);
            const aesKey = this.generateAESKey();
            
            const encryptedKey = await this.encryptAESKey(publicKey, aesKey);
            const { encryptedData, iv } = await this.encryptData(aesKey, data);

            return {
                encryptedKey,
                encryptedData,
                iv
            };
        } catch (error) {
            console.error("Encryption failed:", error);
            throw error;
        }
    }
}
