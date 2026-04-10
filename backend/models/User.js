const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Product = require('./Product'); // Add this import
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

// Add these methods to your existing User model:

// Method to get user's cart with validation
userSchema.methods.getCart = function() {
  return this.cart.filter(item => 
    item && 
    item.product && 
    typeof item.quantity === 'number' && 
    item.quantity > 0
  );
};


// Update other cart methods similarly
userSchema.methods.addToCart = async function(item) {
  try {
    // Validate input
    if (!item.product || !item.size || !item.color) {
      throw new Error('Invalid cart item: missing required fields');
    }
    
    const quantity = Number(item.quantity);
    if (isNaN(quantity) || quantity < 1) {
      throw new Error('Invalid quantity');
    }
    
    // Find existing item
    const existingItemIndex = this.cart.findIndex(
      cartItem => 
        cartItem.product.toString() === item.product && 
        cartItem.size === item.size && 
        cartItem.color === item.color
    );

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      const newQuantity = this.cart[existingItemIndex].quantity + quantity;
      this.cart[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item to cart
      this.cart.push({
        product: item.product,
        quantity: quantity,
        size: item.size,
        color: item.color
      });
    }

    // Use findOneAndUpdate to bypass version checking
    await this.constructor.findOneAndUpdate(
      { _id: this._id },
      { $set: { cart: this.cart } },
      { versionKey: false }
    );
    
    return this.getCart();
  } catch (error) {
    console.error('Add to cart error:', error);
    throw error;
  }
};


userSchema.methods.removeFromCart = async function(productId, size, color) {
  try {
    if (!productId || !size || !color) {
      throw new Error('Missing required fields for removal');
    }
    
    const originalLength = this.cart.length;
    
    this.cart = this.cart.filter(
      item => !(
        item.product.toString() === productId && 
        item.size === size && 
        item.color === color
      )
    );
    
    // Only save if something was actually removed
    if (this.cart.length !== originalLength) {
      await this.constructor.findOneAndUpdate(
        { _id: this._id },
        { $set: { cart: this.cart } },
        { versionKey: false }
      );
    }
    
    return this.getCart();
  } catch (error) {
    console.error('Remove from cart error:', error);
    throw error;
  }
};

userSchema.methods.updateCartItemQuantity = async function(productId, size, color, quantity) {
  try {
    if (!productId || !size || !color) {
      throw new Error('Missing required fields for update');
    }
    
    const newQuantity = Number(quantity);
    if (isNaN(newQuantity) || newQuantity < 0) {
      throw new Error('Invalid quantity');
    }
    
    const itemIndex = this.cart.findIndex(
      item => 
        item.product.toString() === productId && 
        item.size === size && 
        item.color === color
    );

    if (itemIndex === -1) {
      throw new Error('Item not found in cart');
    }

    if (newQuantity === 0) {
      // Remove item if quantity is 0
      this.cart.splice(itemIndex, 1);
    } else {
      // Update quantity
      this.cart[itemIndex].quantity = newQuantity;
    }
    
    await this.constructor.findOneAndUpdate(
      { _id: this._id },
      { $set: { cart: this.cart } },
      { versionKey: false }
    );
    
    return this.getCart();
  } catch (error) {
    console.error('Update cart quantity error:', error);
    throw error;
  }
};


// Method to clear cart
userSchema.methods.clearCart = async function() {
  try {
    this.cart = [];
    await this.constructor.findOneAndUpdate(
      { _id: this._id },
      { $set: { cart: [] } },
      { versionKey: false }
    );
    return this.getCart();
  } catch (error) {
    console.error('Clear cart error:', error);
    throw error;
  }
};

// Method to sync cart with local storage (optimized)
userSchema.methods.syncCart = async function(localCart) {
  try {
    // If local cart is empty or invalid, return server cart
    if (!localCart || !Array.isArray(localCart) || localCart.length === 0) {
      return this.getCart();
    }

    // Create a map of server cart items for quick lookup
    const serverCartMap = new Map();
    this.cart.forEach(item => {
      const key = `${item.product}_${item.size}_${item.color}`;
      serverCartMap.set(key, item);
    });

    // Merge local cart with server cart
    const mergedItems = [...this.cart];
    
    for (const localItem of localCart) {
      // Skip invalid local items
      if (!localItem.product || !localItem.size || !localItem.color || 
          typeof localItem.quantity !== 'number' || localItem.quantity < 1) {
        continue;
      }
      
      const key = `${localItem.product}_${localItem.size}_${localItem.color}`;
      const existingItem = serverCartMap.get(key);
      
      // Check product exists and has sufficient inventory
      const product = await Product.findById(localItem.product);
      if (!product) continue;
      
      if (existingItem) {
        // Use the larger quantity between server and local, but respect inventory
        const maxQuantity = Math.max(existingItem.quantity, localItem.quantity);
        const finalQuantity = Math.min(maxQuantity, product.inventory);
        
        if (finalQuantity > 0) {
          existingItem.quantity = finalQuantity;
        } else {
          // Remove item if inventory is 0
          const index = mergedItems.findIndex(item => 
            item.product.toString() === localItem.product && 
            item.size === localItem.size && 
            item.color === localItem.color
          );
          if (index !== -1) mergedItems.splice(index, 1);
        }
      } else {
        // Add local item, respecting inventory limits
        const finalQuantity = Math.min(localItem.quantity, product.inventory);
        if (finalQuantity > 0) {
          mergedItems.push({
            product: localItem.product,
            quantity: finalQuantity,
            size: localItem.size,
            color: localItem.color
          });
        }
      }
    }

    // Update server cart with merged items
    this.cart = mergedItems;
    
    // Use findOneAndUpdate to bypass version checking
    await this.constructor.findOneAndUpdate(
      { _id: this._id },
      { $set: { cart: mergedItems } },
      { new: true, runValidators: true, versionKey: false } // versionKey: false disables version checking
    );
    
    // Refresh the current document
    const updatedUser = await this.constructor.findById(this._id);
    this.cart = updatedUser.cart;
    
    return this.getCart();
  } catch (error) {
    console.error('Cart sync error:', error);
    // Return current cart if sync fails
    return this.getCart();
  }
};

// Method to get cart item count
userSchema.methods.getCartItemCount = function() {
  return this.cart.reduce((total, item) => total + (item.quantity || 0), 0);
};

// Method to validate cart inventory
userSchema.methods.validateCartInventory = async function() {
  const invalidItems = [];
  
  for (const item of this.cart) {
    const product = await Product.findById(item.product);
    if (!product) {
      invalidItems.push(item);
    } else if (product.inventory < item.quantity) {
      invalidItems.push({
        ...item.toObject(),
        available: product.inventory,
        message: `Only ${product.inventory} items available`
      });
    }
  }
  
  return invalidItems;
};

// Method to cleanup invalid cart items
userSchema.methods.cleanupInvalidCartItems = async function() {
  const originalLength = this.cart.length;
  
  this.cart = this.cart.filter(async (item) => {
    const product = await Product.findById(item.product);
    return product && product.inventory > 0;
  });
  
  if (this.cart.length !== originalLength) {
    await this.save();
  }
  
  return this.getCart();
};
module.exports = mongoose.model('User', userSchema);