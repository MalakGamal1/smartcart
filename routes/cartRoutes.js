const express = require('express');
const router = express.Router();
const { getCart, addToCart, removeFromCart, clearCart } = require('../controllers/cartController');
const verifyToken = require('../middleware/auth');
const { validateCartItem, validateObjectId } = require('../middleware/validation');

// All cart routes require authentication
router.use(verifyToken);

// GET /api/cart
router.get('/', getCart);

// POST /api/cart
router.post('/', validateCartItem, addToCart);

// DELETE /api/cart — clear entire cart (must come BEFORE /:productId)
router.delete('/', clearCart);

// DELETE /api/cart/:productId — remove specific item
router.delete('/:productId', validateObjectId('productId'), removeFromCart);

module.exports = router;
