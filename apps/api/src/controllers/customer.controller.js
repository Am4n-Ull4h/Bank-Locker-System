const Customer = require('../models/Customer.model');
const User = require('../models/User.model');
const { createError, sendResponse, audit, applyDateRangeFilter, sendCSV } = require('../utils/helpers');

exports.getMyCustomerProfile = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ user: req.user._id })
      .populate('user', 'name email phone role')
      .populate('branch', 'name code')
      .populate('kycVerifiedBy', 'name');

    if (!customer) return next(createError('Customer profile not found', 404));
    sendResponse(res, 200, customer);
  } catch (err) { next(err); }
};

exports.getCustomers = async (req, res, next) => {
  try {
    const {
      branch,
      kycStatus,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      createdFrom,
      createdTo,
      page = 1,
      limit = 10,
      search,
    } = req.query;
    const filter = {};
    if (kycStatus) filter.kycStatus = kycStatus;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (branch) filter.branch = branch;
    else if (req.user.role !== 'SUPER_ADMIN') filter.branch = req.user.branch;

    if (search) {
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');
      filter.user = { $in: users.map(u => u._id) };
    }

    applyDateRangeFilter(filter, 'createdAt', createdFrom, createdTo);

    const allowedSort = ['createdAt', 'customerCode', 'cnic', 'kycStatus'];
    const safeSortBy = allowedSort.includes(sortBy) ? sortBy : 'createdAt';
    const safeSortOrder = sortOrder === 'asc' ? 1 : -1;

    const total = await Customer.countDocuments(filter);
    const customers = await Customer.find(filter)
      .populate('user', 'name email phone')
      .populate('branch', 'name code')
      .sort({ [safeSortBy]: safeSortOrder })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, data: customers, meta: { total, page: +page, limit: +limit, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

exports.exportCustomers = async (req, res, next) => {
  try {
    const { branch, kycStatus, isActive, search, createdFrom, createdTo } = req.query;
    const filter = {};
    if (kycStatus) filter.kycStatus = kycStatus;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (branch) filter.branch = branch;
    else if (req.user.role !== 'SUPER_ADMIN') filter.branch = req.user.branch;

    if (search) {
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');
      filter.user = { $in: users.map((u) => u._id) };
    }

    applyDateRangeFilter(filter, 'createdAt', createdFrom, createdTo);

    const customers = await Customer.find(filter)
      .populate('user', 'name email phone')
      .populate('branch', 'name code')
      .sort('-createdAt');

    const rows = customers.map((customer) => ({
      CustomerCode: customer.customerCode,
      Name: customer.user?.name || '',
      Email: customer.user?.email || '',
      Phone: customer.user?.phone || '',
      CNIC: customer.cnic,
      Branch: customer.branch?.name || '',
      KYCStatus: customer.kycStatus,
      Active: customer.isActive ? 'Yes' : 'No',
      CreatedAt: customer.createdAt ? new Date(customer.createdAt).toISOString() : '',
    }));

    return sendCSV(res, rows, `customers-export-${Date.now()}.csv`);
  } catch (err) {
    next(err);
  }
};

exports.getCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate('user', 'name email phone role')
      .populate('branch', 'name code')
      .populate('kycVerifiedBy', 'name');
    if (!customer) return next(createError('Customer not found', 404));
    res.json({ success: true, data: customer });
  } catch (err) { next(err); }
};

exports.createCustomer = async (req, res, next) => {
  try {
    const { name, email, password, phone, ...customerData } = req.body;
    const user = await User.create({ name, email, password, phone, role: 'CUSTOMER', branch: customerData.branch });
    const customer = await Customer.create({ ...customerData, user: user._id });
    await audit(req.user._id, 'CREATE_CUSTOMER', 'Customer', customer._id, { name }, req);
    const populated = await customer.populate('user', 'name email phone');
    sendResponse(res, 201, populated, 'Customer created successfully');
  } catch (err) { next(err); }
};

exports.updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('user', 'name email phone');
    if (!customer) return next(createError('Customer not found', 404));
    await audit(req.user._id, 'UPDATE_CUSTOMER', 'Customer', customer._id, {}, req);
    sendResponse(res, 200, customer);
  } catch (err) { next(err); }
};

exports.verifyKYC = async (req, res, next) => {
  try {
    const { status } = req.body;
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { kycStatus: status, kycVerifiedBy: req.user._id, kycVerifiedAt: Date.now() },
      { new: true }
    );
    if (!customer) return next(createError('Customer not found', 404));
    await audit(req.user._id, 'VERIFY_KYC', 'Customer', customer._id, { status }, req);
    sendResponse(res, 200, customer, `KYC ${status}`);
  } catch (err) { next(err); }
};
