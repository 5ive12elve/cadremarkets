#!/usr/bin/env node

/**
 * 🚀 RENDER DEPLOYMENT DIAGNOSTICS
 * 
 * This script helps diagnose and fix Render deployment issues
 * Run this to check your configuration and get step-by-step fixes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 CADRE MARKETS RENDER DIAGNOSTICS');
console.log('=====================================\n');

// Check 1: Verify file structure
console.log('📁 CHECKING FILE STRUCTURE...');
const requiredFiles = [
  'api/index.js',
  'api/package.json',
  'render.yaml',
  'api/config/firebase.js'
];

let structureOk = true;
for (const file of requiredFiles) {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`${exists ? '✅' : '❌'} ${file} ${exists ? 'exists' : 'MISSING'}`);
  if (!exists) structureOk = false;
}

console.log('');

// Check 2: Verify package.json scripts
console.log('📦 CHECKING PACKAGE.JSON SCRIPTS...');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'api/package.json'), 'utf8'));
  const scripts = packageJson.scripts;
  
  console.log(`✅ Start script: ${scripts.start || 'MISSING'}`);
  console.log(`✅ Dev script: ${scripts.dev || 'MISSING'}`);
  console.log(`✅ Main entry: ${packageJson.main || 'MISSING'}`);
  
  if (!scripts.start) {
    console.log('❌ No start script found! Add: "start": "NODE_ENV=production node index.js"');
  }
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
}

console.log('');

// Check 3: Verify render.yaml configuration
console.log('⚙️ CHECKING RENDER.YAML CONFIGURATION...');
try {
  const renderYaml = fs.readFileSync(path.join(__dirname, 'render.yaml'), 'utf8');
  
  const checks = [
    { name: 'Build Command', pattern: /buildCommand:\s*npm install/ },
    { name: 'Start Command', pattern: /startCommand:\s*npm start/ },
    { name: 'Root Directory', pattern: /rootDir:\s*api/ },
    { name: 'Health Check', pattern: /healthCheckPath:\s*\/api\/health/ },
    { name: 'Environment Variables', pattern: /NODE_ENV:\s*production/ }
  ];
  
  for (const check of checks) {
    const found = check.pattern.test(renderYaml);
    console.log(`${found ? '✅' : '❌'} ${check.name}: ${found ? 'Found' : 'MISSING'}`);
  }
} catch (error) {
  console.log('❌ Error reading render.yaml:', error.message);
}

console.log('');

// Check 4: Environment Variables Checklist
console.log('🔐 ENVIRONMENT VARIABLES CHECKLIST');
console.log('Make sure these are set in your Render dashboard:');
console.log('');
console.log('Required Variables:');
console.log('✅ NODE_ENV=production');
console.log('✅ PORT=3000');
console.log('✅ MONGO=<your-mongodb-connection-string>');
console.log('✅ JWT_SECRET=<your-secure-jwt-secret>');
console.log('✅ CLIENT_URL=https://www.cadremarkets.com');
console.log('✅ ADMIN_USERNAME=<your-admin-username>');
console.log('✅ ADMIN_PASSWORD=<your-admin-password>');
console.log('');
console.log('Firebase Variables (for OAuth):');
console.log('✅ FIREBASE_TYPE=service_account');
console.log('✅ FIREBASE_PROJECT_ID=cadremarkets-fce26');
console.log('✅ FIREBASE_PRIVATE_KEY_ID=<from-firebase-console>');
console.log('✅ FIREBASE_PRIVATE_KEY=<from-firebase-console>');
console.log('✅ FIREBASE_CLIENT_EMAIL=<from-firebase-console>');
console.log('✅ FIREBASE_CLIENT_ID=<from-firebase-console>');
console.log('✅ FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth');
console.log('✅ FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token');
console.log('✅ FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs');
console.log('✅ FIREBASE_CLIENT_X509_CERT_URL=<from-firebase-console>');

console.log('');

// Check 5: Manual Testing Steps
console.log('🧪 MANUAL TESTING STEPS');
console.log('');
console.log('1. Check Render Dashboard:');
console.log('   - Go to https://dashboard.render.com');
console.log('   - Find your "cadremarkets-api" service');
console.log('   - Check if status is "Live" (green)');
console.log('   - If not, click "Manual Deploy"');
console.log('');
console.log('2. Check Render Logs:');
console.log('   - Click on your service');
console.log('   - Go to "Logs" tab');
console.log('   - Look for errors like:');
console.log('     • "Application Error"');
console.log('     • "Failed to start"');
console.log('     • "MongoDB connection error"');
console.log('     • "dotenv: ENOENT"');
console.log('');
console.log('3. Test API Endpoints:');
console.log('   - Root: https://api.cadremarkets.com/');
console.log('   - Health: https://api.cadremarkets.com/api/health');
console.log('   - Test: https://api.cadremarkets.com/api/test');
console.log('');
console.log('4. If endpoints return 404:');
console.log('   - Your server isn\'t starting');
console.log('   - Check environment variables');
console.log('   - Check MongoDB connection');
console.log('   - Check for syntax errors in code');

console.log('');

// Check 6: Common Issues and Solutions
console.log('🔧 COMMON ISSUES & SOLUTIONS');
console.log('');
console.log('❌ Issue: "Application Error" in logs');
console.log('✅ Solution: Check environment variables, especially MONGO and JWT_SECRET');
console.log('');
console.log('❌ Issue: "Failed to connect to MongoDB"');
console.log('✅ Solution: Verify MONGO connection string and network access');
console.log('');
console.log('❌ Issue: "dotenv: ENOENT"');
console.log('✅ Solution: Set environment variables in Render dashboard (not .env file)');
console.log('');
console.log('❌ Issue: "Port already in use"');
console.log('✅ Solution: Make sure PORT=3000 in environment variables');
console.log('');
console.log('❌ Issue: "Module not found"');
console.log('✅ Solution: Check package.json dependencies and run npm install');
console.log('');
console.log('❌ Issue: "Syntax Error"');
console.log('✅ Solution: Check for JavaScript syntax errors in your code');

console.log('');

// Check 7: Deployment Commands
console.log('🚀 DEPLOYMENT COMMANDS');
console.log('');
console.log('If you need to redeploy:');
console.log('1. Go to Render Dashboard');
console.log('2. Select your service');
console.log('3. Click "Manual Deploy"');
console.log('4. Wait for build to complete');
console.log('5. Check logs for any errors');

console.log('');

// Check 8: Health Check Script
console.log('💚 HEALTH CHECK SCRIPT');
console.log('');
console.log('Create this file: api/health-check.js');
console.log(`
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
      JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Missing'
    };
    
    console.log('Health Check Results:');
    console.log('- MongoDB:', dbStatus);
    console.log('- Environment Variables:', envVars);
    
    return {
      status: 'healthy',
      database: dbStatus,
      environment: envVars
    };
  } catch (error) {
    console.error('Health check failed:', error);
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
};

export default healthCheck;
`);

console.log('');

console.log('🎯 NEXT STEPS:');
console.log('1. Check your Render dashboard for service status');
console.log('2. Review the logs for specific error messages');
console.log('3. Verify all environment variables are set');
console.log('4. Test the API endpoints manually');
console.log('5. If still having issues, share the specific error from Render logs');

console.log('');
console.log('📞 Need Help?');
console.log('- Check Render documentation: https://render.com/docs');
console.log('- Review your application logs in Render dashboard');
console.log('- Verify your MongoDB Atlas connection and network access');

console.log('');
console.log('✅ Diagnostics complete! Follow the steps above to fix your deployment.'); 