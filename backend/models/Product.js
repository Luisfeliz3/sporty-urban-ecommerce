const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['T-Shirts', 'Jerseys', 'Shorts', 'Hoodies', 'Jackets', 'Accessories']
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  images: [{
    data: Buffer,
    contentType: String,
    filename: String,
    
    isPrimary: {
      type: Boolean,
      default: false
    },
    url : String,
    alt: String,
    size: Number,
    
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  sizes: [{
    type: String,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
  }],
  colors: [{
    name: String,
    code: String
  }],
  inventory: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  sportType: {
    type: String,
    enum: ['basketball', 'soccer', 'running', 'training', 'lifestyle', 'skateboarding', 'yoga', 'football', 'baseball'],
    required: true
  },
  tags: [String],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Generate SKU before saving
productSchema.pre('save', function(next) {
  if (!this.sku) {
    const prefix = this.brand.substring(0, 3).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.sku = `${prefix}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);