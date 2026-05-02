const Locker = require('../models/Locker.model');
const { createError, sendResponse, audit } = require('../utils/helpers');

exports.getLockers = async (req, res, next) => {
  try {
    const { branch, status, category, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (branch) filter.branch = branch;
    else if (req.user.role === 'BRANCH_MANAGER' || req.user.role === 'LOCKER_OFFICER') {
      filter.branch = req.user.branch;
    }
    const total = await Locker.countDocuments(filter);
    const lockers = await Locker.find(filter)
      .populate('branch', 'name code')
      .sort('lockerNumber')
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, data: lockers, meta: { total, page: +page, limit: +limit, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

exports.getLocker = async (req, res, next) => {
  try {
    const locker = await Locker.findById(req.params.id).populate('branch', 'name code');
    if (!locker) return next(createError('Locker not found', 404));
    res.json({ success: true, data: locker });
  } catch (err) { next(err); }
};

exports.createLocker = async (req, res, next) => {
  try {
    const locker = await Locker.create(req.body);
    await audit(req.user._id, 'CREATE_LOCKER', 'Locker', locker._id, { lockerNumber: locker.lockerNumber }, req);
    sendResponse(res, 201, locker, 'Locker created successfully');
  } catch (err) { next(err); }
};

exports.updateLocker = async (req, res, next) => {
  try {
    const locker = await Locker.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!locker) return next(createError('Locker not found', 404));
    await audit(req.user._id, 'UPDATE_LOCKER', 'Locker', locker._id, {}, req);
    sendResponse(res, 200, locker);
  } catch (err) { next(err); }
};

exports.deleteLocker = async (req, res, next) => {
  try {
    const locker = await Locker.findById(req.params.id);
    if (!locker) return next(createError('Locker not found', 404));
    if (locker.status === 'Allocated') return next(createError('Cannot delete an allocated locker', 400));
    await locker.deleteOne();
    await audit(req.user._id, 'DELETE_LOCKER', 'Locker', locker._id, {}, req);
    sendResponse(res, 200, null, 'Locker deleted');
  } catch (err) { next(err); }
};

exports.getLockerStats = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role !== 'SUPER_ADMIN') filter.branch = req.user.branch;
    const stats = await Locker.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const byCategory = await Locker.aggregate([
      { $match: filter },
      { $group: { _id: '$category', count: { $sum: 1 }, available: { $sum: { $cond: [{ $eq: ['$status', 'Available'] }, 1, 0] } } } },
    ]);
    res.json({ success: true, data: { byStatus: stats, byCategory } });
  } catch (err) { next(err); }
};
