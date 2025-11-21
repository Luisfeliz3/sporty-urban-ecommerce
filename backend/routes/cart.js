const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const router = express.Router();

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.product');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Enhance cart items with product details
    const enhancedCart = await Promise.all(
      user.cart.map(async (item) => {
        const product = await Product.findById(item.product);
        return {
          product: item.product,
          name: product?.name || 'Unknown Product',
          price: product?.price || 0,
          image: product?.images?.[0]?.url || '/images/placeholder.jpg',
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          inventory: product?.inventory || 0
        };
      })
    );

    res.json({
      success: true,
      data: enhancedCart
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cart'
    });
  }
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { product, quantity, size, color } = req.body;

    // Validate required fields
    if (!product || !quantity || !size || !color) {
      return res.status(400).json({
        success: false,
        message: 'Please provide product, quantity, size, and color'
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check product exists and has inventory
    const productDoc = await Product.findById(product);
    if (!productDoc) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (productDoc.inventory < quantity) {
      return res.status(400).json({
        success: false,
        message: `Not enough inventory. Only ${productDoc.inventory} available`
      });
    }

    // Add item to cart
    const cart = await user.addToCart({
      product,
      quantity,
      size,
      color
    });

    // Get enhanced cart with product details
    const enhancedCart = await Promise.all(
      cart.map(async (item) => {
        const product = await Product.findById(item.product);
        return {
          product: item.product,
          name: product?.name || 'Unknown Product',
          price: product?.price || 0,
          image: product?.images?.[0]?.url || '/images/placeholder.jpg',
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          inventory: product?.inventory || 0
        };
      })
    );

    res.json({
      success: true,
      data: enhancedCart,
      message: 'Item added to cart'
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding item to cart'
    });
  }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart
// @access  Private
router.delete('/', auth, async (req, res) => {
  try {
    const { product, size, color } = req.body;

    if (!product || !size || !color) {
      return res.status(400).json({
        success: false,
        message: 'Please provide product, size, and color'
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const cart = await user.removeFromCart(product, size, color);

    res.json({
      success: true,
      data: cart,
      message: 'Item removed from cart'
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing item from cart'
    });
  }
});

// @desc    Update cart item quantity
// @route   PUT /api/cart
// @access  Private
router.put('/', auth, async (req, res) => {
  try {
    const { product, size, color, quantity } = req.body;

    if (!product || !size || !color || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide product, size, color, and quantity'
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const cart = await user.updateCartItemQuantity(product, size, color, quantity);

    res.json({
      success: true,
      data: cart,
      message: 'Cart updated successfully'
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating cart'
    });
  }
});

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
router.delete('/clear', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const cart = await user.clearCart();

    res.json({
      success: true,
      data: cart,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing cart'
    });
  }
});

// @desc    Sync cart with local storage
// @route   POST /api/cart/sync
// @access  Private
router.post('/sync', auth, async (req, res) => {
  try {
    const { localCart } = req.body;

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const syncedCart = await user.syncCart(localCart);

    // Get enhanced cart with product details
    const enhancedCart = await Promise.all(
      syncedCart.map(async (item) => {
        const product = await Product.findById(item.product);
        return {
          product: item.product,
          name: product?.name || 'Unknown Product',
          price: product?.price || 0,
          image: product?.images?.[0]?.url || '/images/placeholder.jpg',
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          inventory: product?.inventory || 0
        };
      })
    );

    res.json({
      success: true,
      data: enhancedCart,
      message: 'Cart synced successfully'
    });
  } catch (error) {
    console.error('Cart sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Error syncing cart'
    });
  }
});

module.exports = router;