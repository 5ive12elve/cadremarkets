import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const backOfficeUserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'moderator', 'support'],
      default: 'support'
    },
    permissions: [{
      type: String,
      enum: [
        'manage_users',
        'manage_listings',
        'manage_orders',
        'manage_services',
        'manage_support'
      ]
    }],
    lastLogin: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
backOfficeUserSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcryptjs.hash(this.password, 10);
  }
  next();
});

const BackOfficeUser = mongoose.model('BackOfficeUser', backOfficeUserSchema);

export default BackOfficeUser; 