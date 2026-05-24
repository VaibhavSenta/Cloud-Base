const { GLOBALCONFIG } = require('../models/centralstation');

const getGlobalConfig = async (req, res, next) => {
    try {
        const config = await GLOBALCONFIG.findOne({ key: 'global_maintenance' });
        return res.json({ 
            success: true, 
            value: config ? config.value : false 
        });
    } catch (err) { next(err); }
};

const toggleGlobalMaintenance = async (req, res, next) => {
    try {
        const { value } = req.body;
        // console.log("Toggling global maintenance to:", value);
        
        const config = await GLOBALCONFIG.findOneAndUpdate(
            { key: 'global_maintenance' },
            { value: value, updatedBy: req.user ? req.user._id : null },
            { upsert: true, new: true }
        );
        return res.json({ 
            success: true, 
            msg: `Global Maintenance Mode set to ${value}`,
            value: config.value 
        });
    } catch (err) { next(err); }
};

const dashboard = async (req, res, next) => {
    try {
        return res.json({
            success: true,
            msg: "Dashboard engine operational"
        });
    } catch (err) { next(err); }
};

module.exports = {
    getGlobalConfig,
    toggleGlobalMaintenance,
    dashboard
};
