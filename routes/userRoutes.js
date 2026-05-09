const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const verifyToken = require('../middleware/auth');
const checkAdmin = require('../middleware/isAdmin');
const { validateObjectId, validateUserUpdate } = require('../middleware/validation');

// All user routes require admin privileges
router.use(verifyToken, checkAdmin);

// GET /api/users
router.get('/', getAllUsers);

// GET /api/users/:id
router.get('/:id', validateObjectId('id'), getUserById);

// PUT /api/users/:id
router.put('/:id', validateObjectId('id'), validateUserUpdate, updateUser);

// DELETE /api/users/:id
router.delete('/:id', validateObjectId('id'), deleteUser);

module.exports = router;
