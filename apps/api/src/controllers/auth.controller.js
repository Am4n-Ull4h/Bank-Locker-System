const User = require('../models/User.model');
const { sendToken, createError, audit, sendResponse } = require('../utils/helpers');

// @desc   Login
// @route  POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return next(createError('Please provide email and password', 400));

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return next(createError('Invalid credentials', 401));
    }
    if (!user.isActive) return next(createError('Account is deactivated', 401));

    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    await audit(user._id, 'LOGIN', 'Auth', null, { email }, req);
    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc   Get current user
// @route  GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('branch', 'name code city');
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

exports.updateMe = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'phone'];
    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    }).populate('branch', 'name code city');

    await audit(req.user._id, 'UPDATE_PROFILE', 'Auth', req.user._id, updateData, req);
    sendResponse(res, 200, user, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
};

exports.getSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('preferences');
    sendResponse(res, 200, user?.preferences || {}, 'Settings fetched successfully');
  } catch (err) {
    next(err);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const payload = req.body || {};
    const user = await User.findById(req.user._id);
    if (!user) return next(createError('User not found', 404));

    user.preferences = {
      ...(user.preferences || {}),
      ...payload,
      notifications: {
        ...(user.preferences?.notifications || {}),
        ...(payload.notifications || {}),
      },
    };

    await user.save({ validateBeforeSave: true });
    await audit(req.user._id, 'UPDATE_SETTINGS', 'Auth', req.user._id, payload, req);
    sendResponse(res, 200, user.preferences, 'Settings updated successfully');
  } catch (err) {
    next(err);
  }
};

// @desc   Change password
// @route  PUT /api/auth/change-password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return next(createError('Current password is incorrect', 400));
    }
    user.password = newPassword;
    user.passwordChangedAt = Date.now();
    await user.save();
    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc   Logout (client-side clears token; this just returns success)
// @route  POST /api/auth/logout
exports.logout = (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};
