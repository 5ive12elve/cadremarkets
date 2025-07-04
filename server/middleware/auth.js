import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const token = req.cookies.backoffice_token;

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

export const isBackOfficeUser = (req, res, next) => {
  if (!req.cookies.backoffice_token) {
    return res.status(401).json({ message: 'Access denied. Not a back office user.' });
  }
  next();
}; 