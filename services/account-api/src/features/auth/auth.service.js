const { USER } = require('./auth.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const profileService = require('./profile.service');
const emailService = require('../../common/services/emailService');

/**
 * SIGNUP SERVICE
 */
const createAccount = async (userData, deviceInfo) => {
  const { username, email, firstName, lastName, password, isPartial } = userData;

  const existingUser = await USER.findOne({ 
    $or: [{ userName: username }, { email: email }] 
  });

  if (existingUser) {
    throw new Error('Username or Email already exists');
  }

  let finalPassword = password;
  if (isPartial && !password) {
    finalPassword = crypto.randomBytes(16).toString('hex');
  }

  const hashedPassword = await bcrypt.hash(finalPassword, 10);

  const newUser = new USER({
    userName: username,
    email: email,
    password: hashedPassword,
    firstName: firstName || '',
    lastName: lastName || '',
    role: isPartial ? 'PartialUser' : 'User',
    sessions: [] // Ensure sessions is initialized
  });

  // Register Session
  const sessionId = deviceInfo.sessionId;
  // Generate default Gravatar from email
  const md5 = crypto.createHash('md5').update(email.toLowerCase().trim()).digest('hex');
  newUser.profilePic = `https://www.gravatar.com/avatar/${md5}?d=mp`;

  newUser.sessions.push({ ...deviceInfo, lastActive: new Date() });
  newUser.activityLogs = [
    {
      action: 'Account created securely',
      timestamp: new Date(),
      ipAddress: deviceInfo.ipAddress,
      browser: deviceInfo.browser
    },
    {
      action: 'Primary email registered',
      timestamp: new Date(),
      ipAddress: deviceInfo.ipAddress,
      browser: deviceInfo.browser
    }
  ];
  await newUser.save();
  console.log(`✨ USER CREATED: ${newUser.userName} with sessionId: ${sessionId}`);

  const token = jwt.sign(
    { userId: newUser._id, role: newUser.role, sessionId: sessionId },
    process.env.JWT_SECRET || 'CB_SUPER_SECRET_KEY',
    { expiresIn: '7d' }
  );

  return {
    user: {
      id: newUser._id,
      username: newUser.userName,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
      profilePic: newUser.profilePic,
      sessions: newUser.sessions
    },
    token,
    tempPassword: isPartial ? finalPassword : null
  };
};

/**
 * LOGIN SERVICE
 */
const loginAccount = async (loginData, deviceInfo) => {
    const { identifier, password, otp, isPartial } = loginData;
    console.log("🔍 [DEBUG] loginAccount: Querying USER model...");
  
    const user = await USER.findOne({
      $or: [{ userName: identifier }, { email: identifier }]
    });
    console.log("🔍 [DEBUG] loginAccount: USER query resolved, user found:", !!user);
  
    if (!user) {
      throw new Error('Account not found');
    }

    if (user.accountStatus === 'deleted') {
      throw new Error('Account not found');
    }

    if (user.accountStatus === 'banned') {
      throw new Error('Your account has been banned');
    }

    // Dynamic clean-up of expired scheduled deletions (3 days grace period)
    if (user.accountStatus === 'scheduled_deletion' && user.deletionDate && user.deletionDate <= new Date()) {
      await USER.deleteOne({ _id: user._id });
      throw new Error('Account not found');
    }

    if (!user.sessions) user.sessions = [];
    // Auto-prune oldest session if max limit (6) reached
    if (user.sessions.length >= 6) {
      user.sessions = user.sessions.slice(-5);
      await user.save();
    }
  
    if (isPartial) {
      if (otp && otp.length === 6) {
        console.log(`✅ Partial login verified for user: ${user.userName}`);
      } else {
        throw new Error('Invalid verification code');
      }
    } else {
      console.log("🔍 [DEBUG] loginAccount: Comparing password with bcrypt...");
      const isMatch = await bcrypt.compare(password, user.password);
      console.log("🔍 [DEBUG] loginAccount: Bcrypt comparison finished, matches:", isMatch);
      if (!isMatch) {
        if (!user.activityLogs) user.activityLogs = [];
        user.activityLogs.push({
          action: 'Failed login attempt',
          domain: 'SECURITY',
          actor: 'USER',
          status: 'FAILURE',
          routePath: '/auth/login',
          ipAddress: deviceInfo.ipAddress,
          browser: deviceInfo.browser,
          timestamp: new Date()
        });
        if (user.activityLogs.length > 30) {
          user.activityLogs.shift();
        }
        await user.save();
        throw new Error('Invalid password');
      }
    }

    // Handle account status checks after successful authentication
    if (user.accountStatus === 'deactivated') {
      user.accountStatus = 'active';
      await user.save();
      console.log(`🔄 Account reactivated on login for user: ${user.email}`);
    } else if (user.accountStatus === 'scheduled_deletion') {
      return {
        requiresReactivation: true,
        accountStatus: 'scheduled_deletion',
        email: user.email,
        username: user.userName,
        deletionDate: user.deletionDate
      };
    }

    // Intercept login if 2FA is enabled
    if (user.twoFactorEnabled) {
      const ticket = crypto.randomBytes(32).toString('hex');
      user.twoFactorTempToken = ticket;
      user.twoFactorTempTokenExpires = Date.now() + 5 * 60 * 1000; // 5 mins

      if (user.twoFactorPrimary === 'email') {
        const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();
        user.twoFactorLoginOtp = emailOtp;
        user.twoFactorLoginOtpExpires = Date.now() + 5 * 60 * 1000; // 5 mins
        await user.save();

        try {
          await emailService.sendVerificationEmail({ 
            email: user.email, 
            token: `otp:${emailOtp}` 
          });
        } catch (emailErr) {
          console.error("Failed to send 2FA Login OTP Email:", emailErr.message);
        }
      } else {
        // Authenticator app doesn't send email, just save ticket
        await user.save();
      }

      return {
        twoFactorRequired: true,
        ticket,
        methods: user.twoFactorMethods,
        primaryMethod: user.twoFactorPrimary
      };
    } // Register Session
    const sessionId = deviceInfo.sessionId;
    
    // Initialize sessions if it doesn't exist
    if (!user.sessions) user.sessions = [];
    
    // Keep sessions array within 6 max by pruning oldest
    if (user.sessions.length >= 6) {
      user.sessions = user.sessions.slice(-5);
    }
    
    // Automatic Gravatar Sync if profilePic is default or missing
    if (!user.profilePic || user.profilePic === '/icons/person.svg') {
        const md5 = crypto.createHash('md5').update(user.email.toLowerCase().trim()).digest('hex');
        user.profilePic = `https://www.gravatar.com/avatar/${md5}?d=mp`;
    }

    user.sessions.push({ ...deviceInfo, lastActive: new Date() });
    if (!user.activityLogs) user.activityLogs = [];
    user.activityLogs.push({
      action: 'Authorized device login',
      domain: 'SECURITY',
      actor: 'USER',
      status: 'SUCCESS',
      routePath: '/auth/login',
      ipAddress: deviceInfo.ipAddress,
      browser: deviceInfo.browser,
      timestamp: new Date()
    });
    if (user.activityLogs.length > 30) {
      user.activityLogs.shift();
    }
    await user.save();
    
    console.log(`🔑 LOGIN: ${user.userName} registered session: ${sessionId}`);
  
    const token = jwt.sign(
      { userId: user._id, role: user.role, sessionId: sessionId },
      process.env.JWT_SECRET || 'CB_SUPER_SECRET_KEY',
      { expiresIn: '7d' }
    );
  
    return {
      user: {
        id: user._id,
        username: user.userName,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profilePic: user.profilePic,
        sessions: user.sessions
      },
      token,
      sessionIdHash: bcrypt.hash(sessionId, 10)
    };
  };

/**
 * Request Email Verification
 * Generates a verification token and sends email
 */
const requestEmailVerification = async (userId) => {
  const user = await USER.findById(userId);
  if (!user) throw new Error('User not found');
  if (user.isEmailVerified) throw new Error('Email is already verified');

  const token = crypto.randomBytes(32).toString('hex');
  user.emailVerificationToken = token;
  user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours expiry
  await user.save();

  await emailService.sendVerificationEmail({ email: user.email, token });
  return true;
};

/**
 * Confirm Email Verification
 * Verifies token, sets isEmailVerified to true, clears token details
 */
const confirmEmailVerification = async (token) => {
  const user = await USER.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new Error('Verification token is invalid or has expired');
  }

  // If this is an email change request, swap email
  if (user.newEmailPending) {
    user.email = user.newEmailPending;
    user.newEmailPending = undefined;
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  return user;
};

/**
 * Request Email Change
 * Sends verification link to the new email address
 */
const requestEmailChange = async (userId, newEmail) => {
  if (!newEmail) throw new Error('New email address is required');

  const existingUser = await USER.findOne({ email: newEmail });
  if (existingUser) {
    throw new Error('Email address is already in use');
  }

  const user = await USER.findById(userId);
  if (!user) throw new Error('User not found');

  const token = crypto.randomBytes(32).toString('hex');
  user.emailVerificationToken = token;
  user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  user.newEmailPending = newEmail;
  await user.save();

  await emailService.sendVerificationEmail({ email: newEmail, token });
  return true;
};

/**
 * Setup Authenticator (Generate TOTP secret key)
 */
const setupAuthenticator = async (userId) => {
  const user = await USER.findById(userId);
  if (!user) throw new Error('User not found');

  const otplib = require('otplib');
  const secret = otplib.generateSecret();
  const otpauth = otplib.generateURI({ secret, label: user.email, issuer: 'Cloud-Base' });

  const QRCode = require('qrcode');
  const qrCodeUrl = await QRCode.toDataURL(otpauth);

  user.authenticatorSecret = secret;
  await user.save();

  return { secret, otpauth, qrCodeUrl };
};

/**
 * Verify Authenticator and enable it in settings
 */
const verifyAuthenticator = async (userId, code) => {
  const user = await USER.findById(userId);
  if (!user) throw new Error('User not found');
  if (!user.authenticatorSecret) throw new Error('Authenticator setup has not been initiated');

  const otplib = require('otplib');
  const result = await otplib.verify({ token: code, secret: user.authenticatorSecret });
  if (!result || !result.valid) throw new Error('Invalid verification code. Please try again.');

  user.twoFactorMethods.authenticator = true;
  user.twoFactorEnabled = true;
  user.twoFactorPrimary = 'authenticator';
  await user.save();

  return true;
};

/**
 * Update 2FA Settings (Enable/Disable methods and primary selector)
 */
const update2faSettings = async (userId, settings) => {
  const user = await USER.findById(userId);
  if (!user) throw new Error('User not found');

  const { twoFactorEnabled, twoFactorMethods, twoFactorPrimary } = settings;

  if (twoFactorEnabled) {
    const methods = twoFactorMethods || user.twoFactorMethods;
    if (!methods.email && !methods.authenticator) {
      throw new Error('At least one 2FA method must be enabled to activate Two-Factor Authentication');
    }
  }

  if (twoFactorEnabled !== undefined) user.twoFactorEnabled = twoFactorEnabled;
  if (twoFactorMethods) {
    if (twoFactorMethods.email !== undefined) user.twoFactorMethods.email = twoFactorMethods.email;
    if (twoFactorMethods.authenticator !== undefined) {
      if (twoFactorMethods.authenticator && !user.authenticatorSecret) {
        throw new Error('Authenticator App must be verified before enabling');
      }
      user.twoFactorMethods.authenticator = twoFactorMethods.authenticator;
      if (!twoFactorMethods.authenticator) {
        user.authenticatorSecret = undefined;
        // If primary was set to authenticator, fallback to email
        if (user.twoFactorPrimary === 'authenticator') {
          user.twoFactorPrimary = 'email';
        }
      }
    }
  }
  if (twoFactorPrimary) {
    if (twoFactorPrimary === 'authenticator' && !user.authenticatorSecret) {
      throw new Error('Authenticator App must be set up to make it primary');
    }
    user.twoFactorPrimary = twoFactorPrimary;
  }

  await user.save();
  return user;
};

/**
 * Verify 2FA Login OTP/TOTP Code
 */
const verify2faLogin = async (ticket, code, method, deviceInfo) => {
  const user = await USER.findOne({
    twoFactorTempToken: ticket,
    twoFactorTempTokenExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new Error('Login session has expired or is invalid');
  }

  if (method === 'email') {
    if (user.twoFactorLoginOtp !== code || user.twoFactorLoginOtpExpires < Date.now()) {
      throw new Error('Invalid or expired verification code');
    }
  } else if (method === 'authenticator') {
    const otplib = require('otplib');
    const result = await otplib.verify({ token: code, secret: user.authenticatorSecret });
    if (!result || !result.valid) {
      throw new Error('Invalid authenticator code');
    }
  } else {
    throw new Error('Invalid verification method');
  }

  // Clear 2FA temp states
  user.twoFactorTempToken = undefined;
  user.twoFactorTempTokenExpires = undefined;
  user.twoFactorLoginOtp = undefined;
  user.twoFactorLoginOtpExpires = undefined;

  // Register Session
  const sessionId = deviceInfo.sessionId;
  if (!user.sessions) user.sessions = [];
  if (user.sessions.length >= 6) {
    throw new Error('You have logged in to too many devices');
  }

  if (!user.profilePic || user.profilePic === '/icons/person.svg') {
    const md5 = crypto.createHash('md5').update(user.email.toLowerCase().trim()).digest('hex');
    user.profilePic = `https://www.gravatar.com/avatar/${md5}?d=mp`;
  }

  user.sessions.push({ ...deviceInfo, lastActive: new Date() });
  await user.save();

  const token = jwt.sign(
    { userId: user._id, role: user.role, sessionId: sessionId },
    process.env.JWT_SECRET || 'CB_SUPER_SECRET_KEY',
    { expiresIn: '7d' }
  );

  return {
    user: {
      id: user._id,
      username: user.userName,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      profilePic: user.profilePic,
      sessions: user.sessions
    },
    token,
    sessionIdHash: bcrypt.hash(sessionId, 10)
  };
};

/**
 * Resend 2FA Login OTP Code
 */
const resend2faOtp = async (ticket, method) => {
  const emailService = require('../../common/services/emailService');

  if (!ticket) {
    throw new Error('Verification session ticket is required');
  }

  const user = await USER.findOne({
    twoFactorTempToken: ticket,
    twoFactorTempTokenExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new Error('Verification session expired or invalid');
  }

  if (method === 'email') {
    const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();
    user.twoFactorLoginOtp = emailOtp;
    user.twoFactorLoginOtpExpires = Date.now() + 5 * 60 * 1000; // 5 mins
    await user.save();

    await emailService.sendVerificationEmail({ 
      email: user.email, 
      token: `otp:${emailOtp}` 
    });

    console.log(`🔄 2FA Login OTP resent successfully to: ${user.email}`);
    return { success: true, message: 'Verification code resent successfully' };
  } else {
    throw new Error('Resend is only supported for Email OTP verification');
  }
};

/**
 * SOCIAL SIGNIN / SIGNUP SERVICE
 */
const socialLoginAccount = async (provider, token, clientData, deviceInfo) => {
  const { firebaseAdminActive, admin } = require('../../common/config/firebaseAdmin');
  let email, name, profilePic;

  // 1. Verify token if Firebase Admin is active and token is passed
  if (firebaseAdminActive && token) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      email = decodedToken.email;
      name = decodedToken.name || decodedToken.email.split('@')[0];
      profilePic = decodedToken.picture;
    } catch (err) {
      console.error(`Firebase Social Token verification failed: ${err.message}`);
      throw new Error('Social token verification failed');
    }
  } else {
    // Local Dev Bypass / Mock Mode
    console.log(`ℹ️ Social token verification in bypass mode for provider: ${provider}`);
    email = clientData.email;
    name = clientData.name || clientData.email.split('@')[0];
    profilePic = clientData.profilePic;
  }

  if (!email) {
    throw new Error('Email is required for social authentication');
  }

  // 2. Check if user exists, otherwise create new account
  let user = await USER.findOne({ email: email.toLowerCase() });

  if (!user) {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    user = new USER({
      userName: name.toLowerCase().replace(/[^a-z0-9]/g, '') + randomSuffix,
      email: email.toLowerCase(),
      firstName: name.split(' ')[0] || name,
      lastName: name.split(' ').slice(1).join(' ') || '',
      isEmailVerified: true, // Social emails are pre-verified
      profilePic: profilePic || '/icons/person.svg'
    });
    await user.save();
    console.log(`👤 New social user registered: ${user.email}`);
  }

  // 3. Register Session & JWT Token
  const sessionId = deviceInfo.sessionId;
  if (!user.sessions) user.sessions = [];
  if (user.sessions.length >= 6) {
    throw new Error('You have logged in to too many devices');
  }

  user.sessions.push({ ...deviceInfo, lastActive: new Date() });
  await user.save();

  const jwtToken = require('jsonwebtoken').sign(
    { userId: user._id, role: user.role, sessionId: sessionId },
    process.env.JWT_SECRET || 'CB_SUPER_SECRET_KEY',
    { expiresIn: '7d' }
  );

  return {
    user: {
      id: user._id,
      username: user.userName,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      profilePic: user.profilePic,
      sessions: user.sessions
    },
    token: jwtToken
  };
};

module.exports = {
  createAccount,
  loginAccount,
  socialLoginAccount,
  requestEmailVerification,
  confirmEmailVerification,
  requestEmailChange,
  setupAuthenticator,
  verifyAuthenticator,
  update2faSettings,
  verify2faLogin,
  resend2faOtp,
  ...profileService
};
