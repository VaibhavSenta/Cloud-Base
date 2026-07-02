require('dotenv').config();
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { USER } = require('./src/features/auth/auth.model');
const authService = require('./src/features/auth/auth.service');
const otplib = require('otplib');

async function test2FALogin() {
  console.log('📡 Connecting to MongoDB...');
  const connString = process.env.CONNECTION || "mongodb://localhost:27017/cloudbase";
  await mongoose.connect(connString);
  console.log('✅ MongoDB Connected.');

  try {
    // 1. Fetch or create a test user
    let user = await USER.findOne({ email: 'vaibhavsenta999@gmail.com' });
    if (!user) {
      console.log('ℹ️ Test user not found. Creating a temporary test user...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      user = await USER.create({
        userName: 'testvaibhav',
        email: 'vaibhavsenta999@gmail.com',
        password: hashedPassword,
        isEmailVerified: true
      });
    }

    // Update user password to a known password and reset 2FA properties for testing
    console.log('🔄 Setting up test user with Authenticator 2FA active...');
    const testSecret = otplib.generateSecret();
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    user.password = hashedPassword;
    user.twoFactorEnabled = true;
    user.twoFactorPrimary = 'authenticator';
    user.twoFactorMethods = { email: true, authenticator: true };
    user.authenticatorSecret = testSecret;
    await user.save();

    console.log('✅ User DB state configured successfully.');

    // 2. Simulate Login (Step 1)
    console.log('\n🔒 Step 1: Simulating login with password...');
    const loginResult = await authService.loginAccount(
      {
        identifier: 'vaibhavsenta999@gmail.com',
        password: 'password123',
        isPartial: false
      },
      {
        sessionId: 'test-session-id-12345',
        deviceName: 'Node Test Script',
        deviceType: 'Script',
        browser: 'Node.js',
        ipAddress: '127.0.0.1'
      }
    );

    console.log('✅ Login Response:', loginResult);

    if (!loginResult.twoFactorRequired) {
      throw new Error('❌ Test Failed: Login was not intercepted with twoFactorRequired: true');
    }
    if (!loginResult.ticket) {
      throw new Error('❌ Test Failed: Ticket was not returned in 2FA challenge response');
    }

    // 3. Simulate 2FA Verification (Step 2)
    console.log('\n🔑 Step 2: Generating TOTP code using otplib...');
    const totpCode = await otplib.generate({ secret: testSecret });
    console.log(`Generated TOTP Code: ${totpCode}`);

    console.log('🔄 Calling verify2faLogin to verify code and issue session token...');
    const verifyResult = await authService.verify2faLogin(
      loginResult.ticket,
      totpCode,
      'authenticator',
      {
        sessionId: 'test-session-id-12345',
        deviceName: 'Node Test Script',
        deviceType: 'Script',
        browser: 'Node.js',
        ipAddress: '127.0.0.1'
      }
    );

    console.log('✅ Verification Response:');
    console.log(`- Success! User logged in as: ${verifyResult.user?.email}`);
    console.log(`- Token returned starts with: ${verifyResult.token?.substring(0, 40)}...`);

    if (!verifyResult.token) {
      throw new Error('❌ Test Failed: Session JWT token was not returned');
    }

    console.log('\n🎉 ALL 2FA LOGIN CHALLENGE & VERIFICATION TESTS COMPLETED SUCCESSFULLY!');

  } catch (err) {
    console.error('\n❌ TEST FAILURE:', err.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connection closed.');
  }
}

test2FALogin();
