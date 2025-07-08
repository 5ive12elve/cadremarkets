import mongoose from 'mongoose';

const healthCheck = async () => {
  try {
    // Test MongoDB connection
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'Connected' : 'Disconnected';
    
    // Test environment variables
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      MONGO: process.env.MONGO ? 'Set' : 'Missing',
      JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Missing',
      CLIENT_URL: process.env.CLIENT_URL ? 'Set' : 'Missing',
      ADMIN_USERNAME: process.env.ADMIN_USERNAME ? 'Set' : 'Missing',
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ? 'Set' : 'Missing'
    };
    
    // Test Firebase Admin SDK
    let firebaseStatus = 'Not configured';
    try {
      if (process.env.FIREBASE_PROJECT_ID) {
        firebaseStatus = 'Configured';
      }
    } catch (error) {
      firebaseStatus = 'Error: ' + error.message;
    }
    
    console.log('Health Check Results:');
    console.log('- MongoDB:', dbStatus);
    console.log('- Firebase Admin:', firebaseStatus);
    console.log('- Environment Variables:', envVars);
    
    return {
      status: 'healthy',
      database: dbStatus,
      firebase: firebaseStatus,
      environment: envVars,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Health check failed:', error);
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

export default healthCheck; 