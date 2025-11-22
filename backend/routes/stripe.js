const express = require('express');
const stripe = require('../config/stripe');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// @desc    Create Stripe payment intent
// @route   POST /api/stripe/create-payment-intent
// @access  Private
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { orderId, savePaymentMethod = false } = req.body;

    console.log('🔗 Creating payment intent for order:', orderId);

    const order = await Order.findById(orderId).populate('user');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify order belongs to user
    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay for this order'
      });
    }

    // Check if order is already paid
    if (order.isPaid) {
      return res.status(400).json({
        success: false,
        message: 'Order is already paid'
      });
    }

    // Create or retrieve Stripe customer
    let customerId = order.user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: order.user.email,
        name: order.user.name,
        metadata: {
          userId: order.user._id.toString()
        }
      });
      customerId = customer.id;

      // Save Stripe customer ID to user
      await User.findByIdAndUpdate(order.user._id, {
        stripeCustomerId: customerId
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalPrice * 100), // Convert to cents
      currency: 'usd',
      customer: customerId,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderId: order._id.toString(),
        userId: order.user._id.toString()
      },
      setup_future_usage: savePaymentMethod ? 'on_session' : undefined,
      description: `Order #${order._id} - Urban Athlete`,
      shipping: {
        name: order.user.name,
        address: {
          line1: order.shippingAddress.street,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          postal_code: order.shippingAddress.zipCode,
          country: order.shippingAddress.country || 'US',
        },
      },
    });

    // Update order with Stripe payment intent ID
    order.stripePaymentIntentId = paymentIntent.id;
    await order.save();

    console.log('✅ Payment intent created:', paymentIntent.id);

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('❌ Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment intent: ' + error.message
    });
  }
});

// @desc    Confirm payment and update order
// @route   POST /api/stripe/confirm-payment
// @access  Private
router.post('/confirm-payment', auth, async (req, res) => {
  try {
    const { orderId, paymentIntentId } = req.body;

    console.log('✅ Confirming payment for order:', orderId);

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: `Payment not completed. Status: ${paymentIntent.status}`
      });
    }

    // Update order as paid
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: paymentIntent.id,
      status: paymentIntent.status,
      update_time: new Date().toISOString(),
      email_address: paymentIntent.receipt_email,
    };
    order.stripePaymentMethod = paymentIntent.payment_method;

    await order.save();

    console.log('✅ Payment confirmed for order:', orderId);

    res.json({
      success: true,
      data: order,
      message: 'Payment confirmed successfully'
    });
  } catch (error) {
    console.error('❌ Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming payment: ' + error.message
    });
  }
});

// @desc    Create setup intent for saving payment methods
// @route   POST /api/stripe/create-setup-intent
// @access  Private
router.post('/create-setup-intent', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create or retrieve Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString()
        }
      });
      customerId = customer.id;

      // Save Stripe customer ID to user
      user.stripeCustomerId = customerId;
      await user.save();
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      metadata: {
        userId: user._id.toString(),
        purpose: 'save_payment_method'
      }
    });

    res.json({
      success: true,
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id
    });
  } catch (error) {
    console.error('❌ Create setup intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating setup intent: ' + error.message
    });
  }
});

// @desc    Get user's saved payment methods
// @route   GET /api/stripe/payment-methods
// @access  Private
router.get('/payment-methods', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user || !user.stripeCustomerId) {
      return res.json({
        success: true,
        data: []
      });
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: 'card',
    });

    const formattedPaymentMethods = paymentMethods.data.map(pm => ({
      id: pm.id,
      type: pm.type,
      card: {
        brand: pm.card.brand,
        last4: pm.card.last4,
        exp_month: pm.card.exp_month,
        exp_year: pm.card.exp_year
      },
      isDefault: pm.id === user.defaultPaymentMethodId
    }));

    res.json({
      success: true,
      data: formattedPaymentMethods
    });
  } catch (error) {
    console.error('❌ Get payment methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment methods: ' + error.message
    });
  }
});

// @desc    Set default payment method
// @route   POST /api/stripe/set-default-payment-method
// @access  Private
router.post('/set-default-payment-method', auth, async (req, res) => {
  try {
    const { paymentMethodId } = req.body;

    const user = await User.findById(req.user._id);

    if (!user || !user.stripeCustomerId) {
      return res.status(400).json({
        success: false,
        message: 'No Stripe customer found'
      });
    }

    // Attach payment method to customer if not already attached
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: user.stripeCustomerId,
    });

    // Set as default payment method
    await stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Save to user profile
    user.defaultPaymentMethodId = paymentMethodId;
    await user.save();

    res.json({
      success: true,
      message: 'Default payment method updated successfully'
    });
  } catch (error) {
    console.error('❌ Set default payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting default payment method: ' + error.message
    });
  }
});

// @desc    Handle Stripe webhooks
// @route   POST /api/stripe/webhook
// @access  Public (Stripe calls this)
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('🔔 Webhook received:', event.type);

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await handlePaymentIntentSucceeded(paymentIntent);
      break;
    case 'payment_intent.payment_failed':
      const failedPaymentIntent = event.data.object;
      await handlePaymentIntentFailed(failedPaymentIntent);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({received: true});
});

// Webhook handlers
const handlePaymentIntentSucceeded = async (paymentIntent) => {
  try {
    const orderId = paymentIntent.metadata.orderId;
    
    if (orderId) {
      const order = await Order.findById(orderId);
      
      if (order && !order.isPaid) {
        order.isPaid = true;
        order.paidAt = new Date();
        order.paymentResult = {
          id: paymentIntent.id,
          status: paymentIntent.status,
          update_time: new Date().toISOString(),
          email_address: paymentIntent.receipt_email,
        };
        
        await order.save();
        console.log(`✅ Order ${orderId} marked as paid via webhook`);
      }
    }
  } catch (error) {
    console.error('❌ Error handling payment_intent.succeeded:', error);
  }
};

const handlePaymentIntentFailed = async (paymentIntent) => {
  try {
    const orderId = paymentIntent.metadata.orderId;
    console.error(`❌ Payment failed for order ${orderId}:`, paymentIntent.last_payment_error?.message);
  } catch (error) {
    console.error('❌ Error handling payment_intent.failed:', error);
  }
};

module.exports = router;