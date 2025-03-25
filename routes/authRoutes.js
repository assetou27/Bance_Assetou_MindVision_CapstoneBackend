const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getUser,
  updateUser,
  deleteUser,
  getUserByEmail,
  getUserByName
} = require('../controllers/authController');
const auth = require('../middleware/auth'); // Import the auth middleware

// Public routes (no auth required)
// These endpoints don't require authentication since they're used for registration and login
router.post('/register', register);
router.post('/login', login);

// Protected routes (auth required)
// These endpoints require a valid JWT token to access
router.get('/email/:email', auth, getUserByEmail);
router.get('/name/:name', auth, getUserByName);
router.get('/:id', auth, getUser);
router.patch('/:id', auth, updateUser);
router.delete('/:id', auth, deleteUser);

module.exports = router;