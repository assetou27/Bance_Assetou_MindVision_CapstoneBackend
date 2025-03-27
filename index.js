// index.js
// Main server entry point

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
const fs = require('fs'); // Make sure 'fs' is imported if using fs.existsSync
require('dotenv').config();

// Initialize express app
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors({
  origin: [
    'https://abmindvision.netlify.app',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(express.json()); // parse JSON

// Define routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/services', require('./routes/services'));
app.use('/api/blog', require('./routes/blog'));

// Simple test route to verify server is working
app.get('/api/test', (req, res) => {
  res.json({ msg: 'API Running' });
});

// Serve static assets in production
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

// Start server with better error handling
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  console.error('Server error:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Try another port.`);
  }
});
