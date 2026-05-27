const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  adminId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ADMIN', 
    required: true 
  },
  adminName: { type: String }, // Denormalized for fast display
  action: { 
    type: String, 
    required: true,
    enum: [
      'APP_REGISTERED', 
      'CONFIG_UPDATED', 
      'MAINTENANCE_TOGGLED', 
      'INFRA_UPDATED', 
      'APP_DELETED'
    ]
  },
  targetId: { type: mongoose.Schema.Types.ObjectId }, // ID of the ManagedApp
  appTitle: { type: String }, // Title of the app at the time of log
  details: { type: mongoose.Schema.Types.Mixed }, // flexible object for changes
  ipAddress: { type: String }
}, { timestamps: true });

const AUDITLOG = mongoose.model('AUDITLOG', AuditLogSchema);

module.exports = {
    AUDITLOG
};
