// middleware/auth.js
// Middleware for JWT authentication

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // CHANGED: Read from 'Authorization' header
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // CHANGED: Parse out the token from 'Bearer <token>'
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Retrieve user from DB
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ msg: 'Token is not valid' });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Check if user is admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ msg: 'Admin access required' });
  }
};

module.exports = { auth, admin };
