/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
const { GLOBALCONFIG, USER, MANAGEDAPP } = require('../models/centralstation');

const getSystemAnalytics = async (req, res, next) => {
    try {
        // 1. Calculate User Growth (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const growthData = await USER.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // 2. Aggregate App Metrics
        const apps = await MANAGEDAPP.find({}, 'title actives status inMaintenance');
        const totalActives = apps.reduce((acc, app) => acc + (parseInt(app.actives) || 0), 0);
        
        // 3. System Health (Simplified Backend version)
        const activeApps = apps.filter(a => !a.inMaintenance);
        const healthScore = activeApps.length === 0 ? 100 : 
            (activeApps.reduce((acc, a) => acc + (a.status === 'optimal' ? 100 : a.status === 'degraded' ? 50 : 0), 0) / (activeApps.length * 100)) * 100;

        return res.json({
            success: true,
            data: {
                userGrowth: growthData,
                totalActives,
                healthScore: healthScore.toFixed(1),
                appsSummary: apps.sort((a, b) => (parseInt(b.actives) || 0) - (parseInt(a.actives) || 0)).slice(0, 5)
            }
        });
    } catch (err) { next(err); }
};

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
    dashboard,
    getSystemAnalytics
};
