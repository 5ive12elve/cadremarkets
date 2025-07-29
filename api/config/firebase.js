import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// In production, you should use environment variables for the service account
const initializeFirebaseAdmin = () => {
  try {
    // Check if Firebase Admin is already initialized
    if (admin.apps.length > 0) {
      return admin.apps[0];
    }

    // Check if we have the required Firebase credentials
    const hasFirebaseCredentials = process.env.FIREBASE_PRIVATE_KEY && 
                                 process.env.FIREBASE_CLIENT_EMAIL && 
                                 process.env.FIREBASE_PROJECT_ID;

    if (!hasFirebaseCredentials) {
      console.log('⚠️  Firebase credentials not found. Firebase Admin SDK will not be initialized.');
      console.log('   This is normal for local development without Firebase setup.');
      console.log('   For production, ensure FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, and FIREBASE_PROJECT_ID are set.');
      return null;
    }

    // For development, you can use a service account key file
    // For production, use environment variables or service account key
    const serviceAccount = {
      type: process.env.FIREBASE_TYPE || "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID || "cadremarkets-fce26",
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY ? 
        process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
      token_uri: process.env.FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || 
        "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
    };

    // Initialize the app
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || "cadremarkets-fce26"
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
    return app;
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin SDK:', error);
    console.log('⚠️  Continuing without Firebase Admin SDK...');
    return null;
  }
};

// Verify Firebase ID token
export const verifyFirebaseToken = async (idToken) => {
  try {
    // Check if Firebase Admin is available
    if (!admin.apps.length) {
      console.log('⚠️  Firebase Admin SDK not initialized. Skipping token verification.');
      return {
        success: false,
        error: 'Firebase Admin SDK not available'
      };
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return {
      success: true,
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
      email_verified: decodedToken.email_verified
    };
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Initialize Firebase Admin
initializeFirebaseAdmin();

export default admin; 