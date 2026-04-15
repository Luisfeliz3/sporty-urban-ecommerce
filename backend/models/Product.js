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
  shortDescription: {
    type: String,
    trim: true,
    maxlength: 200
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
    enum: [
      'Detergents & Laundry',
      'Beauty & Personal Care',
      'Home Care & Cleaning',
      'Grocery & Staples',
      'Health & Household',
      'Home & Kitchen',
      'Baby Care',
      'Pet Care',
      'Auto Care',
      'Office Supplies'
    ]
  },
  subcategory: {
    type: String,
    default: ''
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  attributes: {
    // Common attributes
    weight: {
      value: { type: Number, default: null },
      unit: { type: String, enum: ['g', 'kg', 'ml', 'L', 'oz', 'lb'], default: 'g' }
    },
    quantity: { type: Number, default: 1 },
    packSize: { type: String, default: '' },
    
    // Detergent/Laundry specific
    detergentType: { type: String, enum: ['Powder', 'Liquid', 'Pods', 'Sheet', ''], default: '' },
    scent: { type: String, default: '' },
    isHypoallergenic: { type: Boolean, default: false },
    isEcoFriendly: { type: Boolean, default: false },
    washLoads: { type: Number, default: null },
    
    // Beauty specific
    skinType: [{ type: String, enum: ['Normal', 'Oily', 'Dry', 'Combination', 'Sensitive'] }],
    ingredients: [String],
    isCrueltyFree: { type: Boolean, default: false },
    isVegan: { type: Boolean, default: false },
    spf: { type: Number, default: null },
    
    // Home Care specific
    cleaningType: { 
      type: String, 
      enum: ['All-Purpose', 'Bathroom', 'Kitchen', 'Glass', 'Floor', ''], 
      default: '' 
    },
    isAntibacterial: { type: Boolean, default: false },
    
    // Grocery specific
    dietaryInfo: [{ type: String, enum: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Organic', 'Non-GMO'] }],
    expiryDate: { type: Date, default: null },
    storageInstructions: { type: String, default: '' },
    nutritionalInfo: {
      calories: { type: String, default: '' },
      protein: { type: String, default: '' },
      carbs: { type: String, default: '' },
      fat: { type: String, default: '' }
    },
    
    // Health specific
    healthCategory: { 
      type: String, 
      enum: ['OTC', 'Supplement', 'FirstAid', 'Wellness', ''], 
      default: '' 
    },
    isPrescriptionRequired: { type: Boolean, default: false },
    usageInstructions: { type: String, default: '' },
    warnings: { type: String, default: '' },
    
    // Home & Kitchen specific
    material: { type: String, default: '' },
    color: { type: String, default: '' },
    dimensions: {
      length: { type: Number, default: null },
      width: { type: Number, default: null },
      height: { type: Number, default: null },
      unit: { type: String, default: 'cm' }
    },
    careInstructions: { type: String, default: '' }
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    contentType: String,
    isPrimary: {
      type: Boolean,
      default: false
    },
    alt: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  variants: [{
    name: String,
    sku: String,
    price: Number,
    originalPrice: Number,
    inventory: Number,
    weight: {
      value: Number,
      unit: String
    },
    attributes: mongoose.Schema.Types.Mixed
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
  productType: {
    type: String,
    enum: ['detergent', 'beauty', 'homecare', 'grocery', 'health', 'homekitchen', 'baby', 'pet', 'auto', 'office'],
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
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String]
  }
}, {
  timestamps: true
});

// Generate SKU before saving
productSchema.pre('save', function(next) {
  if (!this.sku) {
    const prefix = this.brand ? this.brand.substring(0, 3).toUpperCase() : 'PRD';
    const categoryCode = this.category ? this.category.substring(0, 2).toUpperCase() : 'OT';
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.sku = `${prefix}-${categoryCode}-${random}`;
  }
  
  // Clean up empty strings in enum fields
  if (this.attributes) {
    if (this.attributes.cleaningType === '') {
      this.attributes.cleaningType = undefined;
    }
    if (this.attributes.healthCategory === '') {
      this.attributes.healthCategory = undefined;
    }
    if (this.attributes.detergentType === '') {
      this.attributes.detergentType = undefined;
    }
  }
  
  next();
});

// Index for better search performance
productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);