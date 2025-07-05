import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;
  
  // Input validation
  if (!username || !email || !password) {
    return next(errorHandler(400, 'All fields are required'));
  }
  
  if (username.length < 3) {
    return next(errorHandler(400, 'Username must be at least 3 characters long'));
  }
  
  if (password.length < 6) {
    return next(errorHandler(400, 'Password must be at least 6 characters long'));
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(errorHandler(400, 'Please provide a valid email address'));
  }
  
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        return next(errorHandler(400, 'Email already exists'));
      }
      if (existingUser.username === username) {
        return next(errorHandler(400, 'Username already exists'));
      }
    }
    
  const hashedPassword = bcryptjs.hashSync(password, 10);
  const newUser = new User({ 
    username, 
    email, 
    password: hashedPassword,
    role: 'user' // Explicitly set role to user for new signups
  });
    
    await newUser.save();
    res.status(201).json({
      success: true,
      message: 'User created successfully'
    });
  } catch (error) {
      // Handle validation errors gracefully
      if (error.name === 'ValidationError') {
        return next(errorHandler(400, 'Validation failed'));
      }
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        return next(errorHandler(400, `${field} already exists`));
      }
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  
  console.log('=== SIGNIN DEBUG ===');
  console.log('Signin attempt for email:', email);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('Request host:', req.get('host'));
  console.log('Request origin:', req.get('origin'));
  
  // Input validation
  if (!email || !password) {
    return next(errorHandler(400, 'Email and password are required'));
  }
  
  try {
    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(404, 'User not found'));
    
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(401, 'Invalid credentials'));
    
    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);
    const { password: pass, ...rest } = validUser._doc;
    
    // Determine if we're in production based on host or NODE_ENV
    const isProduction = process.env.NODE_ENV === 'production' || 
                        req.get('host')?.includes('cadremarkets.com') ||
                        req.get('origin')?.includes('cadremarkets.com');
    
    // Define cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction, // Force secure in production
      sameSite: 'none',
      domain: isProduction ? '.cadremarkets.com' : undefined,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    };
    
    console.log('Setting cookie with token:', token.substring(0, 20) + '...');
    console.log('Cookie options:', cookieOptions);
    console.log('Is production?', isProduction);
    console.log('Host check:', req.get('host')?.includes('cadremarkets.com'));
    console.log('Origin check:', req.get('origin')?.includes('cadremarkets.com'));
    
    res
      .cookie('access_token', token, cookieOptions)
      .status(200)
      .json({
        success: true,
        user: rest
      });
      
    console.log('Signin successful, cookie set');
  } catch (error) {
    console.log('Signin error:', error);
    next(error);
  }
};

export const google = async (req, res, next) => {
  try {
    const { email, name, photo, tokenId } = req.body;
    
    // Input validation
    if (!tokenId) {
      return next(errorHandler(400, 'Google token is required'));
    }
    
    if (!email || !name) {
      return next(errorHandler(400, 'Invalid Google token'));
    }
    
    // Determine if we're in production based on host or NODE_ENV
    const isProduction = process.env.NODE_ENV === 'production' || 
                        req.get('host')?.includes('cadremarkets.com') ||
                        req.get('origin')?.includes('cadremarkets.com');
    
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction, // Force secure in production
      sameSite: 'none',
      domain: isProduction ? '.cadremarkets.com' : undefined,
      maxAge: 24 * 60 * 60 * 1000
    };
    
    const user = await User.findOne({ email });
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      const { password: pass, ...rest } = user._doc;
      res
        .cookie('access_token', token, cookieOptions)
        .status(200)
        .json({
          success: true,
          user: rest
        });
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = new User({
        username:
          name.split(' ').join('').toLowerCase() +
          Math.random().toString(36).slice(-4),
        email: email,
        password: hashedPassword,
        avatar: photo,
      });
      await newUser.save();
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
      const { password: pass, ...rest } = newUser._doc;
      res
        .cookie('access_token', token, cookieOptions)
        .status(200)
        .json({ 
          success: true, 
          user: rest 
        });
    }
  } catch (error) {
    next(error);
  }
};

export const signOut = async (req, res, next) => {
  try {
    res.clearCookie('access_token');
    res.status(200).json({
      success: true,
      message: 'User has been logged out'
    });
  } catch (error) {
    next(error);
  }
};
