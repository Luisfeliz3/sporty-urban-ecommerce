const express = require('express');
const multer = require('multer');
const Product = require('../../models/Product');
const auth = require('../../middleware/auth');
const { uploadToGCS, deleteMultipleFromGCS } = require('../../config/cloudStorage');
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

// In adminRoutes.js - Fix create product endpoint

router.post('/', auth, adminRequired, async (req, res) => {
  try {
    console.log('🆕 Creating new product...');
    console.log('Featured value received:', req.body.featured);
    console.log('Featured type:', typeof req.body.featured);
    
    const {
      name,
      description,
      shortDescription,
      price,
      originalPrice,
      category,
      subcategory,
      brand,
      productType,
      inventory,
      featured,  // Make sure this is captured
      tags,
      attributes,
      variants,
      images,
      seo
    } = req.body;

    // Ensure featured is a boolean
    const isFeatured = featured === true || featured === 'true';
    
    console.log('Featured after conversion:', isFeatured);

    // Create product with featured status
    const productData = {
      name: name.trim(),
      description: description.trim(),
      shortDescription: shortDescription ? shortDescription.trim() : description.substring(0, 200),
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      category,
      subcategory: subcategory || '',
      brand: brand.trim(),
      productType,
      inventory: parseInt(inventory) || 0,
      featured: isFeatured, // Use the converted boolean
      tags: parsedTags,
      images: parsedImages,
      attributes: cleanedAttributes,
      variants: parsedVariants,
      seo: parsedSeo
    };

    console.log('Product data being saved:', {
      ...productData,
      featured: productData.featured,
      featuredType: typeof productData.featured
    });

    const product = new Product(productData);
    const savedProduct = await product.save();
    
    console.log('✅ Product created with featured status:', savedProduct.featured);

    res.status(201).json({
      success: true,
      data: savedProduct,
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('❌ Create product error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = {};
      for (let field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating product: ' + error.message
    });
  }
});

// @desc    Get all products (admin view with more details)
// @route   GET /api/admin/products
// @access  Private/Admin
router.get('/', auth, adminRequired, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const productType = req.query.productType || '';

    // Build filter
    const filter = {};
    if (search) {
      filter.$text = { $search: search };
    }
    if (category) {
      filter.category = category;
    }
    if (productType) {
      filter.productType = productType;
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);

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

// @desc    Update product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
router.put('/:id', auth, adminRequired, upload.array('images', 10), async (req, res) => {
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
      shortDescription,
      price,
      originalPrice,
      category,
      subcategory,
      brand,
      productType,
      inventory,
      featured,
      tags,
      isActive,
      attributes,
      variants,
      seo,
      removeImages
    } = req.body;

    // Update fields
    if (name) product.name = name.trim();
    if (description) product.description = description.trim();
    if (shortDescription) product.shortDescription = shortDescription.trim();
    if (price) product.price = parseFloat(price);
    if (originalPrice !== undefined) product.originalPrice = originalPrice ? parseFloat(originalPrice) : null;
    if (category) product.category = category;
    if (subcategory !== undefined) product.subcategory = subcategory;
    if (brand) product.brand = brand.trim();
    if (productType) product.productType = productType;
    if (featured !== undefined) {
      product.featured = featured === true || featured === 'true';
      console.log('Updating featured to:', product.featured);
    }
    if (isActive !== undefined) product.isActive = isActive === 'true';
    if (tags) product.tags = Array.isArray(tags) ? tags : tags.split(',');
    
    // Update attributes
    if (attributes) {
      const parsedAttributes = typeof attributes === 'string' ? JSON.parse(attributes) : attributes;
      product.attributes = { ...product.attributes, ...parsedAttributes };
    }
    
    // Update variants
    if (variants) {
      const parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;
      product.variants = parsedVariants;
      
      // Recalculate total inventory
      product.inventory = parsedVariants.reduce((sum, variant) => sum + (parseInt(variant.inventory) || 0), 0);
    } else if (inventory !== undefined) {
      product.inventory = parseInt(inventory);
    }
    
    // Update SEO
    if (seo) {
      const parsedSeo = typeof seo === 'string' ? JSON.parse(seo) : seo;
      product.seo = { ...product.seo, ...parsedSeo };
    }

    // Handle image removal - delete from GCS
    if (removeImages) {
      const removeIds = Array.isArray(removeImages) ? removeImages : removeImages.split(',');
      const imagesToRemove = product.images.filter(img => removeIds.includes(img._id.toString()));
      
      const filenamesToDelete = imagesToRemove.map(img => img.filename).filter(f => f);
      if (filenamesToDelete.length > 0) {
        await deleteMultipleFromGCS(filenamesToDelete);
      }
      
      product.images = product.images.filter(img => !removeIds.includes(img._id.toString()));
    }

    // Add new images
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        try {
          const uploadedImage = await uploadToGCS(file, 'products');
          product.images.push({
            url: uploadedImage.url,
            filename: uploadedImage.filename,
            contentType: uploadedImage.contentType,
            isPrimary: product.images.length === 0 && i === 0,
            alt: `${product.name} - Image ${product.images.length + 1}`,
            size: uploadedImage.size,
            uploadedAt: new Date()
          });
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
        }
      }
    }

    const updatedProduct = await product.save();
console.log('✅ Product updated with featured status:', updatedProduct.featured);
    res.json({
      success: true,
      data: updatedProduct,
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

    // Delete all product images from GCS
    const imageFilenames = product.images
      .map(img => img.filename)
      .filter(filename => filename);
    
    if (imageFilenames.length > 0) {
      await deleteMultipleFromGCS(imageFilenames);
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

// @desc    Bulk upload products via CSV
// @route   POST /api/admin/products/bulk-upload
// @access  Private/Admin
router.post('/bulk-upload', auth, adminRequired, upload.single('csv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a CSV file'
      });
    }

    const csvData = req.file.buffer.toString('utf8');
    const lines = csvData.split('\n');
    const headers = lines[0].split(',');
    const products = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',');
      const productData = {};
      
      headers.forEach((header, index) => {
        productData[header.trim()] = values[index]?.trim() || '';
      });
      
      products.push(productData);
    }

    // Process and save products
    const savedProducts = [];
    for (const productData of products) {
      const product = new Product({
        name: productData.name,
        description: productData.description,
        price: parseFloat(productData.price),
        category: productData.category,
        brand: productData.brand,
        productType: productData.productType,
        inventory: parseInt(productData.inventory) || 0,
        tags: productData.tags ? productData.tags.split('|') : []
      });
      
      const saved = await product.save();
      savedProducts.push(saved);
    }

    res.json({
      success: true,
      data: savedProducts,
      message: `${savedProducts.length} products uploaded successfully`
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing bulk upload: ' + error.message
    });
  }
});

module.exports = router;