/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
const { USER } = require('./models/User');
const { MANAGEDAPP } = require('./models/ManagedApp');
const { AUDITLOG } = require('./models/AuditLog');

module.exports = {
    USER,
    MANAGEDAPP,
    AUDITLOG
};
