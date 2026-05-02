const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  locker: { type: mongoose.Schema.Types.ObjectId, ref: 'Locker' },
  requestType: {
    type: String,
    enum: ['New Locker', 'Locker Closure', 'Nominee Update', 'Access Appointment', 'Complaint', 'Support'],
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'In Review', 'Approved', 'Rejected', 'Resolved'],
    default: 'Pending',
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium',
  },
  subject: { type: String, required: true },
  description: String,
  preferredDate: Date,
  attachments: [String],
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: Date,
  resolutionNotes: String,
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);
