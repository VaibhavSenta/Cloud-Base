const cron = require('node-cron');
const axios = require('axios');
const { MANAGEDAPP } = require('../models/centralstation');
const auditService = require('./audit.service');
const pushService = require('./push.service');

/**
 * HealthMonitorService - Periodically checks the status of all registered apps
 */
class HealthMonitorService {
    static async checkAppHealth(app) {
        if (!app.userUrl) return;

        const url = app.userUrl.startsWith('http') ? app.userUrl : `https://${app.userUrl}`;
        const start = Date.now();
        const oldStatus = app.status;

        try {
            const response = await axios.get(url, { 
                timeout: 10000, 
                validateStatus: () => true 
            });

            const latency = Date.now() - start;
            let status = 'optimal';

            if (response.status >= 500) {
                status = 'degraded';
            } else if (response.status >= 400 && response.status !== 401 && response.status !== 403) {
                status = 'degraded';
            }

            // 📢 Alert Logic: If status changed to something bad
            if (status !== oldStatus && status !== 'optimal') {
                await auditService.createLog({
                    adminId: null, // System generated
                    action: 'SYSTEM_ALERT',
                    targetId: app._id,
                    appTitle: app.title,
                    details: { event: 'Status Degraded', code: response.status, latency: `${latency}ms` },
                    ipAddress: 'Internal Monitor'
                });

                // Web Push Notification
                await pushService.broadcastNotification({
                    title: `⚠️ Status Alert: ${app.title}`,
                    body: `Service is ${status} with ${response.status} status code.`,
                    url: `/apps/${app.title}`
                });
            }

            await MANAGEDAPP.findByIdAndUpdate(app._id, {
                status: status,
                latency: `${latency}ms`,
                lastChecked: new Date()
            });

        } catch (err) {
            console.error(`🚨 Health Check Failed for ${app.title}:`, err.message);
            
            // 📢 Critical Alert: If app goes DOWN
            if (oldStatus !== 'down') {
                await auditService.createLog({
                    adminId: null, 
                    action: 'SYSTEM_CRITICAL',
                    targetId: app._id,
                    appTitle: app.title,
                    details: { event: 'Infrastructure Failure', error: err.message },
                    ipAddress: 'Internal Monitor'
                });

                // Web Push Notification (Critical)
                await pushService.broadcastNotification({
                    title: `🚨 CRITICAL: ${app.title} is DOWN`,
                    body: `Infrastructure failure detected: ${err.message}`,
                    url: `/apps/${app.title}`
                });
            }

            await MANAGEDAPP.findByIdAndUpdate(app._id, {
                status: 'down',
                latency: '0ms',
                lastChecked: new Date()
            });
        }
    }

    static start() {
        console.log("📡 Infrastructure Monitor: Active (Every 4 minutes)");

        // Schedule: Every 4 minutes
        cron.schedule('*/4 * * * *', async () => {
            console.log("🔍 Running automated health check for all nodes...");
            try {
                const apps = await MANAGEDAPP.find({});
                
                // Run checks in parallel
                await Promise.all(apps.map(app => this.checkAppHealth(app)));
                
                console.log(`✅ Automated health check complete for ${apps.length} apps.`);
            } catch (err) {
                console.error("❌ Cron Job Error:", err.message);
            }
        });
    }
}

module.exports = HealthMonitorService;
