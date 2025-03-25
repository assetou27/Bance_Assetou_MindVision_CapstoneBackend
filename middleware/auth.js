// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Import User model for verification

/**
 * Authentication middleware
 * Verifies JWT tokens from request headers and attaches user data to request objects
 * Protects routes that require authentication
 */
const auth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    // Supports both "Bearer token" and direct token formats
    const authHeader = req.header('Authorization');
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.replace('Bearer ', '') 
      : authHeader;
    
    // Check if token exists
    if (!token) {
      console.log(`Authentication failed: No token provided for ${req.method} ${req.originalUrl}`);
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required. Please log in.' 
      });
    }

    try {
      // Verify token with JWT secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Add user data to request object for use in route handlers
      req.user = decoded;
      
      // Optional: Verify user still exists in database
      // Uncomment this section to check if the user still exists
      /*
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: 'User no longer exists'
        });
      }
      */
      
      // Log successful authentication for debugging
      console.log(`User ${decoded.userId} (${decoded.role}) authenticated successfully`);
      
      // Continue to the next middleware or route handler
      next();
    } catch (error) {
      // Handle specific JWT errors with appropriate messages
      if (error.name === 'TokenExpiredError') {
        console.log('Authentication failed: Token expired');
        return res.status(401).json({ 
          success: false,
          message: 'Your session has expired. Please log in again.' 
        });
      } else if (error.name === 'JsonWebTokenError') {
        console.log('Authentication failed: Invalid token', error.message);
        return res.status(401).json({ 
          success: false,
          message: 'Invalid authentication token' 
        });
      }
      
      // Generic token error
      console.log('Authentication failed: Token error', error.message);
      return res.status(401).json({ 
        success: false,
        message: 'Authentication failed. Please log in again.' 
      });
    }
  } catch (err) {
    // Handle unexpected errors
    console.error('Authentication middleware error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error during authentication' 
    });
  }
};

module.exports = auth;