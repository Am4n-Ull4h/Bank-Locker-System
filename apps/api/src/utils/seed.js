require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User.model');
const Branch = require('../models/Branch.model');
const Locker = require('../models/Locker.model');
const Customer = require('../models/Customer.model');
const LockerAllocation = require('../models/LockerAllocation.model');
const Payment = require('../models/Payment.model');
const Request = require('../models/Request.model');
const AccessLog = require('../models/AccessLog.model');
const Document = require('../models/Document.model');

async function seed() {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Branch.deleteMany({}),
    Locker.deleteMany({}),
    Customer.deleteMany({}),
    LockerAllocation.deleteMany({}),
    Payment.deleteMany({}),
    Request.deleteMany({}),
    AccessLog.deleteMany({}),
    Document.deleteMany({}),
  ]);

  const branch = await Branch.create({
    name: 'Main Branch',
    code: 'MB001',
    address: { city: 'Karachi', country: 'Pakistan' },
    phone: '021-1111111',
    email: 'main@banklocker.local',
  });

  const superAdmin = await User.create({
    name: 'Super Admin',
    email: 'admin@banklocker.local',
    password: 'Admin@123',
    role: 'SUPER_ADMIN',
    isActive: true,
  });

  const manager = await User.create({
    name: 'Branch Manager',
    email: 'manager@banklocker.local',
    password: 'Admin@123',
    role: 'BRANCH_MANAGER',
    branch: branch._id,
    isActive: true,
  });

  const officer = await User.create({
    name: 'Locker Officer',
    email: 'officer@banklocker.local',
    password: 'Admin@123',
    role: 'LOCKER_OFFICER',
    branch: branch._id,
    isActive: true,
  });

  const customer = await User.create({
    name: 'Test Customer',
    email: 'customer@banklocker.local',
    password: 'Admin@123',
    role: 'CUSTOMER',
    branch: branch._id,
    isActive: true,
  });

  await Branch.findByIdAndUpdate(branch._id, { manager: manager._id });

  const lockers = [
    { lockerNumber: 'S-001', category: 'Small',   annualRent: 12000, securityDeposit: 10000, status: 'Available' },
    { lockerNumber: 'S-002', category: 'Small',   annualRent: 12000, securityDeposit: 10000, status: 'Available' },
    { lockerNumber: 'M-001', category: 'Medium',  annualRent: 18000, securityDeposit: 15000, status: 'Available' },
    { lockerNumber: 'M-002', category: 'Medium',  annualRent: 18000, securityDeposit: 15000, status: 'Available' },
    { lockerNumber: 'L-001', category: 'Large',   annualRent: 26000, securityDeposit: 20000, status: 'Maintenance' },
    { lockerNumber: 'P-001', category: 'Premium', annualRent: 40000, securityDeposit: 35000, status: 'Allocated' },
  ].map((locker) => ({ ...locker, branch: branch._id }));

  const createdLockers = await Locker.insertMany(lockers);

  const customerProfile = await Customer.create({
    user: customer._id,
    cnic: '42101-1234567-8',
    branch: branch._id,
    address: { city: 'Karachi', country: 'Pakistan' },
    nominee: {
      name: 'Nominee Name',
      cnic: '42101-9876543-2',
      relation: 'Brother',
      phone: '03001234567',
    },
    kycStatus: 'Verified',
    kycVerifiedBy: manager._id,
    kycVerifiedAt: new Date(),
  });

  const allocatedLocker = createdLockers.find((locker) => locker.lockerNumber === 'P-001');

  const allocation = await LockerAllocation.create({
    locker: allocatedLocker._id,
    customer: customerProfile._id,
    branch: branch._id,
    allocatedBy: officer._id,
    startDate: new Date(),
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    rentAmount: 40000,
    depositAmount: 35000,
    status: 'Active',
  });

  await Payment.create([
    {
      allocation: allocation._id,
      customer: customerProfile._id,
      branch: branch._id,
      locker: allocatedLocker._id,
      paymentType: 'Security Deposit',
      amount: 35000,
      status: 'Paid',
      paidDate: new Date(),
      paymentMethod: 'Cash',
      processedBy: officer._id,
    },
    {
      allocation: allocation._id,
      customer: customerProfile._id,
      branch: branch._id,
      locker: allocatedLocker._id,
      paymentType: 'Annual Rent',
      amount: 40000,
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      status: 'Pending',
      periodFrom: new Date(),
      periodTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      processedBy: officer._id,
    },
  ]);

  await Request.create({
    customer: customerProfile._id,
    branch: branch._id,
    locker: allocatedLocker._id,
    requestType: 'Access Appointment',
    subject: 'Need weekend locker access',
    description: 'Please arrange an access appointment for Saturday morning.',
    priority: 'Medium',
    status: 'Pending',
  });

  await AccessLog.create({
    locker: allocatedLocker._id,
    customer: customerProfile._id,
    branch: branch._id,
    approvedBy: officer._id,
    accessDate: new Date(),
    purpose: 'Document retrieval',
    status: 'Completed',
  });

  console.log('\n Seed completed successfully');
  console.log('Role           | Email                        | Password');
  console.log('SUPER_ADMIN    | admin@banklocker.local       | Admin@123');
  console.log('BRANCH_MANAGER | manager@banklocker.local     | Admin@123');
  console.log('LOCKER_OFFICER | officer@banklocker.local     | Admin@123');
  console.log('CUSTOMER       | customer@banklocker.local    | Admin@123');
  console.log('Demo Data      | 1 customer profile, allocation, payments, request, access log');

  await mongoose.connection.close();
}

seed().catch(async (err) => {
  console.error(err);
  await mongoose.connection.close();
  process.exit(1);
});
