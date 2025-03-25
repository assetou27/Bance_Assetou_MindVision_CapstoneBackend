const express = require('express');
const router = express.Router();
const {
  createSession,
  getSessionById,
  getSessionsByCoach,
  getSessionsByClient,
  cancelSession,
  rescheduleSession
} = require('../controllers/sessionController');
const auth = require('../middleware/auth'); // Import the auth middleware

// All session routes should be protected since they involve
// accessing or modifying user session data

// POST - book a new session
// Only authenticated users should be able to book sessions
router.post('/', auth, createSession);

// GET - get one session
// Only authenticated users should be able to view session details
router.get('/:id', auth, getSessionById);

// GET - sessions by coach
// This route is critical for your dashboard functionality
router.get('/coach/:coachId', auth, getSessionsByCoach);

// GET - sessions by client
// This route is critical for your dashboard functionality
router.get('/client/:clientId', auth, getSessionsByClient);

// PATCH - cancel session
// Only authenticated users should be able to cancel sessions
router.patch('/:id/cancel', auth, cancelSession);

// PATCH - reschedule session
// Only authenticated users should be able to reschedule sessions
router.patch('/:id/reschedule', auth, rescheduleSession);

module.exports = router;