// db.js - MongoDB database connection configuration

/**
 * MongoDB connection using Mongoose
 * This file handles database connection and error reporting
 * Environment variables are loaded from .env file
 */
const mongoose = require('mongoose');

/**
 * Connects to the MongoDB database using credentials from .env
 * Uses modern connection options and proper error handling
 * @returns {Promise} Resolves when connection is successful
 */
const connectDB = async () => {
  try {
    // Connect to MongoDB using the URL from environment variables
    await mongoose.connect(process.env.MONGODB_URL, {
      // These options ensure compatibility with newer MongoDB versions
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    // Log successful connection
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    // Log connection failure and terminate application
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1); // Stop the app if DB connection fails
  }
};

module.exports = connectDB;