const Cart = require('../models/Cart');
const Product = require('../models/Product');

// GET /api/cart — get current user's cart
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.product', 'name price stock images brand');

    if (!cart) {
      cart = { items: [] };
    }

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/cart — add item to cart (validates total qty per line vs stock; stock is not reserved until admin confirms order)
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    const nextItems = cart
      ? cart.items.map((item) => ({
          product: item.product.toString(),
          quantity: item.quantity,
        }))
      : [];

    const existingIdx = nextItems.findIndex((item) => item.product === productId);
    if (existingIdx >= 0) {
      nextItems[existingIdx].quantity = quantity;
    } else {
      nextItems.push({ product: productId, quantity });
    }

    for (const line of nextItems) {
      const p = await Product.findById(line.product);
      if (!p || p.stock < line.quantity) {
        return res.status(400).json({
          success: false,
          message: p
            ? `Not enough stock for ${p.name}. Available: ${p.stock}, requested in cart: ${line.quantity}`
            : 'Product not found',
        });
      }
    }

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: nextItems.map((i) => ({ product: i.product, quantity: i.quantity })),
      });
    } else {
      cart.items = nextItems.map((i) => ({ product: i.product, quantity: i.quantity }));
      await cart.save();
    }

    cart = await Cart.findById(cart._id).populate('items.product', 'name price stock images brand');

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      cart,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cart/:productId — remove item from cart
const removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== req.params.productId
    );

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cart — clear entire cart
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: 'Cart is already empty',
      });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCart, addToCart, removeFromCart, clearCart };
