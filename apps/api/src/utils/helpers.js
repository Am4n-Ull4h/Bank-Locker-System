const jwt = require('jsonwebtoken');
const AuditLog = require('../models/AuditLog.model');

exports.createError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

exports.sendToken = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
  user.password = undefined;
  res.status(statusCode).json({
    success: true,
    data: { token, user },
  });
};

exports.sendResponse = (res, statusCode, data, message = 'Success') => {
  res.status(statusCode).json({ success: true, message, data });
};

exports.paginate = (query, page = 1, limit = 10) => {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  return query.skip(skip).limit(parseInt(limit));
};

exports.getPaginationMeta = (total, page, limit) => ({
  total,
  page: parseInt(page),
  limit: parseInt(limit),
  pages: Math.ceil(total / parseInt(limit)),
});

exports.audit = async (userId, action, module, targetId = null, details = {}, req = null) => {
  try {
    await AuditLog.create({
      user: userId,
      action,
      module,
      targetId,
      details,
      ipAddress: req?.ip,
      userAgent: req?.headers?.['user-agent'],
    });
  } catch {
    // Silent fail for audit logs
  }
};

exports.applyDateRangeFilter = (filter, field, from, to) => {
  if (!from && !to) return filter;
  filter[field] = {};
  if (from) filter[field].$gte = new Date(from);
  if (to) {
    const endOfDay = new Date(to);
    endOfDay.setHours(23, 59, 59, 999);
    filter[field].$lte = endOfDay;
  }
  return filter;
};

exports.sendCSV = (res, rows, filename = 'export.csv') => {
  if (!rows?.length) {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send('');
  }

  const headers = Object.keys(rows[0]);
  const escapeCell = (value) => {
    if (value === null || value === undefined) return '';
    const cell = String(value).replace(/"/g, '""');
    return /[",\n]/.test(cell) ? `"${cell}"` : cell;
  };

  const lines = [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => escapeCell(row[header])).join(',')),
  ];

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  return res.status(200).send(lines.join('\n'));
};
