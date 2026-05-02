const mongoose = require('mongoose');

const accessLogSchema = new mongoose.Schema({
  locker: { type: mongoose.Schema.Types.ObjectId, ref: 'Locker', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accessDate: { type: Date, default: Date.now },
  purpose: String,
  remarks: String,
  otpVerified: { type: Boolean, default: false },
  duration: Number, // minutes
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Denied', 'Completed'],
    default: 'Approved',
  },
}, { timestamps: true });

module.exports = mongoose.model('AccessLog', accessLogSchema);
