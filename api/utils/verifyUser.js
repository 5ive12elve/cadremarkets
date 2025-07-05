import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';

export const verifyToken = (req, res, next) => {
  console.log('=== VERIFY TOKEN DEBUG ===');
  console.log('Request cookies:', req.cookies);
  console.log('Request headers:', req.headers);
  console.log('Access token:', req.cookies.access_token);
  
  const accessToken = req.cookies.access_token;

  if (!accessToken) {
    console.log('No access token found in cookies');
    return next(errorHandler(401, 'Unauthorized'));
  }

  jwt.verify(accessToken, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('JWT verification failed:', err.message);
      return next(errorHandler(403, 'Forbidden'));
    }

    console.log('JWT verification successful, user:', user);
    // Only allow main website users (no back office token mixing)
    user.tokenType = 'access';
    req.user = user;
    next();
  });
};
