import React, { useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Alert,
} from '@mui/material';
import { CheckCircle, ShoppingBag } from '@mui/icons-material';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getOrderDetails } from '../store/slices/orderSlice';

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const { order, loading, error } = useSelector((state) => state.order);

  useEffect(() => {
    if (orderId) {
      dispatch(getOrderDetails(orderId));
    }
  }, [orderId, dispatch]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography>Loading order details...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
        
        <Typography variant="h4" component="h1" gutterBottom color="success.main">
          Order Confirmed!
        </Typography>
        
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Thank you for your purchase
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3 }}>
          Your order #{order?._id} has been successfully processed.
          {order?.isPaid && ' Payment has been confirmed.'}
        </Typography>

        {order && (
          <Card sx={{ mt: 3, textAlign: 'left' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Order Total:</Typography>
                <Typography variant="h6">${order.totalPrice?.toFixed(2)}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Payment Method:</Typography>
                <Typography>{order.paymentMethod}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography>Status:</Typography>
                <Typography color={order.isPaid ? 'success.main' : 'warning.main'}>
                  {order.isPaid ? 'Paid' : 'Pending Payment'}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" color="text.secondary">
                A confirmation email has been sent to your email address.
                You can track your order in your profile.
              </Typography>
            </CardContent>
          </Card>
        )}

        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            component={Link}
            to="/products"
            startIcon={<ShoppingBag />}
          >
            Continue Shopping
          </Button>
          <Button
            variant="contained"
            component={Link}
            to="/profile"
          >
            View Orders
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default OrderSuccessPage;