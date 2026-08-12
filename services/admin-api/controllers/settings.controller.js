/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
const { GLOBALCONFIG } = require('../models/centralstation');
const auditService = require('../services/audit.service');

/**
 * Get all global settings
 */
const getSettings = async (req, res, next) => {
    try {
        const settings = await GLOBALCONFIG.find();
        // Convert array to object for easier frontend use
        const settingsObj = {};
        settings.forEach(s => {
            settingsObj[s.key] = s.value;
        });
        res.json(settingsObj);
    } catch (err) {
        next(err);
    }
};

/**
 * Update a specific setting
 */
const updateSetting = async (req, res, next) => {
    const { key, value } = req.body;
    console.log(`🛠️ Updating Setting: ${key} = ${value}`);
    try {
        const updateData = { value };
        if (req.user && req.user.id) {
            updateData.updatedBy = req.user.id;
        }
        
        const updatedSetting = await GLOBALCONFIG.findOneAndUpdate(
            { key },
            updateData,
            { upsert: true, new: true }
        );

        // Enhanced Audit Logging
        if (req.user && req.user.id) {
            await auditService.createEnhancedLog({
                adminId: req.user.id,
                action: 'SETTINGS_UPDATE',
                targetId: null,
                appTitle: 'Global Console Settings',
                details: { setting: key, newValue: value },
                ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress
            });
        }

        res.json({ success: true, msg: `Setting ${key} updated`, setting: updatedSetting });
    } catch (err) {
        console.error("❌ Update Setting Error:", err.message);
        next(err);
    }
};

module.exports = {
    getSettings,
    updateSetting
};
