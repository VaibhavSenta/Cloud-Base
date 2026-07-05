require('dotenv').config();
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { USER } = require('./src/features/auth/auth.model');
const authService = require('./src/features/auth/auth.service');
const otplib = require('otplib');

const TEST_EMAIL = 'testflowuser@gmail.com';
const TEST_USERNAME = 'testflowuser';
const TEST_PASSWORD = 'password123';

async function testFullAuthFlow() {
  console.log('📡 Connecting to MongoDB...');
  const connString = process.env.CONNECTION || "mongodb://localhost:27017/cloudbase";
  await mongoose.connect(connString);
  console.log('✅ MongoDB Connected.');

  const deviceInfo = {
    sessionId: 'test-session-id-full-flow',
    deviceName: 'Automated Full Flow Test Script',
    deviceType: 'Script',
    browser: 'Node.js',
    ipAddress: '127.0.0.1'
  };

  try {
    // 0. Clean up any existing test user from previous runs
    console.log(`\n🧹 Cleaning up any old test user (${TEST_EMAIL})...`);
    await USER.deleteOne({ email: TEST_EMAIL });

    // 1. SIGNUP TEST
    console.log('\n➕ 1. Testing User Signup...');
    const signupData = {
      username: TEST_USERNAME,
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      firstName: 'Test',
      lastName: 'Flow'
    };

    const signupResult = await authService.createAccount(signupData, deviceInfo);
    console.log('✅ Signup Successful. Registered user email:', signupResult.user?.email);

    // 2. NORMAL LOGIN TEST
    console.log('\n🔑 2. Testing Normal Login...');
    const loginResult = await authService.loginAccount(
      {
        identifier: TEST_EMAIL,
        password: TEST_PASSWORD,
        isPartial: false
      },
      deviceInfo
    );
    console.log('✅ Login Successful. Token returned starts with:', loginResult.token?.substring(0, 30) + '...');

    // 3. DEACTIVATION & AUTO-REACTIVATION TEST
    console.log('\n📴 3. Testing Deactivation & Auto-Reactivation on Login...');
    // We deactivate the user using our profile service helper
    console.log('🔄 Calling deactivateAccount...');
    await authService.deactivateAccount(signupResult.user.id, TEST_PASSWORD);
    
    // Assert status is changed to deactivated
    let user = await USER.findOne({ email: TEST_EMAIL });
    console.log(`Status in DB: "${user.accountStatus}" (Expected: "deactivated")`);
    if (user.accountStatus !== 'deactivated') {
      throw new Error('❌ Test Failed: User status was not set to deactivated');
    }

    // Try logging in to assert automatic reactivation
    console.log('🔄 Attempting login with password to reactivate...');
    const reactivateLoginResult = await authService.loginAccount(
      {
        identifier: TEST_EMAIL,
        password: TEST_PASSWORD,
        isPartial: false
      },
      deviceInfo
    );
    console.log('✅ Reactivation login result:', reactivateLoginResult.user ? 'User authenticated successfully' : 'Failed');
    
    user = await USER.findOne({ email: TEST_EMAIL });
    console.log(`Status in DB: "${user.accountStatus}" (Expected: "active")`);
    if (user.accountStatus !== 'active') {
      throw new Error('❌ Test Failed: User was not reactivated back to "active" status');
    }

    // 4. SCHEDULED DELETION & LOGIN INTERCEPTION (GRACE PERIOD) TEST
    console.log('\n⏳ 4. Testing Scheduled Deletion & Login Interception...');
    console.log('🔄 Calling deleteAccount (initiates deletion)...');
    const deleteResult = await authService.deleteAccount(signupResult.user.id, TEST_PASSWORD);
    console.log('Deletion Date returned:', deleteResult.deletionDate);

    user = await USER.findOne({ email: TEST_EMAIL });
    console.log(`Status in DB: "${user.accountStatus}" (Expected: "scheduled_deletion")`);
    if (user.accountStatus !== 'scheduled_deletion') {
      throw new Error('❌ Test Failed: User status was not set to scheduled_deletion');
    }

    // Attempt login to assert interception
    console.log('🔄 Attempting login while account is scheduled for deletion...');
    const deletionLoginResult = await authService.loginAccount(
      {
        identifier: TEST_EMAIL,
        password: TEST_PASSWORD,
        isPartial: false
      },
      deviceInfo
    );
    console.log('✅ Intercepted Login Result:', deletionLoginResult);
    if (!deletionLoginResult.requiresReactivation) {
      throw new Error('❌ Test Failed: Login was not intercepted with requiresReactivation: true');
    }

    // Cancel deletion using the reactivation service helper
    console.log('🔄 Calling reactivateAccount to cancel scheduled deletion...');
    await authService.reactivateAccount(TEST_EMAIL, TEST_PASSWORD);
    user = await USER.findOne({ email: TEST_EMAIL });
    console.log(`Status in DB: "${user.accountStatus}" (Expected: "active")`);
    if (user.accountStatus !== 'active') {
      throw new Error('❌ Test Failed: User was not reactivated back to "active" status after canceling deletion');
    }

    // 5. EXPIRED GRACE PERIOD DELETION CLEANUP TEST
    console.log('\n💀 5. Testing Expired Grace Period Deletion Cleanup...');
    console.log('🔄 Modifying user deletionDate to the past (simulating expired grace period)...');
    user.accountStatus = 'scheduled_deletion';
    user.deletionDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 5); // 5 days in the past
    await user.save();

    console.log('🔄 Attempting login with password to trigger dynamic clean-up...');
    try {
      await authService.loginAccount(
        {
          identifier: TEST_EMAIL,
          password: TEST_PASSWORD,
          isPartial: false
        },
        deviceInfo
      );
      throw new Error('❌ Test Failed: Login succeeded but user should have been deleted');
    } catch (err) {
      console.log('Expected error thrown during login:', err.message);
      if (!err.message.includes('Account not found')) {
        throw new Error(`❌ Test Failed: Unexpected error: ${err.message}`);
      }
    }

    // Assert user has been deleted from MongoDB
    const deletedUserCheck = await USER.findOne({ email: TEST_EMAIL });
    console.log('User exists in DB:', !!deletedUserCheck, '(Expected: false)');
    if (deletedUserCheck) {
      throw new Error('❌ Test Failed: User record was not deleted from database');
    }

    // 6. 2FA SETUP & LOGINS TEST
    console.log('\n🛡️ 6. Testing 2FA Setup, Setup Verification, and 2FA Logins...');
    // Re-create user for 2FA tests
    console.log('🔄 Re-creating test user...');
    const userFor2fa = await USER.create({
      userName: TEST_USERNAME,
      email: TEST_EMAIL,
      password: await bcrypt.hash(TEST_PASSWORD, 10),
      isEmailVerified: true
    });

    console.log('🔄 Setting up Authenticator App (2FA Setup)...');
    // Simulate setup call
    const testSecret = otplib.generateSecret();
    userFor2fa.twoFactorEnabled = true;
    userFor2fa.twoFactorPrimary = 'authenticator';
    userFor2fa.twoFactorMethods = { email: true, authenticator: true };
    userFor2fa.authenticatorSecret = testSecret;
    await userFor2fa.save();
    console.log('✅ Authenticator configuration saved.');

    console.log('🔄 Simulating login with password (should challenge for 2FA)...');
    const challengeResult = await authService.loginAccount(
      {
        identifier: TEST_EMAIL,
        password: TEST_PASSWORD,
        isPartial: false
      },
      deviceInfo
    );
    console.log('Challenge Response (Expected twoFactorRequired: true):', challengeResult);
    if (!challengeResult.twoFactorRequired) {
      throw new Error('❌ Test Failed: Login was not challenged with 2FA requirement');
    }

    console.log('🔄 Verifying TOTP code...');
    const totpCode = await otplib.generate({ secret: testSecret });
    const verifyResult = await authService.verify2faLogin(
      challengeResult.ticket,
      totpCode,
      'authenticator',
      deviceInfo
    );
    console.log('✅ 2FA verification response. Logged in as:', verifyResult.user?.email);
    if (!verifyResult.token) {
      throw new Error('❌ Test Failed: Session JWT token was not returned after 2FA verification');
    }

    // 7. CLEAN UP
    console.log('\n🧹 7. Final Clean-up...');
    await USER.deleteOne({ email: TEST_EMAIL });
    console.log('✅ Clean-up done.');

    console.log('\n🎉 ALL SECURITY, DEACTIVATION, DELETION, AND 2FA FLOW TESTS PASSED SUCCESSFULLY!');

  } catch (err) {
    console.error('\n❌ TEST RUN FAILURE:', err.message);
    console.error(err.stack);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed.');
  }
}

testFullAuthFlow();
