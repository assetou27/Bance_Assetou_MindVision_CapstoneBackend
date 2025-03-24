// Backend entry point
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

/* ========== ROUTES ========== */

// 🧑‍💻 Auth routes (Register, Login, Get/Update/Delete user)
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// 📅 Session routes (Book, View, Cancel, Reschedule sessions)
const sessionRoutes = require('./routes/sessionRoutes');
app.use('/api/sessions', sessionRoutes);

// 🕒 Availability routes (Set/View/Remove coach unavailability)
const availabilityRoutes = require('./routes/availabilityRoutes');
app.use('/api/availability', availabilityRoutes); // ✅ Now your availability logic is connected

// ✅ Test route
app.get('/api', (req, res) => {
  res.send('MindVision API is running...');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
