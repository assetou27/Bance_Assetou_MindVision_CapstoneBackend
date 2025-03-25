// middleware/errorHandler.js

/**
 * Global error handling middleware
 * Catches all unhandled errors and sends appropriate responses
 * Provides detailed error information in development mode
 */
const errorHandler = (err, req, res, next) => {
  // Log error for server-side debugging
  console.error('ERROR DETAILS:');
  console.error(`- Path: ${req.originalUrl}`);
  console.error(`- Method: ${req.method}`);
  console.error(`- Message: ${err.message}`);
  console.error(`- Stack: ${err.stack}`);
  
  // Get environment mode
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Default error status and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  
  // Handle common error types
  if (err.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  } else if (err.name === 'CastError') {
    // Mongoose bad ObjectId
    statusCode = 400;
    message = 'Resource not found';
  } else if (err.code === 11000) {
    // Mongoose duplicate key
    statusCode = 400;
    message = 'Duplicate field value entered';
  } else if (err.name === 'JsonWebTokenError') {
    // JWT error
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    // JWT expired
    statusCode = 401;
    message = 'Token expired';
  }
  
  // Send response
  res.status(statusCode).json({ 
    success: false,
    message,
    // Only include detailed error info in development
    ...(isProduction ? {} : { 
      details: err.message,
      stack: err.stack,
      path: req.originalUrl
    })
  });
};

module.exports = errorHandler;