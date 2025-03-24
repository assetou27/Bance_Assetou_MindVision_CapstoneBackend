const express = require('express');
const router = express.Router();
const {
  setAvailability,
  getAvailability,
  removeUnavailableDate
} = require('../controllers/availabilityController');

// POST or PUT - create or update coach availability
router.post('/', setAvailability);

// GET - retrieve availability by coach ID
router.get('/:coachId', getAvailability);

// PATCH - remove a specific unavailable date
router.patch('/remove', removeUnavailableDate);

module.exports = router;
