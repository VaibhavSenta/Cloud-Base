const { AUDITLOG, ADMIN, GLOBALCONFIG } = require('../models/centralstation');
const mongoose = require('mongoose');

async function createLog({ adminId, action, targetId, appTitle, details, ipAddress }) {
    try {
        // Fetch admin name for faster UI display without joins
        const admin = await ADMIN.findById(adminId);
        // Using firstname as defined in the ADMIN model
        const adminName = admin ? `${admin.firstname} ${admin.lastname || ''}`.trim() : 'Unknown Admin';

        const log = new AUDITLOG({
            adminId,
            adminName,
            action,
            targetId: mongoose.isValidObjectId(targetId) ? targetId : null,
            appTitle,
            details,
            ipAddress
        });

        await log.save();
        return log;
    } catch (err) {
        console.error("Failed to create audit log:", err);
    }
}

async function createEnhancedLog(logData) {
    try {
        const config = await GLOBALCONFIG.findOne({ key: 'is_enhanced_audit_enabled' });
        if (config && config.value === true) {
            return await createLog(logData);
        }
    } catch (err) {
        console.error("Failed to check enhanced log setting:", err);
    }
}

async function getLogsByApp(appId, limit = 10) {
    try {
        if (!mongoose.isValidObjectId(appId)) return [];
        return await AUDITLOG.find({ targetId: appId })
            .sort({ createdAt: -1 })
            .limit(limit);
    } catch (err) {
        console.error("Error fetching app logs:", err);
        return [];
    }
}

async function getGlobalLogs(limit = 50) {
    try {
        return await AUDITLOG.find()
            .sort({ createdAt: -1 })
            .limit(limit);
    } catch (err) {
        console.error("Error fetching global logs:", err);
        return [];
    }
}

module.exports = { createLog, createEnhancedLog, getLogsByApp, getGlobalLogs };
