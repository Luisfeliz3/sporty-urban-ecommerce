

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [{
    name: String,
    quantity: Number,
    price: Number,
    size: String,
    color: String,
    image: String,
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }
  }],
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  paymentMethod: {
    type: String,
    required: true
  },
  paymentResult: {
    id: String, // Stripe payment intent ID
    status: String,
    update_time: String,
    email_address: String,
  },
  // Stripe-specific fields
  stripePaymentIntentId: String,
  stripeCustomerId: String,
  stripePaymentMethod: String,
  
  itemsPrice: {
    type: Number,
    required: true
  },
  taxPrice: {
    type: Number,
    required: true
  },
  shippingPrice: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);