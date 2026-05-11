const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  verifyStockForCart,
} = require('../controllers/productController');
const verifyToken = require('../middleware/auth');
const checkAdmin = require('../middleware/isAdmin');
const { validateObjectId, validateProduct, validateProductUpdate, validateProductQuery } = require('../middleware/validation');

// Public routes
router.get('/', validateProductQuery, getAllProducts);

// Admin-only routes (non-parameterized first)
router.post('/', verifyToken, checkAdmin, validateProduct, createProduct);

// Logged-in user — availability check only (stock deducted when admin confirms order)
router.patch('/:id/cart', verifyToken, validateObjectId('id'), verifyStockForCart);

// Parameterized routes
router.get('/:id', validateObjectId('id'), getProductById);
router.put('/:id', verifyToken, checkAdmin, validateObjectId('id'), validateProductUpdate, updateProduct);
router.delete('/:id', verifyToken, checkAdmin, validateObjectId('id'), deleteProduct);

module.exports = router;
