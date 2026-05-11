const Product = require('../models/Product');

// GET /api/products (public, with query filtration)
const getAllProducts = async (req, res, next) => {
  try {
    const { minPrice, maxPrice, category, brand, inStock, search } = req.query;

    // Build filter object
    const filter = {};

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Brand filter (case-insensitive)
    if (brand) {
      filter.brand = { $regex: brand, $options: 'i' };
    }

    // In-stock filter
    if (inStock === 'true') {
      filter.stock = { $gt: 0 };
    }

    // Search by name (regex, case-insensitive)
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const products = await Product.find(filter).populate('category', 'name description');

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/:id (public)
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name description');
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/products (admin only)
const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, category, images, brand } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required',
      });
    }

    if (price === undefined || price === null || Number(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be greater than 0',
      });
    }

    // Check for duplicate product name (case-insensitive)
    const existingProduct = await Product.findOne({
      name: { $regex: new RegExp(`^${name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product already exists',
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      stock,
      category,
      images,
      brand,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }
    // Handle duplicate key error (race condition fallback)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `Product already exists`,
      });
    }
    next(error);
  }
};

// PUT /api/products/:id (admin only)
const updateProduct = async (req, res, next) => {
  try {
    const { name, price } = req.body;

    // Validate price if provided
    if (price !== undefined && (price === null || Number(price) <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'Price must be greater than 0',
      });
    }

    // Validate name if provided
    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Product name cannot be empty',
        });
      }

      // Check for duplicate product name (case-insensitive), excluding current product
      const existingProduct = await Product.findOne({
        name: { $regex: new RegExp(`^${name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'A product with this name already exists',
        });
      }
    }

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }
    // Handle duplicate key error (race condition fallback)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A product with this name already exists',
      });
    }
    next(error);
  }
};

// DELETE /api/products/:id (admin only)
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/products/:id/cart — verify in stock (stock is reduced only when admin confirms the order)
const verifyStockForCart = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.stock <= 0) {
      return res.status(400).json({ success: false, message: 'Product is out of stock' });
    }

    res.status(200).json({
      success: true,
      message: 'Product available',
      stock: product.stock,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  verifyStockForCart,
};
