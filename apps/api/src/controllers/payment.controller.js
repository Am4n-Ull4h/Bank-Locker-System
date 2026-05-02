const Payment = require('../models/Payment.model');
const Customer = require('../models/Customer.model');
const User = require('../models/User.model');
const { createError, sendResponse, audit, applyDateRangeFilter, sendCSV } = require('../utils/helpers');

exports.getMyPayments = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ user: req.user._id });
    if (!customer) return next(createError('Customer profile not found', 404));

    const payments = await Payment.find({ customer: customer._id })
      .populate('locker', 'lockerNumber category')
      .populate('branch', 'name code')
      .populate('processedBy', 'name')
      .sort('-createdAt');

    sendResponse(res, 200, payments);
  } catch (err) { next(err); }
};

exports.getPayments = async (req, res, next) => {
  try {
    const {
      branch,
      customer,
      status,
      paymentType,
      paymentMethod,
      search,
      dueFrom,
      dueTo,
      paidFrom,
      paidTo,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (paymentType) filter.paymentType = paymentType;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (customer) filter.customer = customer;
    if (branch) filter.branch = branch;
    else if (req.user.role !== 'SUPER_ADMIN') filter.branch = req.user.branch;

    if (search) {
      const matchedUsers = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');
      const matchedCustomers = await Customer.find({ user: { $in: matchedUsers.map((u) => u._id) } }).select('_id');
      filter.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { receiptNumber: { $regex: search, $options: 'i' } },
        { customer: { $in: matchedCustomers.map((c) => c._id) } },
      ];
    }

    applyDateRangeFilter(filter, 'dueDate', dueFrom, dueTo);
    applyDateRangeFilter(filter, 'paidDate', paidFrom, paidTo);

    const allowedSort = ['createdAt', 'amount', 'dueDate', 'paidDate', 'status'];
    const safeSortBy = allowedSort.includes(sortBy) ? sortBy : 'createdAt';
    const safeSortOrder = sortOrder === 'asc' ? 1 : -1;

    const total = await Payment.countDocuments(filter);
    const payments = await Payment.find(filter)
      .populate('locker', 'lockerNumber category')
      .populate({ path: 'customer', populate: { path: 'user', select: 'name email' } })
      .populate('branch', 'name code')
      .populate('processedBy', 'name')
      .sort({ [safeSortBy]: safeSortOrder })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, data: payments, meta: { total, page: +page, limit: +limit, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

exports.exportPayments = async (req, res, next) => {
  try {
    const {
      branch,
      customer,
      status,
      paymentType,
      paymentMethod,
      search,
      dueFrom,
      dueTo,
      paidFrom,
      paidTo,
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (paymentType) filter.paymentType = paymentType;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (customer) filter.customer = customer;
    if (branch) filter.branch = branch;
    else if (req.user.role !== 'SUPER_ADMIN') filter.branch = req.user.branch;

    if (search) {
      const matchedUsers = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');
      const matchedCustomers = await Customer.find({ user: { $in: matchedUsers.map((u) => u._id) } }).select('_id');
      filter.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { receiptNumber: { $regex: search, $options: 'i' } },
        { customer: { $in: matchedCustomers.map((c) => c._id) } },
      ];
    }

    applyDateRangeFilter(filter, 'dueDate', dueFrom, dueTo);
    applyDateRangeFilter(filter, 'paidDate', paidFrom, paidTo);

    const payments = await Payment.find(filter)
      .populate('locker', 'lockerNumber')
      .populate({ path: 'customer', populate: { path: 'user', select: 'name email' } })
      .populate('branch', 'name code')
      .sort('-createdAt');

    const rows = payments.map((payment) => ({
      ReceiptNumber: payment.receiptNumber || '',
      Customer: payment.customer?.user?.name || '',
      CustomerEmail: payment.customer?.user?.email || '',
      Branch: payment.branch?.name || '',
      Locker: payment.locker?.lockerNumber || '',
      PaymentType: payment.paymentType,
      Amount: payment.amount,
      Status: payment.status,
      PaymentMethod: payment.paymentMethod || '',
      DueDate: payment.dueDate ? new Date(payment.dueDate).toISOString() : '',
      PaidDate: payment.paidDate ? new Date(payment.paidDate).toISOString() : '',
      TransactionId: payment.transactionId || '',
      CreatedAt: payment.createdAt ? new Date(payment.createdAt).toISOString() : '',
    }));

    return sendCSV(res, rows, `payments-export-${Date.now()}.csv`);
  } catch (err) {
    next(err);
  }
};

exports.getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('locker', 'lockerNumber category')
      .populate({ path: 'customer', populate: { path: 'user', select: 'name email phone' } })
      .populate('branch', 'name code')
      .populate('allocation')
      .populate('processedBy', 'name');
    if (!payment) return next(createError('Payment not found', 404));
    res.json({ success: true, data: payment });
  } catch (err) { next(err); }
};

exports.createPayment = async (req, res, next) => {
  try {
    const payment = await Payment.create({ ...req.body, processedBy: req.user._id });
    await audit(req.user._id, 'CREATE_PAYMENT', 'Payment', payment._id, { amount: payment.amount }, req);
    sendResponse(res, 201, payment, 'Payment recorded');
  } catch (err) { next(err); }
};

exports.processPayment = async (req, res, next) => {
  try {
    const { paymentMethod, transactionId, remarks } = req.body;
    const payment = await Payment.findById(req.params.id);
    if (!payment) return next(createError('Payment not found', 404));
    if (payment.status === 'Paid') return next(createError('Payment already processed', 400));

    payment.status = 'Paid';
    payment.paidDate = new Date();
    payment.paymentMethod = paymentMethod || 'Cash';
    payment.transactionId = transactionId;
    payment.remarks = remarks;
    payment.processedBy = req.user._id;
    await payment.save();

    await audit(req.user._id, 'PROCESS_PAYMENT', 'Payment', payment._id, { amount: payment.amount }, req);
    sendResponse(res, 200, payment, 'Payment processed successfully');
  } catch (err) { next(err); }
};

exports.getPaymentSummary = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role !== 'SUPER_ADMIN') filter.branch = req.user.branch;

    const summary = await Payment.aggregate([
      { $match: filter },
      { $group: { _id: '$status', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);
    res.json({ success: true, data: summary });
  } catch (err) { next(err); }
};
