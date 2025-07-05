import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';

export const verifyToken = (req, res, next) => {
  console.log('=== VERIFY TOKEN DEBUG ===');
  console.log('Request cookies:', req.cookies);
  console.log('Request headers:', req.headers);
  console.log('Access token from cookies:', req.cookies.access_token);
  console.log('Authorization header:', req.headers.authorization);
  
  let accessToken = req.cookies.access_token;

  // Fallback: check Authorization header if no cookie
  if (!accessToken && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.substring(7);
      console.log('Using token from Authorization header');
    }
  }

  if (!accessToken) {
    console.log('No access token found in cookies or Authorization header');
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
