// Backend entry point - Importing required packages
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Create middleware directory and file if it doesn't exist
const fs = require('fs');
const path = require('path');

// Check if middleware directory exists, if not create it
const middlewareDir = path.join(__dirname, 'middleware');
if (!fs.existsSync(middlewareDir)) {
  fs.mkdirSync(middlewareDir);
}

// Create error handler middleware file if it doesn't exist
const errorHandlerPath = path.join(middlewareDir, 'errorHandler.js');
if (!fs.existsSync(errorHandlerPath)) {
  const errorHandlerCode = `
const errorHandler = (err, req, res, next) => {
  console.error('ERROR:', err.stack);
  res.status(500).json({ 
    message: 'Server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

module.exports = errorHandler;
`;
  fs.writeFileSync(errorHandlerPath, errorHandlerCode);
}

// Import the error handler middleware
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express application
const app = express();

// Middleware setup
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON request bodies

/* ========== ROUTES ========== */

// 🧑‍💻 Auth routes (Register, Login, Get/Update/Delete user)
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// 📅 Session routes (Book, View, Cancel, Reschedule sessions)
const sessionRoutes = require('./routes/sessionRoutes');
app.use('/api/sessions', sessionRoutes);

// 🕒 Availability routes (Set/View/Remove coach unavailability)
const availabilityRoutes = require('./routes/availabilityRoutes');
app.use('/api/availability', availabilityRoutes);

// ✅ Test route - simple endpoint to verify API is running
app.get('/api', (req, res) => {
  res.send('MindVision API is running...');
});

// Add a test route that doesn't require authentication
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test endpoint is working!' });
});

// Register error handling middleware
// IMPORTANT: Error middleware must be registered AFTER routes
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});