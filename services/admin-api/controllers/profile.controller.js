/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
const profileServices = require('../services/profile.services');
const auditService = require('../services/audit.service');

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
        
        // Enhanced Audit Logging
        if (req.user && req.user._id) {
            await auditService.createEnhancedLog({
                adminId: req.user._id,
                action: 'SESSION_TERMINATED',
                targetId: sessionId,
                appTitle: 'Admin Security',
                details: { info: 'User remotely terminated an active session.' },
                ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress
            });
        }

        return res.json({ success: true, msg: "Session terminated successfully" });
    } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
    try {
        
        const updatedAdmin = await profileServices.updateAdminProfile(req.user._id, req.body);
        
        // Enhanced Audit Logging
        if (req.user && req.user._id) {
            await auditService.createEnhancedLog({
                adminId: req.user._id,
                action: 'PROFILE_UPDATED',
                targetId: req.user._id,
                appTitle: 'Admin Profile',
                details: { updatedFields: Object.keys(req.body) },
                ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress
            });
        }

        return res.json({
            success: true,
            msg: "Profile updated successfully",
            data: updatedAdmin
        });
    } catch (err) { next(err); }
};

module.exports = { getProfile, getSessions, terminateSession, updateProfile };