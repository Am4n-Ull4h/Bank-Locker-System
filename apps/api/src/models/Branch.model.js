const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  address: {
    street: String,
    city: { type: String, required: true },
    state: String,
    zipCode: String,
    country: { type: String, default: 'Pakistan' },
  },
  phone: String,
  email: String,
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  lockerRooms: [{ name: String, floor: String, capacity: Number }],
  establishedDate: Date,
}, { timestamps: true });

module.exports = mongoose.model('Branch', branchSchema);
