const express = require('express');
const multer = require('multer');
const Product = require('../../models/Product');
const auth = require('../../middleware/auth');
const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

// Middleware to check if user is admin
const adminRequired = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
};

// @desc    Get all products (admin view with more details)
// @route   GET /api/admin/products
// @access  Private/Admin
router.get('/', auth, adminRequired, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const products = await Product.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-images.data'); // Don't send image data in list

    const total = await Product.countDocuments();

    res.json({
      success: true,
      data: products,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get admin products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products'
    });
  }
});

// @desc    Create new product
// @route   POST /api/admin/products
// @access  Private/Admin
router.post('/', auth, adminRequired, upload.array('images', 5), async (req, res) => {
  try {
    console.log('🆕 Creating new product...');
    console.log('Body:', req.body);
    console.log('Files:', req.files ? req.files.length : 0);

    const {
      name,
      description,
      price,
      originalPrice,
      category,
      brand,
      sizes,
      colors,
      inventory,
      featured,
      sportType,
      tags
    } = req.body;

    // Validation
    if (!name || !description || !price || !category || !brand || !sportType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, description, price, category, brand, sportType'
      });
    }

    // Parse arrays
    const sizesArray = Array.isArray(sizes) ? sizes : (sizes ? sizes.split(',') : []);
    const colorsArray = Array.isArray(colors) ? colors : (colors ? JSON.parse(colors) : []);
    const tagsArray = Array.isArray(tags) ? tags : (tags ? tags.split(',') : []);

    // Process images
    const productImages = req.files ? req.files.map((file, index) => ({
      data: file.buffer,
      contentType: file.mimetype,
      filename: file.originalname,
      isPrimary: index === 0,
      alt: `${name} - Image ${index + 1}`,
      size: file.size
    })) : [];

    // Create product
    const product = new Product({
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      category,
      brand: brand.trim(),
      sizes: sizesArray,
      colors: colorsArray,
      inventory: parseInt(inventory) || 0,
      featured: featured === 'true',
      sportType,
      tags: tagsArray,
      images: productImages
    });

    const savedProduct = await product.save();

    console.log('✅ Product created successfully:', savedProduct._id);

    // Don't send image data in response
    const responseProduct = savedProduct.toObject();
    delete responseProduct.images;

    res.status(201).json({
      success: true,
      data: responseProduct,
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('❌ Create product error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Product with similar details already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating product: ' + error.message
    });
  }
});

// @desc    Update product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
router.put('/:id', auth, adminRequired, upload.array('images', 5), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const {
      name,
      description,
      price,
      originalPrice,
      category,
      brand,
      sizes,
      colors,
      inventory,
      featured,
      sportType,
      tags,
      isActive,
      removeImages
    } = req.body;

    // Update fields
    if (name) product.name = name.trim();
    if (description) product.description = description.trim();
    if (price) product.price = parseFloat(price);
    if (originalPrice !== undefined) product.originalPrice = originalPrice ? parseFloat(originalPrice) : null;
    if (category) product.category = category;
    if (brand) product.brand = brand.trim();
    if (sizes) product.sizes = Array.isArray(sizes) ? sizes : sizes.split(',');
    if (colors) product.colors = Array.isArray(colors) ? colors : JSON.parse(colors);
    if (inventory !== undefined) product.inventory = parseInt(inventory);
    if (featured !== undefined) product.featured = featured === 'true';
    if (sportType) product.sportType = sportType;
    if (tags) product.tags = Array.isArray(tags) ? tags : tags.split(',');
    if (isActive !== undefined) product.isActive = isActive === 'true';

    // Handle image removal
    if (removeImages) {
      const removeIds = Array.isArray(removeImages) ? removeImages : removeImages.split(',');
      product.images = product.images.filter(img => !removeIds.includes(img._id.toString()));
    }

    // Add new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file, index) => ({
        data: file.buffer,
        contentType: file.mimetype,
        filename: file.originalname,
        isPrimary: product.images.length === 0 && index === 0, // Set as primary if no images exist
        alt: `${product.name} - Image ${product.images.length + index + 1}`,
        size: file.size
      }));
      product.images.push(...newImages);
    }

    const updatedProduct = await product.save();

    // Don't send image data in response
    const responseProduct = updatedProduct.toObject();
    delete responseProduct.images;

    res.json({
      success: true,
      data: responseProduct,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product: ' + error.message
    });
  }
});

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
router.delete('/:id', auth, adminRequired, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product'
    });
  }
});

// @desc    Get product by ID (admin view with image data)
// @route   GET /api/admin/products/:id
// @access  Private/Admin
router.get('/:id', auth, adminRequired, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get admin product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product'
    });
  }
});

// @desc    Toggle product active status
// @route   PATCH /api/admin/products/:id/toggle-active
// @access  Private/Admin
router.patch('/:id/toggle-active', auth, adminRequired, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product.isActive = !product.isActive;
    await product.save();

    res.json({
      success: true,
      data: {
        isActive: product.isActive
      },
      message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Toggle product active error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product status'
    });
  }
});

module.exports = router;