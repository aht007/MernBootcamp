const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getActiveUsers
} = require('../controllers/userController');

// GET /api/users - Get all users
router.get('/', getAllUsers); // Not /getAllUsers

// GET /api/users/active - Get active users
router.get('/active', getActiveUsers);

// GET /api/users/:id - Get user by ID
router.get('/:id', getUserById); // Not /getUserById or /userDetails

// POST /api/users - Create a new user
router.post('/', createUser);

// PUT /api/users/:id - Update user by ID
router.put('/:id', updateUser);

// DELETE /api/users/:id - Delete user by ID
router.delete('/:id', deleteUser);

module.exports = router; 
