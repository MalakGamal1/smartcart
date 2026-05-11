const { body, param, query, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

const isValidObjectId = (value) => /^[0-9a-fA-F]{24}$/.test(value);

const validateObjectId = (paramName = 'id') => [
  param(paramName)
    .custom(isValidObjectId)
    .withMessage(`${paramName} must be a valid MongoDB ObjectId (24 hex characters)`),
  validate
];

const validateSignup = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),
  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Email must be a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
    .isLength({ min: 6, max: 128 }).withMessage('Password must be at least 6 characters'),
  validate
];

const validateLogin = [
  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Email must be a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

// FIX for BUG-1: name: "" now rejected
const validateCategory = [
  body('name').trim()
    .notEmpty().withMessage('Category name is required and cannot be empty')
    .isLength({ min: 2 }).withMessage('Category name must be at least 2 characters'),
  body('description').optional().trim()
    .notEmpty().withMessage('Description cannot be an empty string if provided'),
  validate
];

// FIX for BUG-2, BUG-3, BUG-4, BUG-5
const validateProduct = [
  body('name')
    .exists({ checkNull: true }).withMessage('Product name is required and cannot be null')
    .isString().withMessage('Product name must be a string')
    .trim()
    .notEmpty().withMessage('Product name cannot be empty')
    .isLength({ min: 2, max: 150 }).withMessage('Product name must be between 2 and 150 characters'),
    
  body('description')
    .optional()
    .isString().withMessage('Description must be a string')
    .trim()
    .notEmpty().withMessage('Description cannot be an empty string if provided')
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
    
  body('price')
    .exists({ checkNull: true }).withMessage('Price is required and cannot be null')
    .isFloat({ min: 1, max: 999999 }).withMessage('Price must be greater than 0 (minimum $1)')
    .toFloat(),
    
  body('stock')
    .exists({ checkNull: true }).withMessage('Stock is required and cannot be null')
    .isInt({ min: 0, max: 999999 }).withMessage('Stock must be a whole number (integer) >= 0 — negative numbers or decimals like 2.5 are not allowed')
    .toInt(),
    
  body('category')
    .exists({ checkNull: true }).withMessage('Category is required and cannot be null')
    .custom(isValidObjectId)
    .withMessage('Category must be a valid MongoDB ObjectId (24 hex chars) — {{categoryId}} is not valid'),
    
  body('images')
    .optional()
    .isArray({ max: 10 }).withMessage('Images must be an array with a maximum of 10 items'),
    
  body('images.*')
    .optional()
    .isURL().withMessage('Each image must be a valid URL'),
    
  body('brand')
    .optional()
    .isString().withMessage('Brand must be a string')
    .trim()
    .notEmpty().withMessage('Brand cannot be an empty string — omit it or provide a valid name')
    .isLength({ max: 100 }).withMessage('Brand cannot exceed 100 characters'),
    
  validate
];

const validateProductUpdate = [
  body('name')
    .optional()
    .isString().withMessage('Name must be a string')
    .trim()
    .notEmpty().withMessage('Name cannot be empty if provided')
    .isLength({ min: 2, max: 150 }).withMessage('Name must be between 2 and 150 characters'),
    
  body('description')
    .optional()
    .isString().withMessage('Description must be a string')
    .trim()
    .notEmpty().withMessage('Description cannot be empty if provided')
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
    
  body('price')
    .optional()
    .isFloat({ min: 1, max: 999999 }).withMessage('Price must be greater than 0 (minimum $1)')
    .toFloat(),
    
  body('stock')
    .optional()
    .isInt({ min: 0, max: 999999 }).withMessage('Stock must be a whole number >= 0 and less than 1,000,000')
    .toInt(),
    
  body('category')
    .optional()
    .custom(isValidObjectId).withMessage('Category must be a valid MongoDB ObjectId'),
    
  body('images')
    .optional()
    .isArray({ max: 10 }).withMessage('Images must be an array with a maximum of 10 items'),
    
  body('images.*')
    .optional()
    .isURL().withMessage('Each image must be a valid URL'),
    
  body('brand')
    .optional()
    .isString().withMessage('Brand must be a string')
    .trim()
    .notEmpty().withMessage('Brand cannot be an empty string if provided')
    .isLength({ max: 100 }).withMessage('Brand cannot exceed 100 characters'),
    
  validate
];

const validateProductQuery = [
  query('minPrice').optional()
    .isFloat({ min: 0.01 }).withMessage('minPrice must be a number greater than 0'),
  query('maxPrice').optional()
    .isFloat({ min: 0.01 }).withMessage('maxPrice must be a number greater than 0'),
  query('minPrice').optional().custom((value, { req }) => {
    const min = parseFloat(value);
    const max = parseFloat(req.query.maxPrice);
    if (!isNaN(min) && !isNaN(max) && min > max) {
      throw new Error('minPrice cannot be greater than maxPrice');
    }
    return true;
  }),
  query('category').optional()
    .custom(isValidObjectId).withMessage('category must be a valid MongoDB ObjectId'),
  query('inStock').optional()
    .isIn(['true', 'false']).withMessage('inStock must be exactly "true" or "false"'),
  query('brand').optional().trim().notEmpty().withMessage('brand filter cannot be empty'),
  query('search').optional().trim().notEmpty().withMessage('search cannot be empty'),
  validate
];

const validateCartItem = [
  body('productId').notEmpty().withMessage('productId is required')
    .custom(isValidObjectId).withMessage('productId must be a valid MongoDB ObjectId'),
  body('quantity').notEmpty().withMessage('quantity is required')
    .isInt({ min: 1, max: 100 }).withMessage('quantity must be a whole number between 1 and 100 — 0 is not allowed')
    .toInt(),
  validate
];

const validateOrderStatus = [
  body('status').notEmpty().withMessage('Status is required')
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Status must be: pending, processing, shipped, delivered, or cancelled (lowercase only)'),
  validate
];

const validateUserUpdate = [
  body('name').optional().trim()
    .notEmpty().withMessage('Name cannot be empty if provided')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().trim()
    .isEmail().withMessage('Email must be a valid email address').normalizeEmail(),
  validate
];

module.exports = {
  validate, validateObjectId,
  validateSignup, validateLogin,
  validateCategory,
  validateProduct, validateProductUpdate, validateProductQuery,
  validateCartItem, validateOrderStatus, validateUserUpdate,
};
