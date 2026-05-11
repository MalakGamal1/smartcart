const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (v === undefined || v === null) return true;
        return v.trim().length > 0;
      },
      message: 'Description cannot be an empty string',
    },
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [1, 'Price must be greater than 0'],
    max: [999999, 'Price cannot exceed 999,999'],
  },
  stock: {
    type: Number,
    required: [true, 'Stock is required'],
    min: [0, 'Stock cannot be negative'],
    validate: {
      validator: Number.isInteger,
      message: 'Stock must be a whole number — 2.5 is not allowed',
    },
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required'],
  },
  images: {
    type: [String],
    default: [],
  },
  brand: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (v === undefined || v === null) return true;
        return v.trim().length > 0;
      },
      message: 'Brand cannot be an empty string',
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for query filtration performance
productSchema.index({ price: 1 });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ stock: 1 });
productSchema.index({ name: 'text' });

module.exports = mongoose.model('Product', productSchema);

