import mongoose from 'mongoose';

const supportRequestSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['support', 'contact'],
    default: 'support'
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: ''
  },
  // Support request specific fields
  orderNumber: String,
  category: String,
  specificIssue: String,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  // Common fields
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['new', 'in-progress', 'resolved', 'closed'],
    default: 'new'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  reason: String, // For contact form submissions
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

supportRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const SupportRequest = mongoose.model('SupportRequest', supportRequestSchema);

export default SupportRequest; 