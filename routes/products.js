const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

// Get all products with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const pageSize = 25;
    const page = Number(req.query.pageNumber) || 1;
    const keyword = req.query.keyword ? {
      name: {
        $regex: req.query.keyword,
        $options: 'i'
      }
    } : {};

    const categoryFilter = req.query.category ? { category: req.query.category } : {};
    const sportTypeFilter = req.query.sportType ? { sportType: req.query.sportType } : {};
    const brandFilter = req.query.brand ? { brand: req.query.brand } : {};

    const filter = { 
      ...keyword, 
      ...categoryFilter, 
      ...sportTypeFilter, 
      ...brandFilter 
    };

    const count = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      totalProducts: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get featured products
router.get('/featured/products', async (req, res) => {
  try {
    const products = await Product.find({ featured: true }).limit(8);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;