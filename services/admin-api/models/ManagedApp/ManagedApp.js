const mongoose = require('mongoose');
const { type } = require('os');

const ManagedAppSchema = new mongoose.Schema({
  title: { type: String, required: true },       // e.g., "Chat Engine"
  name: { type: String, required: true, unique: true }, // e.g., "chat" (for states)
  userUrl: { type: String, required: true },    // e.g., "chat.cloudbase.com"
  icon: { type: String, default: "apps" },       // Material icon name
  description: { type: String },
  
  // Infrastructure Control
  port: { type: Number , default: null},
  version: { type: String, default: "v1.0.0" },
  environment: { type: String, enum: ['production', 'staging', 'development'], default: 'production' },
  
  // Live Status & Metrics
  status: { type: String, enum: ['optimal', 'degraded', 'down'], default: 'optimal' },
  traffic: { type: String, enum: ['Stable', 'High'], default: 'Stable' },
  actives: { type: String, default: "0" },       // e.g., "8.4k"
  latency: { type: String, default: "15ms" },
  inMaintenance: { type: Boolean, default: false},
  
  // Audits
  establishedAt: { type: Date, default: Date.now },
  lastDeployedAt: { type: Date, default: Date.now  },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
}, { timestamps: true });

const MANAGEDAPP = mongoose.model('MANAGEDAPP', ManagedAppSchema);
module.exports = {
    MANAGEDAPP
}