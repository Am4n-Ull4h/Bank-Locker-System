const Branch = require('../models/Branch.model');
const User = require('../models/User.model');
const { createError, sendResponse, audit } = require('../utils/helpers');

exports.getBranches = async (req, res, next) => {
  try {
    const { isActive, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    const total = await Branch.countDocuments(filter);
    const branches = await Branch.find(filter)
      .populate('manager', 'name email phone')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, data: branches, meta: { total, page: +page, limit: +limit, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

exports.getBranch = async (req, res, next) => {
  try {
    const branch = await Branch.findById(req.params.id).populate('manager', 'name email phone');
    if (!branch) return next(createError('Branch not found', 404));
    res.json({ success: true, data: branch });
  } catch (err) { next(err); }
};

exports.createBranch = async (req, res, next) => {
  try {
    const branch = await Branch.create(req.body);
    if (req.body.manager) {
      await User.findByIdAndUpdate(req.body.manager, { branch: branch._id });
    }
    await audit(req.user._id, 'CREATE_BRANCH', 'Branch', branch._id, { name: branch.name }, req);
    sendResponse(res, 201, branch, 'Branch created successfully');
  } catch (err) { next(err); }
};

exports.updateBranch = async (req, res, next) => {
  try {
    const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!branch) return next(createError('Branch not found', 404));
    await audit(req.user._id, 'UPDATE_BRANCH', 'Branch', branch._id, {}, req);
    sendResponse(res, 200, branch);
  } catch (err) { next(err); }
};

exports.deleteBranch = async (req, res, next) => {
  try {
    const branch = await Branch.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!branch) return next(createError('Branch not found', 404));
    await audit(req.user._id, 'DELETE_BRANCH', 'Branch', branch._id, {}, req);
    sendResponse(res, 200, null, 'Branch deactivated');
  } catch (err) { next(err); }
};
