const managedappsServicess = require('../services/managedapps.services');
const auditService = require('../services/audit.service');

const addApp = async (req, res, next) => {
    try {
        req.body.updatedBy = req.user._id;
        const result = await managedappsServicess.addApp(req.body);

        // Audit Log
        await auditService.createLog({
            adminId: req.user._id,
            action: 'APP_REGISTERED',
            targetId: result._id,
            appTitle: result.title,
            details: { name: result.name, url: result.userUrl },
            ipAddress: req.ip
        });

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

        // Audit Log
        await auditService.createLog({
            adminId: req.user._id,
            action: 'MAINTENANCE_TOGGLED',
            targetId: result._id,
            appTitle: result.title,
            details: { newState: result.inMaintenance },
            ipAddress: req.ip
        });

        return res.json({ success: true, msg: "Maintenance status updated", data: result });
    } catch (err) { next(err); }
};

const updateApp = async (req, res, next) => {
    try {
        const { id } = req.params;
        req.body.updatedBy = req.user._id;
        const result = await managedappsServicess.updateApp(id, req.body);

        // Logic to determine if it was Infra update or General Config
        const isInfra = req.body.dependencies || req.body.quickLinks;
        const action = isInfra ? 'INFRA_UPDATED' : 'CONFIG_UPDATED';

        // Audit Log
        await auditService.createLog({
            adminId: req.user._id,
            action: action,
            targetId: result._id,
            appTitle: result.title,
            details: { updatedFields: Object.keys(req.body) },
            ipAddress: req.ip
        });

        return res.json({ success: true, msg: "App updated successfully", data: result });
    } catch (err) { next(err); }
};

const getAppByName = async (req, res, next) => {
    try {
        const { name } = req.params;
        const app = await managedappsServicess.getAppByName(name);
        if (!app) return res.status(404).json({ success: false, msg: "App not found" });
        return res.json({ success: true, data: app });
    } catch (err) { next(err); }
};

const getAppLogs = async (req, res, next) => {
    try {
        const { id } = req.params;
        const logs = await auditService.getLogsByApp(id);
        return res.json({ success: true, data: logs });
    } catch (err) { next(err); }
};

const getAllLogs = async (req, res, next) => {
    try {
        const logs = await auditService.getGlobalLogs();
        return res.json({ success: true, data: logs });
    } catch (err) { next(err); }
};

const checkHealth = async (req, res, next) => {
    try {
        const { url } = req.query;
        if (!url) return res.status(400).json({ success: false, msg: "URL is required" });

        const start = Date.now();
        const protocol = url.startsWith('https') ? require('https') : require('http');
        let responseSent = false;

        try {
            const request = protocol.get(url, { timeout: 5000 }, (response) => {
                if (responseSent) return;
                responseSent = true;
                const latency = Date.now() - start;
                return res.json({ 
                    success: true, 
                    status: (response.statusCode >= 200 && response.statusCode < 400) ? 'optimal' : 'degraded',
                    httpCode: response.statusCode,
                    latency: `${latency}ms`
                });
            });

            request.on('error', (err) => {
                if (responseSent) return;
                responseSent = true;
                let msg = 'Infrastructure Link Failed';
                if (err.code === 'ENOTFOUND' || err.code === 'EAI_AGAIN') msg = 'Link Broken / Not Deployed';
                else if (err.code === 'ECONNREFUSED') msg = 'Node Offline / App Not Running';

                return res.json({ success: true, status: 'down', msg, latency: '0ms' });
            });

            request.on('timeout', () => {
                if (responseSent) return;
                responseSent = true;
                request.destroy();
                return res.json({ success: true, status: 'down', msg: 'Connection Timeout', latency: '0ms' });
            });
        } catch (err) {
            if (!responseSent) {
                responseSent = true;
                return res.json({ success: true, status: 'down', msg: 'Invalid URL Format', latency: '0ms' });
            }
        }
    } catch (err) { next(err); }
};

const deleteApp = async (req, res, next) => {
    try {
        const { id } = req.params;
        const app = await MANAGEDAPP.findById(id); // Get info before delete for audit
        if (!app) return res.status(404).json({ success: false, msg: "App not found" });

        await managedappsServicess.deleteApp(id);

        // Audit Log
        await auditService.createLog({
            adminId: req.user._id,
            action: 'APP_DELETED',
            targetId: id,
            appTitle: app.title,
            details: { name: app.name, reason: 'Manual deletion by admin' },
            ipAddress: req.ip
        });

        return res.json({ success: true, msg: "App infrastructure removed permanently" });
    } catch (err) { next(err); }
};

module.exports = { addApp, getAllApps, toggleMaintenance, updateApp, getAppByName, checkHealth, getAppLogs, getAllLogs, deleteApp };