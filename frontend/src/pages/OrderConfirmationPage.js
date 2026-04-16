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
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getOrderDetails, resetOrderState } from '../store/slices/orderSlice';
import { clearCartLocal } from '../store/slices/cartSlice';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PrintIcon from '@mui/icons-material/Print';
import no_image_avl from "../images/no_images.jpeg";

const OrderConfirmationPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { order, loading, error } = useSelector((state) => state.order);
  const { userInfo } = useSelector((state) => state.auth);

 useEffect(() => {
    // Clear cart when order confirmation page loads
    console.log('Clearing cart on order confirmation page');
    dispatch(clearCartLocal());
    localStorage.removeItem('cartItems');
    
    // Optionally clear other stored data
    // localStorage.removeItem('shippingAddress');
    // localStorage.removeItem('paymentMethod');
  }, [dispatch]);

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }
    
    if (id) {
      console.log('Fetching order confirmation for ID:', id);
      dispatch(getOrderDetails(id));
    }

    // Cleanup order state when component unmounts
    return () => {
      dispatch(resetOrderState());
    };
  }, [dispatch, id, userInfo, navigate]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading order confirmation...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/orders')}>
              View My Orders
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="warning">
          Order not found
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/orders')}
          sx={{ mt: 2 }}
        >
          View My Orders
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Success Header */}
      <Paper sx={{ p: 4, mb: 4, textAlign: 'center', bgcolor: '#f0fdf4' }}>
        <CheckCircleIcon sx={{ fontSize: 64, color: '#22c55e', mb: 2 }} />
        <Typography variant="h4" gutterBottom color="success.main">
          Thank You for Your Order!
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Your order has been placed successfully
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Order #{order._id?.slice(-8)}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Placed on {new Date(order.createdAt).toLocaleString()}
        </Typography>
        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            onClick={() => navigate('/products')}
            startIcon={<ShoppingBagIcon />}
          >
            Continue Shopping
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/orders')}
            startIcon={<ReceiptIcon />}
          >
            View All Orders
          </Button>
          <Button 
            variant="outlined" 
            onClick={handlePrint}
            startIcon={<PrintIcon />}
          >
            Print Receipt
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Order Status Cards */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PaymentIcon sx={{ mr: 1, color: order.isPaid ? '#22c55e' : '#eab308' }} />
                <Typography variant="h6">Payment Status</Typography>
              </Box>
              <Chip
                label={order.isPaid ? 'Paid ✓' : 'Pending'}
                color={order.isPaid ? 'success' : 'warning'}
                sx={{ mb: 1 }}
              />
              {order.paidAt && (
                <Typography variant="caption" display="block" color="text.secondary">
                  Paid on: {new Date(order.paidAt).toLocaleString()}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocalShippingIcon sx={{ mr: 1, color: order.isDelivered ? '#22c55e' : '#eab308' }} />
                <Typography variant="h6">Shipping Status</Typography>
              </Box>
              <Chip
                label={order.isDelivered ? 'Delivered' : 'Processing'}
                color={order.isDelivered ? 'success' : 'info'}
                sx={{ mb: 1 }}
              />
              {order.deliveredAt && (
                <Typography variant="caption" display="block" color="text.secondary">
                  Delivered on: {new Date(order.deliveredAt).toLocaleString()}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', bgcolor: '#f8fafc' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary.main">
                Order Total
              </Typography>
              <Typography variant="h3" fontWeight="bold" color="primary.main">
                ${order.totalPrice?.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {order.orderItems?.length || 0} item(s) in order
              </Typography>
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
              <Typography variant="body2" color="text.secondary">
                {order.shippingAddress?.street}<br />
                {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}<br />
                {order.shippingAddress?.country}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Method */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment Method
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {order.paymentMethod}
              </Typography>
              {order.isPaid && order.paymentResult && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" color="text.secondary" display="block">
                    Transaction ID: {order.paymentResult.id?.slice(-8)}
                  </Typography>
                </>
              )}
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
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="center">Quantity</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.orderItems?.map((item, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <img
                              src={item.image || no_image_avl}
                              alt={item.name}
                              style={{
                                width: 60,
                                height: 60,
                                objectFit: 'cover',
                                borderRadius: 4,
                              }}
                              onError={(e) => {
                                e.target.src = no_image_avl;
                              }}
                            />
                            <Box>
                              <Typography variant="body1" fontWeight="medium">
                                {item.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Size: {item.size || 'N/A'} | Color: {item.color || 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">
                            {item.quantity}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            ${item.price?.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold" color="primary.main">
                            ${(item.quantity * item.price).toFixed(2)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Divider sx={{ my: 2 }} />

              {/* Order Summary */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Box sx={{ width: { xs: '100%', sm: 300 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Subtotal:
                    </Typography>
                    <Typography variant="body2">
                      ${order.itemsPrice?.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Shipping:
                    </Typography>
                    <Typography variant="body2">
                      {order.shippingPrice === 0 ? 'FREE' : `$${order.shippingPrice?.toFixed(2)}`}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Tax:
                    </Typography>
                    <Typography variant="body2">
                      ${order.taxPrice?.toFixed(2)}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="h6" fontWeight="bold">
                      Total:
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="primary.main">
                      ${order.totalPrice?.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Next Steps / What's Next */}
        <Grid item xs={12}>
          <Alert severity="info" sx={{ bgcolor: '#f0f9ff' }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              What's Next?
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2">
                  <strong>1.</strong> We'll process your order within 24 hours
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2">
                  <strong>2.</strong> You'll receive a shipping confirmation email
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2">
                  <strong>3.</strong> Track your order from your profile
                </Typography>
              </Grid>
            </Grid>
          </Alert>
        </Grid>

        {/* Need Help Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8fafc' }}>
            <Typography variant="body2" color="text.secondary">
              Have questions about your order? Contact our customer support team at{' '}
              <strong>support@emwholesales.com</strong> or call{' '}
              <strong>1-800-XXX-XXXX</strong>
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .MuiContainer-root {
            padding: 0;
            margin: 0;
            max-width: 100%;
          }
          .MuiButton-root {
            display: none;
          }
          .MuiAlert-root {
            display: none;
          }
          .MuiPaper-root {
            box-shadow: none;
            border: 1px solid #ddd;
          }
        }
      `}</style>
    </Container>
  );
};

export default OrderConfirmationPage;