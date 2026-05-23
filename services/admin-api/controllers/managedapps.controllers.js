const managedappsServicess = require('../services/managedapps.services');

const addApp = async (req, res, next) => {
    try {
        req.body.updatedBy = req.user._id;
        const result = await managedappsServicess.addApp(req.body);
        return res.json({ success: true, msg: "App added successfully", data: result });
    } catch (err) { next(err); }
};

const getAllApps = async (req, res, next) => {
    try {
        const apps = await managedappsServicess.getAllApps();
        return res.json({ success: true, data: apps });
    } catch (err) { next(err); }
};

const toggleMaintenance = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updatedBy = req.user._id;
        const result = await managedappsServicess.toggleMaintenance(id, updatedBy);
        return res.json({ success: true, msg: "Maintenance status updated", data: result });
    } catch (err) { next(err); }
};

const updateApp = async (req, res, next) => {
    try {
        const { id } = req.params;
        req.body.updatedBy = req.user._id;
        const result = await managedappsServicess.updateApp(id, req.body);
        return res.json({ success: true, msg: "App updated successfully", data: result });
    } catch (err) { next(err); }
};

module.exports = { addApp, getAllApps, toggleMaintenance, updateApp };