const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  originalPrice: {
    type: Number
  },
  category: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  sizes: [{
    type: String
  }],
  colors: [{
    name: String,
    code: String
  }],
  inventory: {
    type: Number,
    required: true,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  sportType: {
    type: String,
    enum: ['basketball', 'soccer', 'running', 'training', 'lifestyle', 'skateboarding']
  },
  tags: [String],
  rating: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);