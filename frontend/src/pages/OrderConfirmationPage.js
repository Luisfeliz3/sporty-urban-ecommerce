// frontend/src/pages/OrderConfirmationPage.jsx
import React, { useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getOrderDetails } from '../store/slices/orderSlice';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentIcon from '@mui/icons-material/Payment';

const OrderConfirmationPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { order, loading, error } = useSelector((state) => state.order);
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }
    
    if (id) {
      dispatch(getOrderDetails(id));
    }
  }, [dispatch, id, userInfo, navigate]);

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={() => navigate('/products')} sx={{ mt: 2 }}>
          Continue Shopping
        </Button>
      </Container>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Success Header */}
      <Paper sx={{ p: 4, mb: 4, textAlign: 'center', bgcolor: '#f0fdf4' }}>
        <CheckCircleIcon sx={{ fontSize: 64, color: '#22c55e', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Thank You for Your Order!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your order has been placed successfully. Order #{order._id?.slice(-8)}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Button 
            variant="contained" 
            onClick={() => navigate('/products')}
            sx={{ mr: 2 }}
          >
            Continue Shopping
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/profile/orders')}
          >
            View All Orders
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Order Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Status
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PaymentIcon sx={{ mr: 1, color: order.isPaid ? '#22c55e' : '#eab308' }} />
                <Typography>
                  Payment: {order.isPaid ? '✓ Paid' : 'Pending'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocalShippingIcon sx={{ mr: 1, color: order.isDelivered ? '#22c55e' : '#eab308' }} />
                <Typography>
                  Shipping: {order.isDelivered ? 'Delivered' : 'Processing'}
                </Typography>
              </Box>
              {order.paidAt && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Paid on: {new Date(order.paidAt).toLocaleString()}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Shipping Address */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Shipping Address
              </Typography>
              <Typography>
                {order.shippingAddress?.street}<br />
                {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}<br />
                {order.shippingAddress?.country}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Order Items */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Items
              </Typography>
              {order.orderItems?.map((item, index) => (
                <Box key={index}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
                      />
                      <Box>
                        <Typography variant="body1">{item.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Size: {item.size} | Color: {item.color} | Qty: {item.quantity}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body1" fontWeight="medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  </Box>
                  {index < order.orderItems.length - 1 && <Divider />}
                </Box>
              ))}
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Box sx={{ width: 300 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Subtotal:</Typography>
                    <Typography>${order.itemsPrice?.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Shipping:</Typography>
                    <Typography>${order.shippingPrice?.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Tax:</Typography>
                    <Typography>${order.taxPrice?.toFixed(2)}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6">Total:</Typography>
                    <Typography variant="h6" color="#4f46e5">
                      ${order.totalPrice?.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Next Steps */}
        <Grid item xs={12}>
          <Alert severity="info">
            <Typography variant="subtitle2" gutterBottom>
              What's Next?
            </Typography>
            <Typography variant="body2">
              1. You'll receive a confirmation email shortly<br />
              2. We'll notify you when your order ships<br />
              3. Track your order from your profile page
            </Typography>
          </Alert>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OrderConfirmationPage;