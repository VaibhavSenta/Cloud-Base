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
    
    const deviceInfo = sessionService.parseDeviceInfo(req);
    const result = await authService.loginAccount({ identifier, password, otp, isPartial }, deviceInfo);
    
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
        const userId = req.user.userId;
        const currentSessionId = req.user.sessionId;

        const user = await USER.findById(userId).select('-password');
        if (!user) throw new Error('User not found in DB');

        // Mark current session and sort (current first)
        const sessions = user.sessions.map(s => ({
            ...s.toObject(),
            isCurrent: s.sessionId === currentSessionId
        })).sort((a, b) => b.isCurrent - a.isCurrent);

        const userData = user.toObject();
        userData.sessions = sessions;

        res.status(200).json({ success: true, data: userData });
    } catch (error) {
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

module.exports = { handshake, signup, login, logout, getMe, updateProfile, terminateSession };
