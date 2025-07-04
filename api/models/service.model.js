import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  requestId: {
    type: String,
    required: [true, 'Request ID is required'],
    unique: true,
    trim: true
  },
  requesterName: {
    type: String,
    required: [true, 'Requester name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^[\+]?[1-9][\d]{0,15}$/.test(v);
      },
      message: 'Please provide a valid phone number'
    }
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please provide a valid email address'
    }
  },
  serviceType: {
    type: String,
    required: [true, 'Service type is required'],
    enum: {
      values: ['visual', 'ad', 'sound'],
      message: 'Service type must be one of: visual, ad, sound'
    }
  },
  subType: {
    type: String,
    required: [true, 'Sub type is required'],
    trim: true,
    maxlength: [100, 'Sub type cannot exceed 100 characters']
  },
  budget: {
    type: String,
    required: [true, 'Budget is required'],
    trim: true
  },
  designStage: {
    type: String,
    required: [true, 'Design stage is required'],
    trim: true
  },
  projectScope: {
    type: String,
    required: [true, 'Project scope is required'],
    trim: true
  },
  details: {
    type: String,
    trim: true,
    maxlength: [1000, 'Details cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'approved', 'rejected', 'completed'],
      message: 'Status must be one of: pending, approved, rejected, completed'
    },
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
serviceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Service', serviceSchema); 