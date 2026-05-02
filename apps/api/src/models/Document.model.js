const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'ownerModel' },
  ownerModel: { type: String, required: true, enum: ['Customer', 'LockerAllocation'] },
  documentType: {
    type: String,
    enum: ['CNIC', 'Passport', 'Agreement', 'Photo', 'Other'],
    required: true,
  },
  fileName: String,
  fileUrl: String,
  publicId: String,
  fileSize: Number,
  mimeType: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isVerified: { type: Boolean, default: false },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
