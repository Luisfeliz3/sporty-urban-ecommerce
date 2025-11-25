const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

// @desc    Get all products with filtering, sorting, and pagination
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 25,
      category,
      brand,
      sportType,
      minPrice,
      maxPrice,
      size,
      color,
      featured,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    // Category filter
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Brand filter
    if (brand && brand !== 'all') {
      filter.brand = { $regex: brand, $options: 'i' };
    }

    // Sport type filter
    if (sportType && sportType !== 'all') {
      filter.sportType = sportType;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Size filter
    if (size && size !== 'all') {
      filter.sizes = size;
    }

    // Color filter
    if (color && color !== 'all') {
      filter['colors.name'] = { $regex: color, $options: 'i' };
    }

    // Featured filter
    if (featured === 'true') {
      filter.featured = true;
    }

    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const products = await Product.find(filter)
      .select('-images.data') // Don't send image binary data
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    // Get available filters for frontend
    const availableFilters = await getAvailableFilters();

    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      filters: availableFilters
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products'
    });
  }
});

// Helper function to get available filter options
const getAvailableFilters = async () => {
  const [
    categories,
    brands,
    sportTypes,
    sizes,
    colors,
    priceRange
  ] = await Promise.all([
    // Categories
    Product.distinct('category', { isActive: true }),
    
    // Brands
    Product.distinct('brand', { isActive: true }),
    
    // Sport Types
    Product.distinct('sportType', { isActive: true }),
    
    // Sizes
    Product.distinct('sizes', { isActive: true }),
    
    // Colors
    Product.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$colors' },
      { $group: { _id: '$colors.name' } }
    ]),
    
    // Price Range
    Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      }
    ])
  ]);

  return {
    categories: categories.sort(),
    brands: brands.sort(),
    sportTypes: sportTypes.sort(),
    sizes: sizes.sort(),
    colors: colors.map(c => c._id).sort(),
    priceRange: priceRange[0] || { minPrice: 0, maxPrice: 1000 }
  };
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
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
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product'
    });
  }
});

// @desc    Get featured products
// @route   GET /api/products/featured/products
// @access  Public
router.get('/featured/products', async (req, res) => {
  try {
    const products = await Product.find({ 
      featured: true, 
      isActive: true 
    })
    .select('-images.data')
    .limit(8)
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured products'
    });
  }
});

module.exports = router;