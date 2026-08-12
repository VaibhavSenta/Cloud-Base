/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
require('dotenv').config();
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const mongoose = require('mongoose');
const connectDB = require('./src/common/config/db');
const { USER } = require('./src/features/auth/auth.model');
const { setupAuthenticator, verifyAuthenticator } = require('./src/features/auth/auth.service');
const otplib = require('otplib');

async function runTests() {
  console.log('📡 Initializing Mongoose Connection...');
  await connectDB();

  try {
    // 1. Fetch first user
    const user = await USER.findOne();
    if (!user) {
      console.error('❌ No user found in the database. Please register a user first.');
      process.exit(1);
    }

    console.log(`👤 Testing 2FA for user: ${user.email} (ID: ${user._id})`);
    console.log(`User original 2FA state:`, {
      twoFactorEnabled: user.twoFactorEnabled,
      twoFactorPrimary: user.twoFactorPrimary,
      'twoFactorMethods.email': user.twoFactorMethods?.email,
      'twoFactorMethods.authenticator': user.twoFactorMethods?.authenticator,
      hasSecret: !!user.authenticatorSecret
    });

    // 2. Run Setup Authenticator
    console.log('\n🔄 Generating Authenticator App setup configuration...');
    const setupResult = await setupAuthenticator(user._id);
    
    console.log('✅ Setup Result generated successfully:');
    console.log(`- Secret: ${setupResult.secret}`);
    console.log(`- Key URI: ${setupResult.otpauth}`);
    console.log(`- QR Code URL starts with: ${setupResult.qrCodeUrl?.substring(0, 30)}...`);

    if (!setupResult.secret || !setupResult.qrCodeUrl || !setupResult.qrCodeUrl.startsWith('data:image/png;base64,')) {
      throw new Error('❌ Test Failed: Invalid secret or QR Code Data URL returned');
    }

    // 3. Generate correct current TOTP code using otplib
    const currentCode = await otplib.generate({ secret: setupResult.secret });
    console.log(`\n🔑 Current generated TOTP code: ${currentCode}`);

    // 4. Verify Authenticator
    console.log('🔄 Verifying generated TOTP code on backend...');
    const verifyResult = await verifyAuthenticator(user._id, currentCode);
    console.log(`✅ Verification Result: ${verifyResult ? 'SUCCESS' : 'FAILED'}`);

    // 5. Query user again and check updated state
    const updatedUser = await USER.findById(user._id);
    console.log(`\nUpdated User 2FA state:`, {
      twoFactorEnabled: updatedUser.twoFactorEnabled,
      twoFactorPrimary: updatedUser.twoFactorPrimary,
      'twoFactorMethods.email': updatedUser.twoFactorMethods?.email,
      'twoFactorMethods.authenticator': updatedUser.twoFactorMethods?.authenticator
    });

    if (updatedUser.twoFactorEnabled !== true || updatedUser.twoFactorMethods.authenticator !== true) {
      throw new Error('❌ Test Failed: User document 2FA state was not updated correctly after verification');
    }

    console.log('\n🎉 ALL 2FA SETUP & VERIFICATION TESTS COMPLETED SUCCESSFULLY!');
  } catch (err) {
    console.error(`\n❌ TEST FAILURE:`, err.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connection closed.');
  }
}

runTests();
