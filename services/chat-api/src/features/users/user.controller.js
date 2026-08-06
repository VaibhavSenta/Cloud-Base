const ChatProfile = require('./user.model');
const { globalBloomFilter } = require('../../utils/bloomFilter');

// Fetch Bloom Filter bitArray for client-side O(1) instant checking
const getBloomFilter = async (req, res) => {
  try {
    const allProfiles = await ChatProfile.find({}, 'chatUsername');
    allProfiles.forEach(p => globalBloomFilter.add(p.chatUsername));

    return res.status(200).json({
      bitArray: globalBloomFilter.getBitArray(),
      size: globalBloomFilter.size,
      hashFunctions: globalBloomFilter.hashFunctions
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate Bloom Filter' });
  }
};

// Check if username is already taken
const checkUsername = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username || username.trim().length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters long.' });
    }

    const cleanedUsername = username.trim().toLowerCase();
    
    // Regex validation matching standard username constraints
    const usernameRegex = /^[a-z0-9_]+$/;
    if (!usernameRegex.test(cleanedUsername)) {
      return res.status(400).json({ error: 'Username can only contain alphanumeric characters and underscores.' });
    }

    // First check Bloom Filter
    if (!globalBloomFilter.has(cleanedUsername)) {
      return res.status(200).json({ available: true, source: 'bloom_filter' });
    }

    // Bloom Filter says "might exist" -> verify against MongoDB
    const existingProfile = await ChatProfile.findOne({ chatUsername: cleanedUsername });
    if (existingProfile) {
      return res.status(200).json({ available: false, error: 'Username is already taken.' });
    }

    return res.status(200).json({ available: true, source: 'database' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error during username check.' });
  }
};

// Create new chat profile inside chat DB index
const createProfile = async (req, res) => {
  try {
    const { username, publicKey } = req.body;
    const userId = String(req.user.userId || req.user.id || req.user._id || req.user.sub);

    if (!userId || userId === 'undefined') {
      return res.status(400).json({ error: 'User identification missing from auth token.' });
    }

    if (!username) {
      return res.status(400).json({ error: 'Username parameter is required.' });
    }

    const cleanedUsername = username.trim().toLowerCase();
    
    // Validate uniqueness again before write
    const existingUsername = await ChatProfile.findOne({ chatUsername: cleanedUsername });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username is already taken.' });
    }

    const existingUser = await ChatProfile.findOne({ userId });
    if (existingUser) {
      return res.status(400).json({ error: 'User profile already exists.' });
    }

    const newProfile = new ChatProfile({
      userId,
      chatUsername: cleanedUsername,
      publicKey: publicKey || ''
    });

    await newProfile.save();
    
    // Insert into global Bloom Filter bitArray instantly
    globalBloomFilter.add(cleanedUsername);

    return res.status(201).json({ status: 'success', profile: newProfile });
  } catch (error) {
    return res.status(500).json({ error: `Internal server error during profile creation: ${error.message}` });
  }
};

// Get current user profile details
const getProfile = async (req, res) => {
  try {
    const userId = String(req.user.userId || req.user.id || req.user._id);
    const profile = await ChatProfile.findOne({ userId });
    
    if (!profile) {
      console.log(`⚠️ Chat Profile not found for userId: "${userId}"`);
      return res.status(404).json({ error: 'Profile not found. Set up your Chat username.' });
    }

    return res.status(200).json({ profile });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error retrieving user profile.' });
  }
};

// Lookup exact user by username (Privacy Rule: Strict match only)
const searchUser = async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ error: 'Search username parameter is required.' });
    }

    const cleanedUsername = username.trim().toLowerCase();
    const profile = await ChatProfile.findOne({ chatUsername: cleanedUsername });

    if (!profile) {
      return res.status(404).json({ error: 'User not found. Exact match only.' });
    }

    return res.status(200).json({
      username: profile.chatUsername,
      publicKey: profile.publicKey,
      avatarUrl: profile.avatarUrl
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error performing user search.' });
  }
};

const logoutSession = async (req, res) => {
  try {
    const { userId, sessionId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const { disconnectUserSession } = require('../../config/socket');
    
    // Clear cookies for double check
    const isDev = process.env.NODE_ENV !== 'production';
    const domain = isDev ? undefined : (process.env.COOKIE_DOMAIN || '.cloud-base.dev');
    
    res.clearCookie('token', { path: '/', domain });
    res.clearCookie('cb_chat_token', { path: '/', domain });

    // Disconnect active socket connection
    await disconnectUserSession(userId, sessionId);

    console.log(`🔒 [Chat-API] Session terminated backend-to-backend for user: ${userId}, session: ${sessionId || 'all'}`);
    return res.status(200).json({ success: true, message: 'Session disconnected and cookies cleared' });
  } catch (error) {
    console.error('❌ [Chat-API] Error in logoutSession controller:', error.message);
    return res.status(500).json({ error: `Internal server error during logout session: ${error.message}` });
  }
};

const updatePublicKey = async (req, res) => {
  try {
    const { publicKey } = req.body;
    const userId = String(req.user.userId || req.user.id || req.user._id);

    if (!publicKey) {
      return res.status(400).json({ error: 'publicKey parameter is required.' });
    }

    const profile = await ChatProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ error: 'Chat profile not found.' });
    }

    profile.publicKey = publicKey;
    await profile.save();

    console.log(`🔑 [Chat-API] Updated public key for user: ${userId}`);
    return res.status(200).json({ status: 'success', profile });
  } catch (error) {
    return res.status(500).json({ error: `Internal server error during public key update: ${error.message}` });
  }
};

module.exports = {
  getBloomFilter,
  checkUsername,
  createProfile,
  getProfile,
  searchUser,
  logoutSession,
  updatePublicKey
};
