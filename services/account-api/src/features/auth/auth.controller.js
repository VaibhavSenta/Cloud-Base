const authService = require('./auth.service');
const encryptionService = require('../../common/utils/encryptionService');
const crypto = require('crypto');
const { USER } = require('./auth.model');
const sessionService = require('./session.service');
const { cookieConfig } = require('../../common/config/env.config');
const { maxAge, ...clearOptions } = cookieConfig;

const propagateLogout = async (userId, sessionId) => {
  if (!userId) return;
  try {
    const axios = require('axios');
    await axios.post('http://172.20.10.2:5006/api/v1/chat/auth/logout-session', {
      userId,
      sessionId
    });
  } catch (err) {
    console.error('Failed to propagate logout to chat-api:', err.message);
  }
};

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
        domain: 'localhost',
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
    
    res.cookie('token', result.token, cookieConfig);
    res.cookie('cb_chat_token', result.token, cookieConfig);
    

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
  try {
    let token = req.cookies?.token || req.cookies?.cb_chat_token;
    if (token) {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'CB_SUPER_SECRET_KEY_FOR_LOCAL_DEV', { ignoreExpiration: true });
      const userId = decoded.userId || decoded.id;
      const sessionId = decoded.sessionId;
      if (userId) {
        propagateLogout(userId, sessionId);
      }
    }
  } catch (err) {
    console.error('Error during logout propagation:', err.message);
  }

  res.clearCookie('token', clearOptions);
  res.clearCookie('cb_chat_token', clearOptions);
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
            res.clearCookie('token', clearOptions);
            res.clearCookie('cb_chat_token', clearOptions);
            throw new Error(user ? `Account is ${user.accountStatus}` : 'User not found in DB');
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
        
        const user = await USER.findById(userId);
        if (user) {
            const { logSecurityEvent } = require('./audit.service');
            if (req.body.userName) {
                await logSecurityEvent(user, 'Username updated', req, { domain: 'IDENTITY' });
            }
            if (req.body.phonenumber) {
                await logSecurityEvent(user, 'Phone number verified', req, { domain: 'IDENTITY' });
            }
            if (req.body.recoveryEmail) {
                await logSecurityEvent(user, 'Recovery email updated', req, { domain: 'IDENTITY' });
            }
            if (req.body.profilePic) {
                await logSecurityEvent(user, 'Profile picture updated', req, { domain: 'IDENTITY' });
            }
        }

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
        const { logSecurityEvent } = require('./audit.service');
        await logSecurityEvent(user, 'Authorized device session terminated', req);

        // Propagate session termination to chat-api
        propagateLogout(userId, sessionId);

        res.status(200).json({ success: true, message: 'Session terminated' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const terminateAllOtherSessions = async (req, res) => {
    try {
        const userId = req.user.userId;
        const currentSessionId = req.user.sessionId;

        const user = await USER.findById(userId);
        if (user) {
            // Collect other session IDs to propagate logout
            const otherSessionIds = user.sessions
                .map(s => s.sessionId)
                .filter(sid => sid !== currentSessionId);

            user.sessions = user.sessions.filter(s => s.sessionId === currentSessionId);
            const { logSecurityEvent } = require('./audit.service');
            await logSecurityEvent(user, 'All other sessions terminated', req);

            // Propagate logout to chat-api for all other sessions
            for (const sid of otherSessionIds) {
                propagateLogout(userId, sid);
            }
        }

        res.status(200).json({ success: true, message: 'All other sessions terminated' });
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
        const { logSecurityEvent } = require('./audit.service');
        await logSecurityEvent(user, 'Primary email verified', req, { domain: 'IDENTITY' });
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
        const { logSecurityEvent } = require('./audit.service');
        const user = await USER.findById(userId);
        if (user) {
            await logSecurityEvent(user, 'Authenticator App connected', req);
        }
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
        const { logSecurityEvent } = require('./audit.service');
        const dbUser = await USER.findById(userId);
        if (dbUser) {
            const actionText = twoFactorEnabled ? 'Two-Factor Authentication enabled' : 'Two-Factor Authentication disabled';
            await logSecurityEvent(dbUser, actionText, req);
        }
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
        
        res.cookie('token', result.token, cookieConfig);
        res.cookie('cb_chat_token', result.token, cookieConfig);

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

    res.cookie('token', result.token, cookieConfig);
    res.cookie('cb_chat_token', result.token, cookieConfig);

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
    res.clearCookie('token', clearOptions);
    res.clearCookie('cb_chat_token', clearOptions);
    propagateLogout(req.user.userId, req.user.sessionId);
    res.status(200).json({ success: true, message: 'Account deactivated successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const result = await authService.deleteAccount(req.user.userId, password);
    res.clearCookie('token', clearOptions);
    res.clearCookie('cb_chat_token', clearOptions);
    propagateLogout(req.user.userId, req.user.sessionId);
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
    
    if (user.sessions && user.sessions.length >= 6) {
      return res.status(400).json({ success: false, message: 'Maximum login limit reached. You can log in to a maximum of 6 devices. Please log out from another device.' });
    }

    user.sessions.push({ ...deviceInfo, sessionId, lastActive: new Date() });
    await user.save();

    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId: user._id, role: user.role, sessionId },
      process.env.JWT_SECRET || 'CB_SUPER_SECRET_KEY',
      { expiresIn: '7d' }
    );

    res.cookie('token', token, cookieConfig);
    res.cookie('cb_chat_token', token, cookieConfig);

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

const connectService = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { serviceId } = req.body;
        
        if (!['vault', 'chat', 'social'].includes(serviceId)) {
            throw new Error('Invalid service ID');
        }

        const user = await USER.findById(userId);
        
        const isConnected = user.connectedServices.some(s => s.serviceId === serviceId);
        if (!isConnected) {
            user.connectedServices.push({ serviceId });
            await user.save();
        }

        res.status(200).json({ success: true, message: `${serviceId} connected successfully`, data: user.connectedServices });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const disconnectService = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { serviceId } = req.body;

        const user = await USER.findById(userId);
        user.connectedServices = user.connectedServices.filter(s => s.serviceId !== serviceId);
        await user.save();

        res.status(200).json({ success: true, message: `${serviceId} disconnected successfully`, data: user.connectedServices });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getAvatar = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await USER.findById(userId);
        if (!user || !user.profilePic) {
            const path = require('path');
            const fs = require('fs');
            const defaultPath = path.join(__dirname, '../../../public/user-icon.png');
            if (fs.existsSync(defaultPath)) {
                return res.sendFile(defaultPath);
            }
            return res.status(404).json({ message: 'Avatar not found' });
        }

        // 1. If it's a local upload
        if (user.profilePic.startsWith('/uploads/')) {
            const path = require('path');
            const fs = require('fs');
            const localPath = path.join(__dirname, '../../../public', user.profilePic);
            if (fs.existsSync(localPath)) {
                try {
                    const encryptedBuffer = fs.readFileSync(localPath);
                    const crypto = require('crypto');
                    const { deriveKeyAndIv } = require('./drive.service');
                    const { key, iv } = deriveKeyAndIv(userId);
                    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
                    const decryptedBuffer = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);

                    res.setHeader('Content-Type', 'image/png');
                    res.setHeader('Cache-Control', 'public, max-age=86400, must-revalidate');
                    return res.send(decryptedBuffer);
                } catch (decErr) {
                    console.error("⚠️ Local avatar decryption failed, serving fallback:", decErr.message);
                }
            }
            // Fallback if local file was deleted/missing
            const defaultPath = path.join(__dirname, '../../../public/user-icon.png');
            if (fs.existsSync(defaultPath)) {
                return res.sendFile(defaultPath);
            }
        }

        // 2. If it's a Google Drive URL, proxy and decrypt it
        if (user.profilePic.startsWith('https://drive.google.com/')) {
            // Extract fileId from URL (which is passed in search query ?id=...)
            const url = new URL(user.profilePic);
            const fileId = url.searchParams.get('id');
            if (!fileId) {
                return res.status(400).json({ message: 'Invalid avatar file ID' });
            }

            const { drive } = require('../../common/config/googleDrive');
            const { deriveKeyAndIv } = require('./drive.service');

            if (!drive) {
                return res.status(500).json({ message: 'Google Drive configuration missing' });
            }

            // Fetch private file binary stream from Google Drive API
            const driveRes = await drive.files.get({
                fileId: fileId,
                alt: 'media'
            }, { responseType: 'arraybuffer' });

            const encryptedBuffer = Buffer.from(driveRes.data);

            // Decrypt the binary buffer
            const crypto = require('crypto');
            const { key, iv } = deriveKeyAndIv(userId);
            const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
            const decryptedBuffer = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);

            // Set dynamic caching and content type headers
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Cache-Control', 'public, max-age=86400, must-revalidate');
            return res.send(decryptedBuffer);
        }

        // 3. Fallback: serve the default avatar image for all other cases
        const path = require('path');
        const fs = require('fs');
        const defaultPath = path.join(__dirname, '../../../public/user-icon.png');
        if (fs.existsSync(defaultPath)) {
            return res.sendFile(defaultPath);
        }
        return res.status(404).json({ message: 'Default avatar not found' });
    } catch (error) {
        console.error('❌ Decryption proxy server error:', error.message);
        // Fallback to local default person icon if things go wrong
        const path = require('path');
        const fs = require('fs');
        const defaultPath = path.join(__dirname, '../../../public/user-icon.png');
        if (fs.existsSync(defaultPath)) {
            return res.sendFile(defaultPath);
        }
        return res.status(500).json({ message: 'Failed to retrieve profile picture' });
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
    getAvatar, 
    terminateSession, 
    terminateAllOtherSessions,
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
    reactivateAccount,
    connectService,
    disconnectService
};
