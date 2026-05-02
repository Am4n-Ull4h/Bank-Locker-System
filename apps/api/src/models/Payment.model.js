const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  allocation: { type: mongoose.Schema.Types.ObjectId, ref: 'LockerAllocation', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  locker: { type: mongoose.Schema.Types.ObjectId, ref: 'Locker', required: true },
  paymentType: {
    type: String,
    enum: ['Annual Rent', 'Security Deposit', 'Late Fee', 'Refund'],
    required: true,
  },
  amount: { type: Number, required: true },
  dueDate: Date,
  paidDate: Date,
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'Cheque', 'Online'],
    default: 'Cash',
  },
  status: {
    type: String,
    enum: ['Paid', 'Pending', 'Overdue', 'Refunded'],
    default: 'Pending',
  },
  receiptNumber: { type: String, unique: true, sparse: true },
  transactionId: String,
  remarks: String,
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  periodFrom: Date,
  periodTo: Date,
}, { timestamps: true });

paymentSchema.pre('save', async function (next) {
  if (!this.receiptNumber && this.status === 'Paid') {
    const count = await mongoose.model('Payment').countDocuments({ status: 'Paid' });
    this.receiptNumber = `RCP${Date.now()}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
