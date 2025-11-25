import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Button,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Grid,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createOrder } from '../store/slices/orderSlice';
import { createPaymentIntent } from '../store/slices/stripeSlice';
import { clearCart, clearCartLocal } from '../store/slices/cartSlice';
import StripePayment from '../components/Payments/StripePayment';
import defaultTshirt from "../components/Product/defaultTshirt.png"

const steps = ['Shipping', 'Payment', 'Place Order'];

const PlaceOrderPage = () => {
  const [showStripePayment, setShowStripePayment] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [localError, setLocalError] = useState('');

  const { cartItems, shippingAddress, paymentMethod } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  const { order, loading, error, success } = useSelector((state) => state.order);
  const { loading: stripeLoading } = useSelector((state) => state.stripe);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Calculate prices
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const taxPrice = itemsPrice * 0.08;
  const shippingPrice = itemsPrice > 50 ? 0 : 10;
  const totalPrice = itemsPrice + taxPrice + shippingPrice;


  const placeOrderHandler = async () => {
    if (!userInfo) {
      navigate('/login?redirect=placeorder');
      return;
    }


const orderData = {
      orderItems: cartItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        color: item.color,
        image: item.image,
        product: item.product,
      })),
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    };

    try {
      // Create order first
      const result = await dispatch(createOrder(orderData)).unwrap();
      setCreatedOrder(result);

      if (paymentMethod === 'Credit Card') {
        // Show Stripe payment for credit card payments
        setShowStripePayment(true);
        
        // Create payment intent
        await dispatch(createPaymentIntent({
          orderId: result._id,
          savePaymentMethod: false // You can make this configurable
        })).unwrap();
      } else {
        // For other payment methods, just clear cart and redirect
        dispatch(clearCartLocal());
        navigate(`/order/${result._id}`);
      }
    } catch (error) {
      console.error('Order creation error:', error);
    }
  };



  useEffect(() => {
    if (!userInfo) {
      navigate('/login?redirect=placeorder');
      return;
    }

    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }

    if (!shippingAddress || !shippingAddress.street) {
      navigate('/shipping');
      return;
    }

    if (!paymentMethod) {
      navigate('/payment');
      return;
    }
  }, [userInfo, cartItems, shippingAddress, paymentMethod, navigate]);

  useEffect(() => {
    if (success && order && !showStripePayment) {
      // For non-credit card payments, redirect immediately
      if (paymentMethod !== 'Credit Card') {
        dispatch(clearCartLocal());
        navigate(`/order/${order._id}`);
      }
    }
  }, [success, order, showStripePayment, paymentMethod, navigate, dispatch]);

  // const placeOrderHandler = async () => {
  //   try {
  //     setLocalError('');

  //     // Validation
  //     if (!shippingAddress || !shippingAddress.street) {
  //       setLocalError('Please complete shipping information');
  //       navigate('/shipping');
  //       return;
  //     }

  //     if (!paymentMethod) {
  //       setLocalError('Please select a payment method');
  //       navigate('/payment');
  //       return;
  //     }

  //     if (cartItems.length === 0) {
  //       setLocalError('Your cart is empty');
  //       navigate('/cart');
  //       return;
  //     }

  //     const orderData = {
  //       orderItems: cartItems.map(item => ({
  //         name: item.name,
  //         quantity: item.quantity,
  //         price: item.price,
  //         size: item.size,
  //         color: item.color,
  //         image: item.image,
  //         product: item.product,
  //       })),
  //       shippingAddress,
  //       paymentMethod,
  //       itemsPrice,
  //       taxPrice,
  //       shippingPrice,
  //       totalPrice,
  //     };

  //     console.log('📦 Creating order with data:', orderData);

  //     // Create order first
  //     const result = await dispatch(createOrder(orderData)).unwrap();
  //     setCreatedOrder(result);

  //     if (paymentMethod === 'Credit Card') {
  //       // Show Stripe payment for credit card payments
  //       setShowStripePayment(true);
        
  //       // Create payment intent
  //       await dispatch(createPaymentIntent({
  //         orderId: result._id,
  //         savePaymentMethod: false
  //       })).unwrap();
  //     } else {
  //       // For other payment methods, just clear cart and redirect
  //       dispatch(clearCartLocal());
  //       navigate(`/order/${result._id}`);
  //     }
  //   } catch (error) {
  //     console.error('Order creation error:', error);
  //     setLocalError(error || 'Failed to create order. Please try again.');
  //   }
  // };

  const handlePaymentSuccess = (order) => {
    console.log('✅ Payment successful for order:', order._id);
    setShowStripePayment(false);
    dispatch(clearCartLocal());
    navigate(`/order/${order._id}`);
  };

  const handlePaymentClose = () => {
    setShowStripePayment(false);
    // Optionally: cancel the order if payment is cancelled
  };

  if (cartItems.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Your Cart is Empty
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/products')}
          sx={{ mt: 2 }}
        >
          Continue Shopping
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stepper activeStep={2} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Typography variant="h4" component="h1" gutterBottom>
        Review Order
      </Typography>

      {(error || localError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || localError}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Order Details */}
        <Grid item xs={12} md={8}>
          {/* Shipping Address */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Shipping Address
              </Typography>
              {shippingAddress ? (
                <>
                  <Typography>
                    {shippingAddress.street}<br />
                    {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}<br />
                    {shippingAddress.country}
                  </Typography>
                  <Button 
                    variant="text" 
                    onClick={() => navigate('/shipping')}
                    sx={{ mt: 1 }}
                  >
                    Edit
                  </Button>
                </>
              ) : (
                <Typography color="text.secondary">
                  No shipping address provided
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment Method
              </Typography>
              <Typography>{paymentMethod || 'No payment method selected'}</Typography>
              <Button 
                variant="text" 
                onClick={() => navigate('/payment')}
                sx={{ mt: 1 }}
              >
                Edit
              </Button>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Items ({cartItems.length})
              </Typography>
              {cartItems.map((item, index) => (
                <Box key={`${item.product}-${item.size}-${item.color}`}>
                  <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: 60,
                        height: 60,
                        objectFit: 'cover',
                        borderRadius: 4,
                        marginRight: 16,
                      }}
                      onError={(e) => {
                        e.target.src = {defaultTshirt};
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" fontWeight="medium">
                        {item.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Size: {item.size} | Color: {item.color}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ${item.price} each
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="medium">
                      {item.quantity} x ${item.price} = ${(item.quantity * item.price).toFixed(2)}
                    </Typography>
                  </Box>
                  {index < cartItems.length - 1 && <Divider />}
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Items ({cartItems.length}):</Typography>
                <Typography>${itemsPrice.toFixed(2)}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Shipping:</Typography>
                <Typography>
                  {shippingPrice === 0 ? 'FREE' : `$${shippingPrice.toFixed(2)}`}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Tax:</Typography>
                <Typography>${taxPrice.toFixed(2)}</Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6">${totalPrice.toFixed(2)}</Typography>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={placeOrderHandler}
                disabled={loading || stripeLoading || !shippingAddress?.street || !paymentMethod}
                sx={{ py: 1.5 }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : stripeLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  `Place Order - $${totalPrice.toFixed(2)}`
                )}
              </Button>

              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                By placing your order, you agree to our Terms of Service and Privacy Policy
              </Typography>

              {itemsPrice < 50 && shippingPrice > 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Add ${(50 - itemsPrice).toFixed(2)} more for free shipping!
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Order Security Info */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Box component="span" sx={{ color: 'success.main' }}>
                  🔒 Secure Checkout
                </Box>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your payment information is encrypted and secure. 
                {paymentMethod === 'Credit Card' && ' We use Stripe for secure payment processing.'}
              </Typography>
            </CardContent>
          </Card>

          {/* Continue Shopping */}
          <Button
            fullWidth
            variant="outlined"
            onClick={() => navigate('/products')}
            sx={{ mt: 2 }}
          >
            Continue Shopping
          </Button>
        </Grid>
      </Grid>

      {/* Stripe Payment Dialog */}
      <StripePayment
        open={showStripePayment}
        onClose={handlePaymentClose}
        order={createdOrder}
        onSuccess={handlePaymentSuccess}
      />

      {/* Debug Info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            Debug Information
          </Typography>
          <Typography variant="body2">
            Cart Items: {cartItems.length}<br />
            Shipping Address: {shippingAddress ? 'Set' : 'Not Set'}<br />
            Payment Method: {paymentMethod || 'Not Set'}<br />
            User: {userInfo ? userInfo.name : 'Not Logged In'}<br />
            Order Created: {createdOrder ? 'Yes' : 'No'}<br />
            Stripe Payment Open: {showStripePayment ? 'Yes' : 'No'}
          </Typography>
        </Box>
      )}

            <Button
        fullWidth
        variant="contained"
        size="large"
        onClick={placeOrderHandler}
        disabled={loading || stripeLoading || !shippingAddress || !paymentMethod}
      >
        {loading ? 'Placing Order...' : `Place Order - $${totalPrice.toFixed(2)}`}
      </Button>

      {/* Stripe Payment Dialog */}
      <StripePayment
        open={showStripePayment}
        onClose={() => setShowStripePayment(false)}
        order={createdOrder}
        onSuccess={handlePaymentSuccess}
      />
    </Container>
  );
};

export default PlaceOrderPage;