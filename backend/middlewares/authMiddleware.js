import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// 1. Protect Route: Verifies the JWT token
export const protect = async (req, res, next) => {
  let token;

  // Check if the request headers contain a Bearer token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the token from the header (Format: "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Decode and verify the token using your secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user in the database and attach them to the request object (excluding the password)
      req.user = await User.findById(decoded.id).select('-passwordHash');

      // Move to the next piece of middleware or the actual controller
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// 2. Role Guard: Verifies if the user is a CREATOR
export const creatorOnly = (req, res, next) => {
  if (req.user && req.user.role === 'CREATOR') {
    next();
  } else {
    // 403 Forbidden: The client does not have access rights to the content
    res.status(403).json({ message: 'Access Denied: Creator privileges required' });
  }
};