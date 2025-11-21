const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  // Profile Information
  profile: {
    phone: {
      type: String,
      trim: true
    },
    dateOfBirth: {
      type: Date
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say']
    },
    avatar: {
      type: String,
      default: ''
    }
  },
  // Address Information
  addresses: [{
    type: {
      type: String,
      enum: ['shipping', 'billing'],
      required: true
    },
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      default: 'United States'
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  // Payment Methods (Storing only last 4 digits for security)
  paymentMethods: [{
    type: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal'],
      default: 'credit_card'
    },
    cardType: {
      type: String,
      enum: ['visa', 'mastercard', 'amex', 'discover'],
      required: true
    },
    last4: {
      type: String,
      required: true,
      maxlength: 4
    },
    expiryMonth: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 2
    },
    expiryYear: {
      type: String,
      required: true,
      minlength: 4,
      maxlength: 4
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    stripePaymentMethodId: {
      type: String // For Stripe integration
    }
  }],
  // Preferences
  preferences: {
    newsletter: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: false
    },
    emailNotifications: {
      type: Boolean,
      default: true
    }
  },
  cart: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: {
      type: Number,
      default: 1
    },
    size: String,
    color: String
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to add payment method
userSchema.methods.addPaymentMethod = function(paymentData) {
  // Ensure only one default payment method
  if (paymentData.isDefault) {
    this.paymentMethods.forEach(method => {
      method.isDefault = false;
    });
  }
  
  this.paymentMethods.push(paymentData);
  return this.save();
};

// Method to add address
userSchema.methods.addAddress = function(addressData) {
  // Ensure only one default address per type
  if (addressData.isDefault) {
    this.addresses.forEach(addr => {
      if (addr.type === addressData.type) {
        addr.isDefault = false;
      }
    });
  }
  
  this.addresses.push(addressData);
  return this.save();
};

// Method to get default payment method
userSchema.methods.getDefaultPaymentMethod = function() {
  return this.paymentMethods.find(method => method.isDefault) || this.paymentMethods[0];
};

// Method to get default shipping address
userSchema.methods.getDefaultShippingAddress = function() {
  return this.addresses.find(addr => addr.type === 'shipping' && addr.isDefault) || 
         this.addresses.find(addr => addr.type === 'shipping');
};

module.exports = mongoose.model('User', userSchema);