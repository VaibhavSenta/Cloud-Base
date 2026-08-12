/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
const userService = require('../services/user.service');
const auditService = require('../services/audit.service');
const { USER } = require('../models/centralstation');

const getAllUsers = async (req, res, next) => {
    try {
        const { page, limit, search, role } = req.query;
        const result = await userService.getUsers({ page, limit, search, role });
        return res.json({ success: true, data: result.users, pagination: result.pagination });
    } catch (err) { next(err); }
};

const exportUsersCSV = async (req, res, next) => {
    try {
        const users = await USER.find().sort({ createdAt: -1 });
        
        // 1. Build CSV Header
        let csv = 'First Name,Last Name,Email,Role,Status,Joined Date\n';
        
        // 2. Build CSV Rows
        users.forEach(user => {
            csv += `${user.firstName || ''},${user.lastName || ''},${user.email},${user.role || 'User'},${user.accountStatus},${user.createdAt.toISOString()}\n`;
        });

        // 3. Set Headers for Download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=ecosystem_users.csv');
        return res.status(200).send(csv);
        
    } catch (err) { next(err); }
};

const toggleUserStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'active' or 'banned'
        
        const user = await userService.updateUserStatus(id, status);
        
        // Audit Log
        await auditService.createLog({
            adminId: req.user._id,
            action: 'USER_STATUS_CHANGED',
            targetId: user._id,
            appTitle: 'Ecosystem Users',
            details: { changedUser: user.email, newStatus: status },
            ipAddress: req.ip
        });

        return res.json({ success: true, msg: `User status changed to ${status}`, data: user });
    } catch (err) { next(err); }
};

module.exports = { getAllUsers, toggleUserStatus, exportUsersCSV };
