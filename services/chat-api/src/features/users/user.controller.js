const ChatProfile = require('./user.model');

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

    const existingProfile = await ChatProfile.findOne({ chatUsername: cleanedUsername });
    if (existingProfile) {
      return res.status(200).json({ available: false, error: 'Username is already taken.' });
    }

    return res.status(200).json({ available: true });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error during username check.' });
  }
};

// Create new chat profile inside chat DB index
const createProfile = async (req, res) => {
  try {
    const { username, publicKey } = req.body;
    const userId = req.user.id || req.user._id; // Extracted from verified JWT context middleware

    if (!username || !publicKey) {
      return res.status(400).json({ error: 'Username and Public Key parameters are required.' });
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
      publicKey
    });

    await newProfile.save();
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

    // Return public profiles details (exclude private userId bindings)
    return res.status(200).json({
      username: profile.chatUsername,
      publicKey: profile.publicKey,
      avatarUrl: profile.avatarUrl
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error performing user search.' });
  }
};

module.exports = {
  checkUsername,
  createProfile,
  getProfile,
  searchUser
};
