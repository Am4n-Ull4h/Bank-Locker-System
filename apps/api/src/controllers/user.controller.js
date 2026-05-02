const User = require('../models/User.model');
const { createError, sendResponse, audit, applyDateRangeFilter, sendCSV } = require('../utils/helpers');

// @desc  Get all users
exports.getUsers = async (req, res, next) => {
  try {
    const {
      role,
      branch,
      isActive,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      createdFrom,
      createdTo,
      page = 1,
      limit = 10,
    } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (branch) filter.branch = branch;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (req.user.role === 'BRANCH_MANAGER') filter.branch = req.user.branch;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    applyDateRangeFilter(filter, 'createdAt', createdFrom, createdTo);

    const allowedSort = ['createdAt', 'name', 'email', 'lastLogin'];
    const safeSortBy = allowedSort.includes(sortBy) ? sortBy : 'createdAt';
    const safeSortOrder = sortOrder === 'asc' ? 1 : -1;

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .populate('branch', 'name code')
      .sort({ [safeSortBy]: safeSortOrder })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, data: users, meta: { total, page: +page, limit: +limit, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

exports.exportUsers = async (req, res, next) => {
  try {
    const { role, branch, isActive, search, createdFrom, createdTo } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (branch) filter.branch = branch;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (req.user.role === 'BRANCH_MANAGER') filter.branch = req.user.branch;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    applyDateRangeFilter(filter, 'createdAt', createdFrom, createdTo);

    const users = await User.find(filter).populate('branch', 'name code').sort('-createdAt');

    const rows = users.map((user) => ({
      Name: user.name,
      Email: user.email,
      Phone: user.phone || '',
      Role: user.role,
      Branch: user.branch?.name || '',
      Active: user.isActive ? 'Yes' : 'No',
      LastLogin: user.lastLogin ? new Date(user.lastLogin).toISOString() : '',
      CreatedAt: user.createdAt ? new Date(user.createdAt).toISOString() : '',
    }));

    return sendCSV(res, rows, `users-export-${Date.now()}.csv`);
  } catch (err) {
    next(err);
  }
};

// @desc  Get single user
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('branch', 'name code');
    if (!user) return next(createError('User not found', 404));
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

// @desc  Create user
exports.createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    await audit(req.user._id, 'CREATE_USER', 'User', user._id, { name: user.name, role: user.role }, req);
    sendResponse(res, 201, user, 'User created successfully');
  } catch (err) { next(err); }
};

// @desc  Update user
exports.updateUser = async (req, res, next) => {
  try {
    const { password, ...updateData } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!user) return next(createError('User not found', 404));
    await audit(req.user._id, 'UPDATE_USER', 'User', user._id, {}, req);
    sendResponse(res, 200, user);
  } catch (err) { next(err); }
};

// @desc  Delete/deactivate user
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) return next(createError('User not found', 404));
    await audit(req.user._id, 'DEACTIVATE_USER', 'User', user._id, {}, req);
    sendResponse(res, 200, null, 'User deactivated');
  } catch (err) { next(err); }
};
