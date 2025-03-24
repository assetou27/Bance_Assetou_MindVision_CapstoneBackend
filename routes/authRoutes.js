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

// Auth routes
router.post('/register', register);
router.post('/login', login);

// Bonus: recherche
router.get('/email/:email', getUserByEmail);
router.get('/name/:name', getUserByName);

// CRUD par ID
router.get('/:id', getUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
