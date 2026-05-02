const AuditLog = require('../models/AuditLog.model');
const { sendResponse } = require('../utils/helpers');

exports.getAuditLogs = async (req, res, next) => {
  try {
    const { module, action, status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (module) filter.module = module;
    if (action) filter.action = action;
    if (status) filter.status = status;

    const total = await AuditLog.countDocuments(filter);
    const logs = await AuditLog.find(filter)
      .populate('user', 'name email role')
      .sort('-createdAt')
      .skip((page - 1) * Number(limit))
      .limit(Number(limit));

    sendResponse(res, 200, logs, 'Audit logs fetched');
  } catch (err) { next(err); }
};