const authService = require('./auth.service');
const encryptionService = require('../../common/utils/encryptionService');
const crypto = require('crypto');
const { USER } = require('./auth.model');
const sessionService = require('./session.service');

const handshake = async (req, res) => {
    try {
        const sessionId = crypto.randomBytes(16).toString('hex');
        const publicKey = encryptionService.generateKeyPair(sessionId);
        res.status(200).json({ success: true, publicKey, sessionId });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const signup = async (req, res) => {
  try {
    const deviceInfo = sessionService.parseDeviceInfo(req);
    const result = await authService.createAccount(req.body, deviceInfo);
    
    res.cookie('token', result.token, {
        httpOnly: true,
        secure: false, 
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000 
    });
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('❌ Signup Error:', error.message);
    res.status(400).json({ 
        success: false, 
        field: error.message.includes('exists') ? 'username' : 'general',
        message: error.message 
    });
  }
};

const login = async (req, res) => {
  try {
    const { identifier, password, otp, isPartial } = req.body;
    console.log('🔑 Attempting login for:', identifier);
    
    console.log("🔍 [DEBUG] Parsing device info...");
    const deviceInfo = sessionService.parseDeviceInfo(req);
    console.log("🔍 [DEBUG] Device info parsed:", deviceInfo);
    
    console.log("🔍 [DEBUG] Calling authService.loginAccount...");
    const result = await authService.loginAccount({ identifier, password, otp, isPartial }, deviceInfo);
    console.log("🔍 [DEBUG] loginAccount result received successfully");
    
    if (result.twoFactorRequired) {
      console.log('🔒 2FA challenge triggered for login:', identifier);
      return res.status(200).json({ success: true, twoFactorRequired: true, data: result });
    }
    
    res.cookie('token', result.token, {
        httpOnly: true,
        secure: false, 
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000 
    });
    

    console.log('✅ Login successful for:', identifier);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('❌ Login Error:', error.message);
    
    let status = 401;
    let field = 'general';
    
    if (error.message.includes('Account not found')) {
        field = 'identifier';
    } else if (error.message.includes('password')) {
        field = 'password';
        status = 403;
    } else if (error.message.includes('verification code')) {
        field = 'otp';
    }

    res.status(status).json({ 
        success: false, 
        field: field,
        message: error.message 
    });
  }
};

const logout = async (req, res) => {
  res.clearCookie('token', { path: '/' });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

const getMe = async (req, res) => {
    try {
        console.log("🔍 [DEBUG] getMe started. req.user:", req.user);
        const userId = req.user.userId;
        const currentSessionId = req.user.sessionId;

        console.log("🔍 [DEBUG] getMe: Querying USER.findById for userId:", userId);
        const user = await USER.findById(userId).select('-password');
        console.log("🔍 [DEBUG] getMe: USER.findById resolved. User found:", !!user);
        if (!user || user.accountStatus !== 'active') {
            res.clearCookie('token');
            throw new Error(user ? `Account is ${user.accountStatus}` : 'User not found in DB');
        }

        // Automatic Gravatar Sync if profilePic is default or missing
        if (!user.profilePic || user.profilePic === '/icons/person.svg') {
            const md5 = crypto.createHash('md5').update(user.email.toLowerCase().trim()).digest('hex');
            user.profilePic = `https://www.gravatar.com/avatar/${md5}?d=mp`;
            await user.save();
        }

        console.log("🔍 [DEBUG] getMe: Mapping sessions... Total sessions:", user.sessions.length);
        // Mark current session and sort (current first)
        const sessions = user.sessions.map(s => {
            console.log("🔍 [DEBUG] Mapping session:", s ? s.sessionId : null);
            return {
                ...s.toObject(),
                isCurrent: s.sessionId === currentSessionId
            };
        }).sort((a, b) => b.isCurrent - a.isCurrent);

        console.log("🔍 [DEBUG] getMe: Sessions mapped. Converting user toObject...");
        const userData = user.toObject();
        userData.sessions = sessions;

        console.log("🔍 [DEBUG] getMe: Sending response...");
        res.status(200).json({ success: true, data: userData });
    } catch (error) {
        console.error("❌ getMe Error caught in controller:", error);
        res.status(404).json({ success: false, message: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const updatedUser = await authService.updateProfile(userId, req.body);
        res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const terminateSession = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { sessionId } = req.params;

        const user = await USER.findById(userId);
        user.sessions = user.sessions.filter(s => s.sessionId !== sessionId);
        await user.save();

        res.status(200).json({ success: true, message: 'Session terminated' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const requestEmailVerification = async (req, res) => {
    try {
        const userId = req.user.userId;
        await authService.requestEmailVerification(userId);
        res.status(200).json({ success: true, message: 'Verification email sent successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const confirmEmailVerification = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) throw new Error('Verification token is required');
        const user = await authService.confirmEmailVerification(token);
        res.status(200).json({ success: true, message: 'Email verified successfully', data: { isEmailVerified: user.isEmailVerified } });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const requestEmailChange = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { newEmail } = req.body;
        await authService.requestEmailChange(userId, newEmail);
        res.status(200).json({ success: true, message: 'Verification link sent to new email address' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const setup2faAuthenticator = async (req, res) => {
    try {
        const userId = req.user.userId;
        const data = await authService.setupAuthenticator(userId);
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const verify2faAuthenticator = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { code } = req.body;
        if (!code) throw new Error('Verification code is required');
        await authService.verifyAuthenticator(userId, code);
        res.status(200).json({ success: true, message: 'Authenticator App verified and enabled successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const update2faSettings = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { twoFactorEnabled, twoFactorMethods, twoFactorPrimary } = req.body;
        const user = await authService.update2faSettings(userId, { twoFactorEnabled, twoFactorMethods, twoFactorPrimary });
        res.status(200).json({ success: true, message: '2FA settings updated successfully', data: user });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const verify2faLogin = async (req, res) => {
    try {
        const { ticket, code, method } = req.body;
        if (!ticket || !code || !method) throw new Error('Verification inputs are missing');
        const deviceInfo = sessionService.parseDeviceInfo(req);
        const result = await authService.verify2faLogin(ticket, code, method, deviceInfo);
        
        res.cookie('token', result.token, {
            httpOnly: true,
            secure: false, 
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const socialLogin = async (req, res) => {
  try {
    const { provider, token, clientData } = req.body;
    const deviceInfo = sessionService.parseDeviceInfo(req);
    const result = await authService.socialLoginAccount(provider, token, clientData, deviceInfo);

    res.cookie('token', result.token, {
        httpOnly: true,
        secure: false, 
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('❌ Social Login Error:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

const deactivateAccount = async (req, res) => {
  try {
    const { password } = req.body;
    await authService.deactivateAccount(req.user.userId, password);
    res.clearCookie('token');
    res.status(200).json({ success: true, message: 'Account deactivated successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const result = await authService.deleteAccount(req.user.userId, password);
    res.clearCookie('token');
    res.status(200).json({ 
      success: true, 
      message: 'Account scheduled for deletion in 3 days',
      deletionDate: result.deletionDate 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const reactivateAccount = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authService.reactivateAccount(email, password);

    // Issue new session & JWT token
    const deviceInfo = sessionService.parseDeviceInfo(req);
    const sessionId = crypto.randomBytes(16).toString('hex');
    user.sessions.push({ ...deviceInfo, sessionId, lastActive: new Date() });
    await user.save();

    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId: user._id, role: user.role, sessionId },
      process.env.JWT_SECRET || 'CB_SUPER_SECRET_KEY',
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
        httpOnly: true,
        secure: false, 
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    res.status(200).json({ 
      success: true, 
      data: {
        user: {
          id: user._id,
          username: user.userName,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          profilePic: user.profilePic
        },
        token
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const resend2faLogin = async (req, res) => {
  try {
    const { ticket, method } = req.body;
    const result = await authService.resend2faOtp(ticket, method);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { 
    handshake, 
    signup, 
    login, 
    socialLogin,
    logout, 
    getMe, 
    updateProfile, 
    terminateSession, 
    requestEmailVerification, 
    confirmEmailVerification, 
    requestEmailChange,
    setup2faAuthenticator,
    verify2faAuthenticator,
    update2faSettings,
    verify2faLogin,
    resend2faLogin,
    deactivateAccount,
    deleteAccount,
    reactivateAccount
};
