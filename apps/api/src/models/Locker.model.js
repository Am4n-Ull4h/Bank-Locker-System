const mongoose = require('mongoose');

const lockerSchema = new mongoose.Schema({
  lockerNumber: { type: String, required: true, trim: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  category: {
    type: String,
    enum: ['Small', 'Medium', 'Large', 'Premium'],
    required: true,
  },
  status: {
    type: String,
    enum: ['Available', 'Allocated', 'Frozen', 'Maintenance', 'Closed'],
    default: 'Available',
  },
  annualRent: { type: Number, required: true },
  securityDeposit: { type: Number, required: true },
  dimensions: { width: Number, height: Number, depth: Number },
  lockerRoom: String,
  floor: String,
  description: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

lockerSchema.index({ branch: 1, lockerNumber: 1 }, { unique: true });

module.exports = mongoose.model('Locker', lockerSchema);
