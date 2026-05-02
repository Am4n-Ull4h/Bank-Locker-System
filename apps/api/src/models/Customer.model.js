const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerCode: { type: String, unique: true, trim: true },
  cnic: { type: String, required: true, unique: true, trim: true },
  dateOfBirth: Date,
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'Pakistan' },
  },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  occupation: String,
  nominee: {
    name: String,
    cnic: String,
    relation: String,
    phone: String,
  },
  kycStatus: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected'],
    default: 'Pending',
  },
  kycVerifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  kycVerifiedAt: Date,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

customerSchema.pre('save', async function (next) {
  if (!this.customerCode) {
    const count = await mongoose.model('Customer').countDocuments();
    this.customerCode = `CUST${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Customer', customerSchema);
