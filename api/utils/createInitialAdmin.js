import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import BackOfficeUser from '../models/backOfficeUser.model.js';

dotenv.config();

const createInitialAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO);
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const adminExists = await BackOfficeUser.findOne({ role: 'admin' });
        if (adminExists) {
            console.log('Admin user already exists');
            await mongoose.connection.close();
            return;
        }

        // Create admin user
        const adminUser = new BackOfficeUser({
            username: 'admin',
            email: 'admin@cadremarkets.com',
            password: await bcryptjs.hash('admin123', 10), // You should change this password
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
        console.log('Username: admin');
        console.log('Password: admin123');
        console.log('Please change the password after first login');

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
};

// Run the function
createInitialAdmin(); 