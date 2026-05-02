const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const { createError } = require('../utils/helpers');

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return next(createError('Not authorized, no token', 401));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return next(createError('User not found', 401));
    if (!user.isActive) return next(createError('Account deactivated', 401));
    if (user.changedPasswordAfter(decoded.iat)) return next(createError('Password changed, please login again', 401));

    req.user = user;
    next();
  } catch (err) {
    return next(createError('Not authorized', 401));
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(createError(`Access denied for role: ${req.user.role}`, 403));
    }
    next();
  };
};
