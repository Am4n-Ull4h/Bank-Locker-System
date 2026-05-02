const LockerAllocation = require('../models/LockerAllocation.model');
const Locker = require('../models/Locker.model');
const Payment = require('../models/Payment.model');
const Customer = require('../models/Customer.model');
const { createError, sendResponse, audit } = require('../utils/helpers');

exports.getMyAllocations = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ user: req.user._id });
    if (!customer) return next(createError('Customer profile not found', 404));

    const allocations = await LockerAllocation.find({ customer: customer._id })
      .populate('locker', 'lockerNumber category annualRent status')
      .populate('branch', 'name code')
      .populate('allocatedBy', 'name')
      .sort('-createdAt');

    sendResponse(res, 200, allocations);
  } catch (err) { next(err); }
};

exports.getAllocations = async (req, res, next) => {
  try {
    const { branch, customer, status, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (customer) filter.customer = customer;
    if (branch) filter.branch = branch;
    else if (req.user.role !== 'SUPER_ADMIN') filter.branch = req.user.branch;

    const total = await LockerAllocation.countDocuments(filter);
    const allocations = await LockerAllocation.find(filter)
      .populate('locker', 'lockerNumber category annualRent')
      .populate('customer', 'customerCode cnic')
      .populate({ path: 'customer', populate: { path: 'user', select: 'name email phone' } })
      .populate('branch', 'name code')
      .populate('allocatedBy', 'name')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, data: allocations, meta: { total, page: +page, limit: +limit, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

exports.getAllocation = async (req, res, next) => {
  try {
    const allocation = await LockerAllocation.findById(req.params.id)
      .populate('locker')
      .populate({ path: 'customer', populate: { path: 'user', select: 'name email phone' } })
      .populate('branch', 'name code')
      .populate('allocatedBy', 'name');
    if (!allocation) return next(createError('Allocation not found', 404));
    res.json({ success: true, data: allocation });
  } catch (err) { next(err); }
};

exports.createAllocation = async (req, res, next) => {
  try {
    const locker = await Locker.findById(req.body.locker);
    if (!locker) return next(createError('Locker not found', 404));
    if (locker.status !== 'Available') return next(createError('Locker is not available', 400));

    const allocation = await LockerAllocation.create({ ...req.body, allocatedBy: req.user._id });

    // Update locker status
    await Locker.findByIdAndUpdate(req.body.locker, { status: 'Allocated' });

    // Create initial deposit payment
    if (req.body.depositAmount) {
      await Payment.create({
        allocation: allocation._id,
        customer: req.body.customer,
        branch: req.body.branch,
        locker: req.body.locker,
        paymentType: 'Security Deposit',
        amount: req.body.depositAmount,
        dueDate: new Date(),
        status: 'Pending',
      });
    }

    // Create first annual rent payment
    await Payment.create({
      allocation: allocation._id,
      customer: req.body.customer,
      branch: req.body.branch,
      locker: req.body.locker,
      paymentType: 'Annual Rent',
      amount: req.body.rentAmount,
      dueDate: new Date(req.body.startDate),
      periodFrom: new Date(req.body.startDate),
      periodTo: new Date(req.body.expiryDate),
      status: 'Pending',
    });

    await audit(req.user._id, 'CREATE_ALLOCATION', 'Allocation', allocation._id, {}, req);
    sendResponse(res, 201, allocation, 'Locker allocated successfully');
  } catch (err) { next(err); }
};

exports.updateAllocation = async (req, res, next) => {
  try {
    const allocation = await LockerAllocation.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!allocation) return next(createError('Allocation not found', 404));
    await audit(req.user._id, 'UPDATE_ALLOCATION', 'Allocation', allocation._id, {}, req);
    sendResponse(res, 200, allocation);
  } catch (err) { next(err); }
};

exports.terminateAllocation = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const allocation = await LockerAllocation.findById(req.params.id);
    if (!allocation) return next(createError('Allocation not found', 404));
    if (allocation.status !== 'Active') return next(createError('Allocation is not active', 400));

    allocation.status = 'Terminated';
    allocation.terminationReason = reason;
    allocation.terminatedBy = req.user._id;
    allocation.terminatedAt = new Date();
    await allocation.save();

    await Locker.findByIdAndUpdate(allocation.locker, { status: 'Available' });
    await audit(req.user._id, 'TERMINATE_ALLOCATION', 'Allocation', allocation._id, { reason }, req);
    sendResponse(res, 200, allocation, 'Allocation terminated');
  } catch (err) { next(err); }
};
