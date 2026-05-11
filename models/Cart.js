const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    unique: true,
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
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1 — 0 is not allowed'],
        validate: {
          validator: Number.isInteger,
          message: 'Quantity must be a whole number — 1.5 is not allowed',
        },
      },
    },
  ],
});

module.exports = mongoose.model('Cart', cartSchema);
