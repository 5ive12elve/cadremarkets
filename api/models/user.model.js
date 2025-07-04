import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
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
    avatar: {
      type: String,
      default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'moderator'],
      default: 'user'
    },
    status: {
      type: String,
      enum: ['active', 'banned'],
      default: 'active'
    },
    emailPreferences: {
      marketing: { type: Boolean, default: true },
      notifications: { type: Boolean, default: true }
    },
    notificationSettings: {
      orderUpdates: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
      promotions: { type: Boolean, default: true }
    },
    lastActive: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
