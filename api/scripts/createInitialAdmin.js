import mongoose from 'mongoose';
import BackOfficeUser from '../models/backOfficeUser.model.js';

const MONGO_URI = "mongodb+srv://sam:sam@cadremarkets.tqx98.mongodb.net/?retryWrites=true&w=majority&appName=cadremarkets"

const createInitialAdmin = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await BackOfficeUser.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const adminUser = new BackOfficeUser({
      username: 'admin',
      email: 'admin@cadremarkets.com',
      password: 'admin123', // This will be hashed automatically by the model
      role: 'admin',
      permissions: [
        'manage_users',
        'manage_listings',
        'manage_orders',
        'manage_services',
        'manage_support'
      ]
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    console.log('You can now login with:');
    console.log('Username: admin');
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createInitialAdmin(); 