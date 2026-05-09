const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const verifyToken = require('../middleware/auth');
const checkAdmin = require('../middleware/isAdmin');
const { validateObjectId, validateCategory } = require('../middleware/validation');

// Public routes
router.get('/', getAllCategories);
router.get('/:id', validateObjectId('id'), getCategoryById);

// Admin-only routes
router.post('/', verifyToken, checkAdmin, validateCategory, createCategory);
router.put('/:id', verifyToken, checkAdmin, validateObjectId('id'), validateCategory, updateCategory);
router.delete('/:id', verifyToken, checkAdmin, validateObjectId('id'), deleteCategory);

module.exports = router;
