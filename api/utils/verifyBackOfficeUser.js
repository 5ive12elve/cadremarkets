import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';
import BackOfficeUser from '../models/backOfficeUser.model.js';

export const verifyBackOfficeToken = async (req, res, next) => {
  const token = req.cookies.backoffice_token;
  
  if (!token) return next(errorHandler(401, 'Unauthorized'));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user still exists and is active
    const user = await BackOfficeUser.findById(decoded.id);
    if (!user) return next(errorHandler(401, 'User no longer exists'));

    // Add token type and ensure we have the latest user data
    decoded.tokenType = 'backoffice';
    decoded.role = user.role;
    decoded.permissions = user.permissions;
    
    req.user = decoded;
    next();
  } catch (error) {
    return next(errorHandler(403, 'Invalid token'));
  }
}; 