import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';

export const verifyToken = (req, res, next) => {
  console.log('=== VERIFY TOKEN DEBUG ===');
  console.log('Request cookies:', req.cookies);
  console.log('Request headers:', req.headers);
  console.log('Access token from cookies:', req.cookies.access_token);
  console.log('Authorization header:', req.headers.authorization);
  console.log('Request URL:', req.originalUrl);
  console.log('Request method:', req.method);
  
  let accessToken = req.cookies.access_token;

  // Fallback: check Authorization header if no cookie
  if (!accessToken && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.substring(7);
      console.log('Using token from Authorization header');
    } else {
      console.log('Authorization header does not start with "Bearer "');
    }
  }

  if (!accessToken) {
    console.log('No access token found in cookies or Authorization header');
    return next(errorHandler(401, 'Unauthorized - No token provided'));
  }

  // Validate token structure
  const tokenParts = accessToken.split('.');
  if (tokenParts.length !== 3) {
    console.log('Invalid token structure - not a valid JWT');
    return next(errorHandler(401, 'Unauthorized - Invalid token format'));
  }

  jwt.verify(accessToken, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('JWT verification failed:', err.message);
      if (err.name === 'TokenExpiredError') {
        return next(errorHandler(401, 'Unauthorized - Token expired'));
      } else if (err.name === 'JsonWebTokenError') {
        return next(errorHandler(401, 'Unauthorized - Invalid token'));
      } else {
        return next(errorHandler(403, 'Forbidden - Token verification failed'));
      }
    }

    console.log('JWT verification successful, user:', user);
    
    // Validate user object
    if (!user || !user.id) {
      console.log('Invalid user object in token');
      return next(errorHandler(401, 'Unauthorized - Invalid user data'));
    }
    
    // Only allow main website users (no back office token mixing)
    user.tokenType = 'access';
    req.user = user;
    next();
  });
};
