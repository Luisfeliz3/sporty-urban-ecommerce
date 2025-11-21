const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('cart.product');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
router.put('/', auth, async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      dateOfBirth,
      gender,
      preferences
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update basic info
    if (name) user.name = name;
    if (email && email !== user.email) {
      // Check if email is already taken
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
      user.email = email;
    }

    // Update profile info
    if (phone) user.profile.phone = phone;
    if (dateOfBirth) user.profile.dateOfBirth = dateOfBirth;
    if (gender) user.profile.gender = gender;

    // Update preferences
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
});

// @desc    Add or update address
// @route   POST /api/profile/address
// @access  Private
router.post('/address', auth, async (req, res) => {
  try {
    const addressData = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.addAddress(addressData);

    res.json({
      success: true,
      message: 'Address added successfully',
      data: user.addresses
    });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding address'
    });
  }
});

// @desc    Delete address
// @route   DELETE /api/profile/address/:addressId
// @access  Private
router.delete('/address/:addressId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.addresses = user.addresses.filter(
      addr => addr._id.toString() !== req.params.addressId
    );

    await user.save();

    res.json({
      success: true,
      message: 'Address deleted successfully',
      data: user.addresses
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting address'
    });
  }
});

// @desc    Add payment method
// @route   POST /api/profile/payment-methods
// @access  Private
router.post('/payment-methods', auth, async (req, res) => {
  try {
    const paymentData = req.body;

    // Basic validation for credit card
    if (paymentData.type === 'credit_card' || paymentData.type === 'debit_card') {
      if (!paymentData.cardType || !paymentData.last4 || !paymentData.expiryMonth || !paymentData.expiryYear) {
        return res.status(400).json({
          success: false,
          message: 'Missing required card details'
        });
      }
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.addPaymentMethod(paymentData);

    res.json({
      success: true,
      message: 'Payment method added successfully',
      data: user.paymentMethods
    });
  } catch (error) {
    console.error('Add payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding payment method'
    });
  }
});

// @desc    Delete payment method
// @route   DELETE /api/profile/payment-methods/:paymentMethodId
// @access  Private
router.delete('/payment-methods/:paymentMethodId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.paymentMethods = user.paymentMethods.filter(
      method => method._id.toString() !== req.params.paymentMethodId
    );

    await user.save();

    res.json({
      success: true,
      message: 'Payment method deleted successfully',
      data: user.paymentMethods
    });
  } catch (error) {
    console.error('Delete payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting payment method'
    });
  }
});

// @desc    Set default payment method
// @route   PUT /api/profile/payment-methods/:paymentMethodId/default
// @access  Private
router.put('/payment-methods/:paymentMethodId/default', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Set all payment methods to not default
    user.paymentMethods.forEach(method => {
      method.isDefault = false;
    });

    // Set the specified one as default
    const paymentMethod = user.paymentMethods.id(req.params.paymentMethodId);
    if (paymentMethod) {
      paymentMethod.isDefault = true;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Default payment method updated successfully',
      data: user.paymentMethods
    });
  } catch (error) {
    console.error('Set default payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting default payment method'
    });
  }
});

// @desc    Change password
// @route   PUT /api/profile/password
// @access  Private
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password'
    });
  }
});

module.exports = router;