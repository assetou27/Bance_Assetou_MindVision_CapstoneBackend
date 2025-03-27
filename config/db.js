// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // To use the correct environment variable name from your .env file
    const mongoURI = process.env.MONGODB_URL;
    
    // Check if MongoDB URL is defined
    if (!mongoURI) {
      throw new Error('MongoDB URL is not defined in environment variables');
    }
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`Error connecting to MongoDB: ${err.message}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;