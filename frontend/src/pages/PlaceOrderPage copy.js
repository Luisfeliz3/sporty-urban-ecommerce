import React, { useState,useNavigate } from 'react';
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
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { createOrder } from '../store/slices/orderSlice';
import { createPaymentIntent } from '../store/slices/stripeSlice';
import { clearCart } from '../store/slices/cartSlice';
import StripePayment from '../components/Payment/StripePayment';

const PlaceOrderPage = () => {
  const [showStripePayment, setShowStripePayment] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

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
        dispatch(clearCart());
        navigate(`/order/${result._id}`);
      }
    } catch (error) {
      console.error('Order creation error:', error);
    }
  };

  const handlePaymentSuccess = (order) => {
    setShowStripePayment(false);
    dispatch(clearCart());
    navigate(`/order/${order._id}`);
  };

  // Redirect on success
  React.useEffect(() => {
    if (success && order) { // Check if order exists
      // Clear cart and redirect to order success page
      dispatch(clearCart());
      navigate(`/order/${order._id}`);
    }
  }, [success, order, navigate, dispatch]);

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* ... existing JSX ... */}

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