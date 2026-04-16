const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

/**
 * Protect middleware - Verifies JWT token and attaches user to request
 * This is the base authentication middleware
 */
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (format: "Bearer TOKEN")
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token (excluding password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

/**
 * Role-based authorization middleware
 * Checks if user has the required role(s)
 * Usage: authorize('admin') or authorize('admin', 'instructor')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // First check if user is authenticated (protect middleware should run first)
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, please login' });
    }

    // Check if user's role is in the allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required roles: ${roles.join(', ')}` 
      });
    }

    next();
  };
};

/**
 * Specific role middleware functions for convenience
 */
const adminOnly = authorize('admin');
const freelancerOnly = authorize('freelancer');
const instructorOnly = authorize('instructor');
const clientOnly = authorize('client');

/**
 * Allow admin OR specific role
 */
const adminOrRole = (role) => {
  return authorize('admin', role);
};

//socket role check simple 
const socketAuthMiddleware = async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("No token"));

  try {
    const decoded = jwt.verify(token, "SECRET_KEY");
    socket.role = decoded.role;
    socket.userId = decoded.id;
    console.log(socket.role); 
    console.log(token); 
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
};
module.exports = { 
  protect, 
  authorize, 
  adminOnly, 
  freelancerOnly, 
  instructorOnly, 
  clientOnly,
  adminOrRole,
  socketAuthMiddleware
};