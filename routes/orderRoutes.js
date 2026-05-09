const express = require('express');
const router = express.Router();
const { getOrders, getOrderById, createOrder, updateOrderStatus } = require('../controllers/orderController');
const verifyToken = require('../middleware/auth');
const checkAdmin = require('../middleware/isAdmin');
const { validateObjectId, validateOrderStatus } = require('../middleware/validation');

// All order routes require authentication
router.use(verifyToken);

// GET /api/orders
router.get('/', getOrders);

// GET /api/orders/:id
router.get('/:id', validateObjectId('id'), getOrderById);

// POST /api/orders — create from cart
router.post('/', createOrder);

// PATCH /api/orders/:id/status — admin only
router.patch('/:id/status', checkAdmin, validateObjectId('id'), validateOrderStatus, updateOrderStatus);

module.exports = router;
