const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// GET /api/orders — get current user's orders (admin gets ALL orders)
const getOrders = async (req, res, next) => {
  try {
    // Admin can see all orders; regular users see only their own
    const filter = req.user.role === 'admin' ? {} : { user: req.user.id };

    const orders = await Order.find(filter)
      .populate('items.product', 'name images brand')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/:id — get single order
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name images brand')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if user is the owner or admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own orders.',
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/orders — create order from cart
const createOrder = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty',
      });
    }

    for (const item of cart.items) {
      const p = item.product;
      if (!p || p.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: p
            ? `Insufficient stock for ${p.name} (available ${p.stock}, in cart ${item.quantity})`
            : 'Invalid product in cart',
        });
      }
    }

    let totalPrice = 0;
    const orderItems = cart.items.map((item) => {
      const price = item.product.price;
      totalPrice += price * item.quantity;
      return {
        product: item.product._id,
        quantity: item.quantity,
        price,
      };
    });

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalPrice,
      status: 'pending',
    });

    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: 'Order submitted. Waiting for admin confirmation.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/orders/:id/status — update order status (admin only)
// When moving pending → processing, stock is reduced by line quantities (purchase confirmed).
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id).populate('items.product');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const prevStatus = order.status;
    const confirmsPurchase =
      prevStatus === 'pending' &&
      ['processing', 'shipped', 'delivered'].includes(status);

    if (confirmsPurchase) {
      for (const line of order.items) {
        const prod = line.product;
        if (!prod || prod.stock < line.quantity) {
          return res.status(400).json({
            success: false,
            message: prod
              ? `Cannot confirm: not enough stock for ${prod.name} (need ${line.quantity}, have ${prod.stock})`
              : 'Invalid product on order',
          });
        }
      }
      for (const line of order.items) {
        const prod = await Product.findById(line.product._id || line.product);
        prod.stock -= line.quantity;
        await prod.save();
      }
    }

    order.status = status;
    await order.save();

    const updated = await Order.findById(order._id)
      .populate('items.product', 'name images brand')
      .populate('user', 'name email');

    res.status(200).json({
      success: true,
      message: confirmsPurchase
        ? 'Order confirmed and stock updated.'
        : 'Order status updated successfully',
      order: updated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getOrders, getOrderById, createOrder, updateOrderStatus };
