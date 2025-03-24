// MongoDB connection using Mongoose
const mongoose = require('mongoose');

// Connects to the MongoDB database using credentials from .env
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1); // Stop the app if DB connection fails
  }
};

module.exports = connectDB;
