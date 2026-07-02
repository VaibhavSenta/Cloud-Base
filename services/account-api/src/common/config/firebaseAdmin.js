const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

let firebaseAdminActive = false;

try {
  // Check if serviceAccountKey.json exists locally inside config directory
  const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || path.join(__dirname, 'serviceAccountKey.json');
  
  if (fs.existsSync(keyPath)) {
    const serviceAccount = require(keyPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    firebaseAdminActive = true;
    console.log('✅ Firebase Admin SDK initialized successfully.');
  } else {
    console.log('ℹ️  Firebase serviceAccountKey.json not found. Backend token verification will run in bypass mode for local dev.');
  }
} catch (error) {
  console.error('❌ Firebase Admin SDK initialization error:', error.message);
}

module.exports = {
  admin,
  firebaseAdminActive
};
