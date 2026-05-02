const AccessLog = require('../models/AccessLog.model');
const Customer = require('../models/Customer.model');
const User = require('../models/User.model');
const { createError, sendResponse, audit, applyDateRangeFilter, sendCSV } = require('../utils/helpers');

exports.getLogs = async (req, res, next) => {
  try {
    const {
      branch,
      customer,
      locker,
      search,
      from,
      to,
      sortBy = 'accessDate',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query;
    const filter = {};
    if (customer) filter.customer = customer;
    if (locker) filter.locker = locker;
    if (branch) filter.branch = branch;
    else if (req.user.role !== 'SUPER_ADMIN') filter.branch = req.user.branch;

    if (search) {
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');
      const customers = await Customer.find({ user: { $in: users.map((u) => u._id) } }).select('_id');
      filter.customer = { $in: customers.map((c) => c._id) };
    }

    applyDateRangeFilter(filter, 'accessDate', from, to);

    const allowedSort = ['accessDate', 'createdAt'];
    const safeSortBy = allowedSort.includes(sortBy) ? sortBy : 'accessDate';
    const safeSortOrder = sortOrder === 'asc' ? 1 : -1;

    const total = await AccessLog.countDocuments(filter);
    const logs = await AccessLog.find(filter)
      .populate('locker', 'lockerNumber category')
      .populate({ path: 'customer', populate: { path: 'user', select: 'name email' } })
      .populate('approvedBy', 'name')
      .sort({ [safeSortBy]: safeSortOrder })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, data: logs, meta: { total, page: +page, limit: +limit, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

exports.exportLogs = async (req, res, next) => {
  try {
    const { branch, customer, locker, search, from, to } = req.query;
    const filter = {};
    if (customer) filter.customer = customer;
    if (locker) filter.locker = locker;
    if (branch) filter.branch = branch;
    else if (req.user.role !== 'SUPER_ADMIN') filter.branch = req.user.branch;

    if (search) {
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');
      const customers = await Customer.find({ user: { $in: users.map((u) => u._id) } }).select('_id');
      filter.customer = { $in: customers.map((c) => c._id) };
    }

    applyDateRangeFilter(filter, 'accessDate', from, to);

    const logs = await AccessLog.find(filter)
      .populate('locker', 'lockerNumber')
      .populate({ path: 'customer', populate: { path: 'user', select: 'name email' } })
      .populate('approvedBy', 'name')
      .sort('-accessDate');

    const rows = logs.map((log) => ({
      AccessDate: log.accessDate ? new Date(log.accessDate).toISOString() : '',
      Customer: log.customer?.user?.name || '',
      CustomerEmail: log.customer?.user?.email || '',
      Locker: log.locker?.lockerNumber || '',
      Purpose: log.purpose || '',
      ApprovedBy: log.approvedBy?.name || '',
      Remarks: log.remarks || '',
    }));

    return sendCSV(res, rows, `access-logs-export-${Date.now()}.csv`);
  } catch (err) {
    next(err);
  }
};

exports.createLog = async (req, res, next) => {
  try {
    const log = await AccessLog.create({ ...req.body, approvedBy: req.user._id });
    await audit(req.user._id, 'CREATE_ACCESS_LOG', 'AccessLog', log._id, {}, req);
    sendResponse(res, 201, log, 'Access log recorded');
  } catch (err) { next(err); }
};

exports.updateLog = async (req, res, next) => {
  try {
    const log = await AccessLog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!log) return next(createError('Log not found', 404));
    sendResponse(res, 200, log);
  } catch (err) { next(err); }
};
