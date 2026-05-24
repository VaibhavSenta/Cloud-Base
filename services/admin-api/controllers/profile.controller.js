const profileServices = require('../services/profile.services');

const getProfile = async (req, res, next) => {
    try {
        // req.user humein verifyToken middleware se milta hai
        const adminData = await profileServices.getAdminProfile(req.user._id);
        return res.json({ success: true, data: adminData });
    } catch (err) { next(err); }
};

const getSessions = async (req, res, next) => {
    try {
        const sessions = await profileServices.getActiveSessions(req.user._id);
        return res.json({ success: true, data: sessions });
    } catch (err) { next(err); }
};

const terminateSession = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        await profileServices.terminateSession(req.user._id, sessionId);
        return res.json({ success: true, msg: "Session terminated successfully" });
    } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
    try {
        
        const updatedAdmin = await profileServices.updateAdminProfile(req.user._id, req.body);
        return res.json({
            success: true,
            msg: "Profile updated successfully",
            data: updatedAdmin
        });
    } catch (err) { next(err); }
};

module.exports = { getProfile, getSessions, terminateSession, updateProfile };