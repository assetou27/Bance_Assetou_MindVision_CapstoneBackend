// index.js
// Main server entry point

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
const fs = require('fs');  // If you need to check for 'client/build'
require('dotenv').config();

// Initialize express app
const app = express();

// Connect to Database
connectDB();

// CORS configuration
// Allows requests from Netlify + localhost
app.use(cors({
  origin: [
    'https://abmindvision.netlify.app',  // Netlify domain
    'http://localhost:3000'             // Local dev
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse incoming JSON requests
app.use(express.json());

// Define API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/services', require('./routes/services'));
app.use('/api/blog', require('./routes/blog'));

// Simple test route to verify server is working
app.get('/api/test', (req, res) => {
  res.json({ msg: 'API Running' });
});

// Serve static assets in production (optional)
if (
  process.env.NODE_ENV === 'production' &&
  fs.existsSync(path.join(__dirname, 'client/build'))
) {
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Define port
const PORT = process.env.PORT || 5000;

// Start server with error handling
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  console.error('Server error:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Try another port.`);
  }
});
