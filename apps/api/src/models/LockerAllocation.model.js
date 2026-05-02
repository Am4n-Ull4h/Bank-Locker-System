const mongoose = require('mongoose');

const lockerAllocationSchema = new mongoose.Schema({
  locker: { type: mongoose.Schema.Types.ObjectId, ref: 'Locker', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  allocatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true },
  rentAmount: { type: Number, required: true },
  depositAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Terminated', 'Surrendered'],
    default: 'Active',
  },
  agreementDocument: String,
  terminationReason: String,
  terminatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  terminatedAt: Date,
  renewalCount: { type: Number, default: 0 },
  notes: String,
}, { timestamps: true });

module.exports = mongoose.model('LockerAllocation', lockerAllocationSchema);
