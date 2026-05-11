const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
  },
  customerSnapshot: {
    name: { type: String },
    email: { type: String },
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1'],
        validate: {
          validator: Number.isInteger,
          message: 'Quantity must be an integer',
        },
      },
      price: {
        type: Number,
        required: true,
        min: [1, 'Price must be greater than 0'],
      },
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
    min: [1, 'Total price must be greater than 0'],
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
    lowercase: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for order queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
