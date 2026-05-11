const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    minlength: [2, 'Category name must be at least 2 characters'],
    validate: {
      validator: function(v) { return v && v.trim().length > 0; },
      message: 'Category name cannot be an empty string',
    },
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
});

module.exports = mongoose.model('Category', categorySchema);
