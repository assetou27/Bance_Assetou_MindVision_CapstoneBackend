const express = require('express');
const router = express.Router();
const {
  setAvailability,
  getAvailability,
  removeUnavailableDate
} = require('../controllers/availabilityController');
const auth = require('../middleware/auth'); // Import the auth middleware

// All availability routes should be protected since they involve
// accessing or modifying coach availability data

// POST or PUT - create or update coach availability
// This route should be protected to ensure only authorized users can set availability
router.post('/', auth, setAvailability);

// GET - retrieve availability by coach ID
// This route should be protected to ensure only authorized users can view availability
router.get('/:coachId', auth, getAvailability);

// PATCH - remove a specific unavailable date
// This route should be protected to ensure only authorized users can modify availability
router.patch('/remove', auth, removeUnavailableDate);

module.exports = router;