const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  module: {
    type: String,
    enum: ['Auth', 'Branch', 'Locker', 'Customer', 'Allocation', 'Payment', 'AccessLog', 'Request', 'Document', 'User', 'Report'],
  },
  targetId: mongoose.Schema.Types.ObjectId,
  targetModel: String,
  details: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
  status: { type: String, enum: ['Success', 'Failed'], default: 'Success' },
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
