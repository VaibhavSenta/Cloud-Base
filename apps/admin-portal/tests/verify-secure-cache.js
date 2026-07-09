const CryptoJS = require('crypto-js');

// Simulate the exact encryption logic of secure-query-cache localCrypto.js
const localMemoryKey = CryptoJS.lib.WordArray.random(32).toString();

function localEncrypt(data) {
  if (data === null || data === undefined) return data;
  return CryptoJS.AES.encrypt(JSON.stringify(data), localMemoryKey).toString();
}

function localDecrypt(encryptedStr) {
  if (!encryptedStr || typeof encryptedStr !== 'string') return encryptedStr;
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedStr, localMemoryKey);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedText) return null;
    return JSON.parse(decryptedText);
  } catch (error) {
    return null;
  }
}

// Test data simulating sensitive admin session cache
const sampleData = {
  adminId: 'admin_123',
  email: 'admin@cloudbase.com',
  role: 'superadmin',
  permissions: ['manage_apps', 'view_logs']
};

console.log("--- Starting Secure Cache Verification Test ---");
console.log("Original Data:", sampleData);

const encrypted = localEncrypt(sampleData);
console.log("Encrypted Cache String:", encrypted);

if (encrypted === JSON.stringify(sampleData)) {
  console.error("❌ Test Failed: Cache data is stored in plaintext!");
  process.exit(1);
} else {
  console.log("✅ Test Passed: Cache data is successfully encrypted in memory.");
}

const decrypted = localDecrypt(encrypted);
console.log("Decrypted Data:", decrypted);

if (JSON.stringify(decrypted) === JSON.stringify(sampleData)) {
  console.log("✅ Test Passed: Decryption recovers original data successfully.");
} else {
  console.error("❌ Test Failed: Decrypted data does not match original!");
  process.exit(1);
}

console.log("--- Secure Cache Verification Complete ---");
