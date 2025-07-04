import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';

export const verifyToken = (req, res, next) => {
  const accessToken = req.cookies.access_token;

  if (!accessToken) return next(errorHandler(401, 'Unauthorized'));

  jwt.verify(accessToken, process.env.JWT_SECRET, (err, user) => {
    if (err) return next(errorHandler(403, 'Forbidden'));

    // Only allow main website users (no back office token mixing)
    user.tokenType = 'access';
    req.user = user;
    next();
  });
};
