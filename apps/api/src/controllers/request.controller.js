const Request = require('../models/Request.model');
const Customer = require('../models/Customer.model');
const User = require('../models/User.model');
const { createError, sendResponse, audit, applyDateRangeFilter, sendCSV } = require('../utils/helpers');

exports.getMyRequests = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ user: req.user._id });
    if (!customer) return next(createError('Customer profile not found', 404));

    const requests = await Request.find({ customer: customer._id })
      .populate('branch', 'name code')
      .populate('assignedTo', 'name')
      .sort('-createdAt');

    sendResponse(res, 200, requests);
  } catch (err) { next(err); }
};

exports.createMyRequest = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ user: req.user._id });
    if (!customer) return next(createError('Customer profile not found', 404));

    const payload = {
      ...req.body,
      customer: customer._id,
      branch: customer.branch,
      status: 'Pending',
    };

    const request = await Request.create(payload);
    await audit(req.user._id, 'CREATE_REQUEST', 'Request', request._id, { requestType: request.requestType }, req);
    sendResponse(res, 201, request, 'Request submitted successfully');
  } catch (err) { next(err); }
};

exports.getRequests = async (req, res, next) => {
  try {
    const {
      status,
      requestType,
      priority,
      branch,
      customer,
      search,
      createdFrom,
      createdTo,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (requestType) filter.requestType = requestType;
    if (priority) filter.priority = priority;
    if (customer) filter.customer = customer;
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
      filter.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { customer: { $in: customers.map((c) => c._id) } },
      ];
    }

    applyDateRangeFilter(filter, 'createdAt', createdFrom, createdTo);

    const allowedSort = ['createdAt', 'status', 'priority', 'requestType'];
    const safeSortBy = allowedSort.includes(sortBy) ? sortBy : 'createdAt';
    const safeSortOrder = sortOrder === 'asc' ? 1 : -1;

    const total = await Request.countDocuments(filter);
    const requests = await Request.find(filter)
      .populate({ path: 'customer', populate: { path: 'user', select: 'name email' } })
      .populate('branch', 'name code')
      .populate('assignedTo', 'name')
      .sort({ [safeSortBy]: safeSortOrder })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, data: requests, meta: { total, page: +page, limit: +limit, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

exports.exportRequests = async (req, res, next) => {
  try {
    const { status, requestType, priority, branch, customer, search, createdFrom, createdTo } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (requestType) filter.requestType = requestType;
    if (priority) filter.priority = priority;
    if (customer) filter.customer = customer;
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
      filter.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { customer: { $in: customers.map((c) => c._id) } },
      ];
    }

    applyDateRangeFilter(filter, 'createdAt', createdFrom, createdTo);

    const requests = await Request.find(filter)
      .populate({ path: 'customer', populate: { path: 'user', select: 'name email' } })
      .populate('branch', 'name code')
      .sort('-createdAt');

    const rows = requests.map((request) => ({
      Customer: request.customer?.user?.name || '',
      CustomerEmail: request.customer?.user?.email || '',
      Branch: request.branch?.name || '',
      RequestType: request.requestType,
      Subject: request.subject,
      Status: request.status,
      Priority: request.priority,
      CreatedAt: request.createdAt ? new Date(request.createdAt).toISOString() : '',
      ResolvedAt: request.resolvedAt ? new Date(request.resolvedAt).toISOString() : '',
    }));

    return sendCSV(res, rows, `requests-export-${Date.now()}.csv`);
  } catch (err) {
    next(err);
  }
};

exports.getRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate({ path: 'customer', populate: { path: 'user', select: 'name email phone' } })
      .populate('branch', 'name code')
      .populate('assignedTo', 'name')
      .populate('resolvedBy', 'name')
      .populate('comments.user', 'name role');
    if (!request) return next(createError('Request not found', 404));
    res.json({ success: true, data: request });
  } catch (err) { next(err); }
};

exports.createRequest = async (req, res, next) => {
  try {
    const request = await Request.create(req.body);
    await audit(req.user._id, 'CREATE_REQUEST', 'Request', request._id, { requestType: request.requestType }, req);
    sendResponse(res, 201, request, 'Request submitted successfully');
  } catch (err) { next(err); }
};

exports.updateRequest = async (req, res, next) => {
  try {
    const request = await Request.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!request) return next(createError('Request not found', 404));
    await audit(req.user._id, 'UPDATE_REQUEST', 'Request', request._id, { status: req.body.status }, req);
    sendResponse(res, 200, request);
  } catch (err) { next(err); }
};

exports.resolveRequest = async (req, res, next) => {
  try {
    const { status, resolutionNotes } = req.body;
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status, resolutionNotes, resolvedBy: req.user._id, resolvedAt: new Date() },
      { new: true }
    );
    if (!request) return next(createError('Request not found', 404));
    await audit(req.user._id, 'RESOLVE_REQUEST', 'Request', request._id, { status }, req);
    sendResponse(res, 200, request, 'Request resolved');
  } catch (err) { next(err); }
};

exports.addComment = async (req, res, next) => {
  try {
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: { user: req.user._id, text: req.body.text } } },
      { new: true }
    ).populate('comments.user', 'name role');
    if (!request) return next(createError('Request not found', 404));
    sendResponse(res, 200, request);
  } catch (err) { next(err); }
};
