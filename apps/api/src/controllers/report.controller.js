const Locker = require('../models/Locker.model');
const LockerAllocation = require('../models/LockerAllocation.model');
const Payment = require('../models/Payment.model');
const Customer = require('../models/Customer.model');
const Branch = require('../models/Branch.model');
const { sendResponse } = require('../utils/helpers');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const branchFilter = req.user.role !== 'SUPER_ADMIN' ? { branch: req.user.branch } : {};
    const lockerFilter = branchFilter;

    const [
      totalLockers, availableLockers, allocatedLockers,
      totalCustomers, pendingPayments, overduePayments,
      monthlyRevenue, totalBranches, pendingRequests,
    ] = await Promise.all([
      Locker.countDocuments(lockerFilter),
      Locker.countDocuments({ ...lockerFilter, status: 'Available' }),
      Locker.countDocuments({ ...lockerFilter, status: 'Allocated' }),
      Customer.countDocuments(branchFilter),
      Payment.countDocuments({ ...branchFilter, status: 'Pending' }),
      Payment.countDocuments({ ...branchFilter, status: 'Overdue' }),
      Payment.aggregate([
        { $match: { ...branchFilter, status: 'Paid', paidDate: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      req.user.role === 'SUPER_ADMIN' ? Branch.countDocuments({ isActive: true }) : 1,
      require('../models/Request.model').countDocuments({ ...branchFilter, status: 'Pending' }),
    ]);

    // Expiring in next 30 days
    const expiringSoon = await LockerAllocation.countDocuments({
      ...branchFilter,
      status: 'Active',
      expiryDate: { $gte: new Date(), $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    });

    sendResponse(res, 200, {
      totalLockers,
      availableLockers,
      allocatedLockers,
      totalCustomers,
      pendingPayments,
      overduePayments,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      totalBranches,
      pendingRequests,
      expiringSoon,
    });
  } catch (err) { next(err); }
};

exports.getRevenueReport = async (req, res, next) => {
  try {
    const { year = new Date().getFullYear(), branch } = req.query;
    const filter = { status: 'Paid', paidDate: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) } };
    if (branch) filter.branch = branch;
    else if (req.user.role !== 'SUPER_ADMIN') filter.branch = req.user.branch;

    const revenue = await Payment.aggregate([
      { $match: filter },
      { $group: { _id: { month: { $month: '$paidDate' }, paymentType: '$paymentType' }, total: { $sum: '$amount' } } },
      { $sort: { '_id.month': 1 } },
    ]);

    sendResponse(res, 200, revenue);
  } catch (err) { next(err); }
};

exports.getBranchReport = async (req, res, next) => {
  try {
    const branchStats = await Branch.aggregate([
      { $match: { isActive: true } },
      { $lookup: { from: 'lockers', localField: '_id', foreignField: 'branch', as: 'lockers' } },
      { $lookup: { from: 'customers', localField: '_id', foreignField: 'branch', as: 'customers' } },
      {
        $project: {
          name: 1, code: 1,
          totalLockers: { $size: '$lockers' },
          availableLockers: {
            $size: { $filter: { input: '$lockers', cond: { $eq: ['$$this.status', 'Available'] } } },
          },
          allocatedLockers: {
            $size: { $filter: { input: '$lockers', cond: { $eq: ['$$this.status', 'Allocated'] } } },
          },
          totalCustomers: { $size: '$customers' },
        },
      },
    ]);
    sendResponse(res, 200, branchStats);
  } catch (err) { next(err); }
};

exports.getExpiringLockers = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const filter = {
      status: 'Active',
      expiryDate: { $gte: new Date(), $lte: new Date(Date.now() + days * 24 * 60 * 60 * 1000) },
    };
    if (req.user.role !== 'SUPER_ADMIN') filter.branch = req.user.branch;

    const allocations = await LockerAllocation.find(filter)
      .populate('locker', 'lockerNumber category')
      .populate({ path: 'customer', populate: { path: 'user', select: 'name email phone' } })
      .populate('branch', 'name code')
      .sort('expiryDate');
    sendResponse(res, 200, allocations);
  } catch (err) { next(err); }
};
