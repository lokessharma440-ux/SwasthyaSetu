const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  entityType: { type: String, required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  actorType: { type: String, required: true }, // 'patient', 'doctor', 'health-worker', 'system'
  actorId: { type: mongoose.Schema.Types.ObjectId },
  metadata: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

// Explicit indexes for activity queries
activityLogSchema.index({ entityType: 1, entityId: 1 });
activityLogSchema.index({ actorType: 1, actorId: 1 });
activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
