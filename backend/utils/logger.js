const ActivityLog = require('../models/ActivityLog');

exports.logActivity = async ({ action, entityType, entityId, actorType, actorId, metadata }) => {
  try {
    await ActivityLog.create({
      action,
      entityType,
      entityId,
      actorType,
      actorId,
      metadata
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};
