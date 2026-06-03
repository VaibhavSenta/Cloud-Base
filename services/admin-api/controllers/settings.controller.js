const { GLOBALCONFIG } = require('../models/centralstation');

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
