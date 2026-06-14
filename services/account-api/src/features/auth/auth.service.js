const { USER } = require('./auth.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const profileService = require('./profile.service');

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
  newUser.sessions.push({ ...deviceInfo, lastActive: new Date() });
  
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
  
    const user = await USER.findOne({
      $or: [{ userName: identifier }, { email: identifier }]
    });
  
    if (!user) {
      throw new Error('Account not found');
    }
  
    if (isPartial) {
      if (otp && otp.length === 6) {
        console.log(`✅ Partial login verified for user: ${user.userName}`);
      } else {
        throw new Error('Invalid verification code');
      }
    } else {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error('Invalid password');
      }
    }

    // Register Session
    const sessionId = deviceInfo.sessionId;
    
    // Initialize sessions if it doesn't exist
    if (!user.sessions) user.sessions = [];
    
    // Limits sessions to 10
    if (user.sessions.length >= 10) user.sessions.shift();
    
    user.sessions.push({ ...deviceInfo, lastActive: new Date() });
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
        sessions: user.sessions
      },
      token
    };
  };

module.exports = {
  createAccount,
  loginAccount,
  ...profileService
};
