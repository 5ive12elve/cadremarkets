import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('🔍 Testing MongoDB connection...');
console.log('Environment variables loaded:');
console.log('- MONGO URI exists:', !!process.env.MONGO);
console.log('- NODE_ENV:', process.env.NODE_ENV);

const mongoUri = process.env.MONGO;
if (!mongoUri) {
  console.error('❌ MONGO environment variable not found');
  process.exit(1);
}

console.log('📡 Attempting to connect to MongoDB...');
console.log('URI (masked):', mongoUri.replace(/(mongodb\+srv:\/\/)([^:]+):([^@]+)@/, '$1***:***@'));

// Set connection options with shorter timeouts for testing
const options = {
  serverSelectionTimeoutMS: 15000, // 15 seconds
  socketTimeoutMS: 45000,
  connectTimeoutMS: 15000,
  maxPoolSize: 10,
  retryWrites: true,
  w: 'majority'
};

mongoose.connect(mongoUri, options)
  .then(() => {
    console.log('✅ MongoDB connection successful!');
    console.log('📊 Connection details:');
    console.log('- Database:', mongoose.connection.db.databaseName);
    console.log('- Host:', mongoose.connection.host);
    console.log('- Port:', mongoose.connection.port);
    console.log('- Ready state:', mongoose.connection.readyState);
    
    // Close connection and exit
    mongoose.connection.close().then(() => {
      console.log('🔚 Connection closed successfully');
      process.exit(0);
    });
  })
  .catch((err) => {
    console.log('❌ MongoDB connection failed:');
    console.log('Error name:', err.name);
    console.log('Error message:', err.message);
    console.log('Error code:', err.code);
    
    if (err.message.includes('ENOTFOUND') || err.message.includes('ETIMEDOUT')) {
      console.log('\n💡 Possible solutions:');
      console.log('1. Check your internet connection');
      console.log('2. Verify MongoDB Atlas cluster is running');
      console.log('3. Check IP whitelist in MongoDB Atlas');
      console.log('4. Try connecting from a different network');
    }
    
    if (err.message.includes('authentication failed')) {
      console.log('\n💡 Authentication issue:');
      console.log('1. Check username and password in MongoDB Atlas');
      console.log('2. Verify database user permissions');
    }
    
    process.exit(1);
  });

// Handle connection events
mongoose.connection.on('connecting', () => {
  console.log('🔄 Connecting to MongoDB...');
});

mongoose.connection.on('connected', () => {
  console.log('🔗 Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.log('💥 MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 MongoDB disconnected');
}); 