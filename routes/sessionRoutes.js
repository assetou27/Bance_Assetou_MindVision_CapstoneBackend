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

// POST - book a new session
router.post('/', createSession);

// GET - get one session
router.get('/:id', getSessionById);

// GET - sessions by coach
router.get('/coach/:coachId', getSessionsByCoach);

// GET - sessions by client
router.get('/client/:clientId', getSessionsByClient);

// PATCH - cancel session
router.patch('/:id/cancel', cancelSession);

// PATCH - reschedule session
router.patch('/:id/reschedule', rescheduleSession);

module.exports = router;
