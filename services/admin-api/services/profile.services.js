const {ADMIN, SESSION} = require('../models/centralstation');

// 1. Fetch profile from DB excluding password
async function getAdminProfile(adminId) {
    const admin = await ADMIN.findById(adminId).select('-password');
    if (!admin) {
        throw new Error("Admin user not found");
    }
    return admin;
}

// 2. Fetch Active Sessions
async function getActiveSessions(adminId) {
    // Only return valid sessions from the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return await SESSION.find({ 
        adminId, 
        isValid: true,
        createdAt: { $gte: thirtyDaysAgo }
    }).sort({ lastActive: -1 });
}

// 3. Terminate a specific session
async function terminateSession(adminId, sessionId) {
    return await SESSION.findOneAndUpdate(
        { _id: sessionId, adminId },
        { isValid: false },
        { new: true }
    );
}

// 4. Update profile basic credentials (Dynamic yet secure!)
async function updateAdminProfile(adminId, updateData) {
    // 🎯 Whitelist: Sirf inhi fields ko allow karenge update hona
    const allowedUpdates = ['firstname', 'lastname']; 
    
    const filteredUpdate = {};
    Object.keys(updateData).forEach((key) => {
        if (allowedUpdates.includes(key)) {
            filteredUpdate[key] = updateData[key];
        }
    });

    // Agar saari fields check ke baad khali niklin, toh faltu DB hit mat karo
    if (Object.keys(filteredUpdate).length === 0) {
        throw new Error("No valid fields provided for update");
    }

    return await ADMIN.findByIdAndUpdate(
        adminId,
        { $set: filteredUpdate }, // ✨ Safe dynamic data insert
        { new: true, runValidators: true }
    ).select('-password');
}

module.exports = {
    getAdminProfile,
    getActiveSessions,
    terminateSession,
    updateAdminProfile
};