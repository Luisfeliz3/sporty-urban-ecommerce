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
      subcategory,
      brand,
      productType,
      minPrice,
      maxPrice,
      featured,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      minRating,
      inStock,
      attributes
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    // Category filter
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Subcategory filter
    if (subcategory && subcategory !== 'all') {
      filter.subcategory = subcategory;
    }

    // Product Type filter
    if (productType && productType !== 'all') {
      filter.productType = productType;
    }

    // Brand filter
    if (brand && brand !== 'all') {
      filter.brand = { $regex: brand, $options: 'i' };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Rating filter
    if (minRating) {
      filter.rating = { $gte: parseFloat(minRating) };
    }

    // Stock filter
    if (inStock === 'true') {
      filter.inventory = { $gt: 0 };
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

    // Dynamic attributes filter (for specific product type attributes)
    if (attributes) {
      const parsedAttrs = JSON.parse(attributes);
      Object.keys(parsedAttrs).forEach(key => {
        filter[`attributes.${key}`] = parsedAttrs[key];
      });
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const products = await Product.find(filter)
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
    subcategories,
    brands,
    productTypes,
    priceRange
  ] = await Promise.all([
    Product.distinct('category', { isActive: true }),
    Product.distinct('subcategory', { isActive: true, subcategory: { $ne: '' } }),
    Product.distinct('brand', { isActive: true }),
    Product.distinct('productType', { isActive: true }),
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
    subcategories: subcategories.sort(),
    brands: brands.sort(),
    productTypes: productTypes.sort(),
    priceRange: priceRange[0] || { minPrice: 0, maxPrice: 1000 }
  };
};

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20, page = 1 } = req.query;

    const products = await Product.find({ 
      category: decodeURIComponent(category),
      isActive: true 
    })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Product.countDocuments({ 
      category: decodeURIComponent(category),
      isActive: true 
    });

    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products by category'
    });
  }
});

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

    // Increment view count (optional - you can add this field)
    // product.viewCount = (product.viewCount || 0) + 1;
    // await product.save();

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
// @route   GET /api/products/featured
// @access  Public
router.get('/featured/products', async (req, res) => {
  try {
    const products = await Product.find({ 
      featured: true, 
      isActive: true 
    })
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

// @desc    Get new arrivals
// @route   GET /api/products/new-arrivals
// @access  Public
router.get('/new-arrivals/limit', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const products = await Product.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Get new arrivals error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching new arrivals'
    });
  }
});

// @desc    Get best selling products
// @route   GET /api/products/best-selling
// @access  Public
router.get('/best-selling/limit', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    // This would typically use order data to determine best sellers
    // For now, return products with highest rating and review count
    const products = await Product.find({ isActive: true })
      .sort({ rating: -1, reviewCount: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Get best selling error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching best selling products'
    });
  }
});

// @desc    Search products
// @route   GET /api/products/search/:query
// @access  Public
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 20, page = 1 } = req.query;

    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ],
      isActive: true
    })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Product.countDocuments({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } }
      ],
      isActive: true
    });

    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      },
      query
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching products'
    });
  }
});

module.exports = router;