import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  CheckCircle,
  LocalShipping,
  Payment,
  Receipt,
  Print,
  KeyboardArrowDown,
  KeyboardArrowUp,
  ShoppingBag,
} from '@mui/icons-material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getOrderDetails, resetOrderState } from '../store/slices/orderSlice';
import no_image_avl from "../images/no_images.jpeg";

// Order Timeline Component
const OrderTimeline = ({ order }) => {
  const steps = [
    {
      label: 'Order Placed',
      description: `Your order has been received`,
      completed: true,
      date: order.createdAt,
    },
    {
      label: 'Payment Confirmed',
      description: `Payment has been processed successfully`,
      completed: order.isPaid,
      date: order.paidAt,
    },
    {
      label: 'Order Processed',
      description: `Your order is being prepared for shipping`,
      completed: order.isPaid,
      date: null,
    },
    {
      label: 'Shipped',
      description: `Your order has been shipped`,
      completed: order.isDelivered,
      date: order.deliveredAt,
    },
    {
      label: 'Delivered',
      description: `Your order has been delivered`,
      completed: order.isDelivered,
      date: order.deliveredAt,
    },
  ];

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Order Timeline
      </Typography>
      <Stepper orientation="vertical" activeStep={steps.findIndex(step => !step.completed) - 1}>
        {steps.map((step, index) => (
          <Step key={step.label} completed={step.completed}>
            <StepLabel
              StepIconProps={{
                completed: step.completed,
              }}
            >
              <Typography variant="subtitle2">{step.label}</Typography>
              <Typography variant="caption" color="text.secondary">
                {step.description}
              </Typography>
              {step.date && (
                <Typography variant="caption" display="block" color="primary">
                  {new Date(step.date).toLocaleString()}
                </Typography>
              )}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Paper>
  );
};

// Order Item Row Component
const OrderItemRow = ({ item }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow hover>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <img
              src={item.image || no_image_avl}
              alt={item.name}
              style={{
                width: 80,
                height: 80,
                objectFit: 'cover',
                borderRadius: 8,
              }}
              onError={(e) => {
                e.target.src = no_image_avl;
              }}
            />
            <Box>
              <Typography variant="subtitle1" fontWeight="medium">
                {item.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Product ID: {item.product}
              </Typography>
              {item.size && item.size !== 'N/A' && (
                <Typography variant="body2" color="text.secondary">
                  Size: {item.size}
                </Typography>
              )}
              {item.color && item.color !== 'N/A' && (
                <Typography variant="body2" color="text.secondary">
                  Color: {item.color}
                </Typography>
              )}
            </Box>
          </Box>
        </TableCell>
        <TableCell align="center">{item.quantity}</TableCell>
        <TableCell align="right">${item.price?.toFixed(2)}</TableCell>
        <TableCell align="right">
          <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
            ${(item.quantity * item.price).toFixed(2)}
          </Typography>
        </TableCell>
      </TableRow>
    </>
  );
};

const OrderDetailsPage = () => {
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
      console.log('Fetching order details for ID:', id);
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
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading order details...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/orders')}>
              Back to Orders
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Order not found
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/orders')}
          sx={{ mt: 2 }}
        >
          Back to My Orders
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Order Details
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Order #{order._id}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mt: { xs: 2, sm: 0 } }}>
          <Button
            variant="outlined"
            startIcon={<Print />}
            onClick={handlePrint}
          >
            Print
          </Button>
          <Button
            variant="outlined"
            component={Link}
            to="/orders"
            startIcon={<Receipt />}
          >
            All Orders
          </Button>
          <Button
            variant="contained"
            component={Link}
            to="/products"
            startIcon={<ShoppingBag />}
          >
            Shop More
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Order Status Summary */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: order.isPaid ? '#f0fdf4' : '#fefce8' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Payment color={order.isPaid ? 'success' : 'warning'} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Payment Status
                    </Typography>
                    <Chip
                      label={order.isPaid ? 'Paid' : 'Pending'}
                      color={order.isPaid ? 'success' : 'warning'}
                      size="small"
                    />
                    {order.paidAt && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        {new Date(order.paidAt).toLocaleString()}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocalShipping color={order.isDelivered ? 'success' : 'action'} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Delivery Status
                    </Typography>
                    <Chip
                      label={order.isDelivered ? 'Delivered' : 'Processing'}
                      color={order.isDelivered ? 'success' : 'info'}
                      size="small"
                    />
                    {order.deliveredAt && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        {new Date(order.deliveredAt).toLocaleString()}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                  <Typography variant="body2" color="text.secondary">
                    Total Amount
                  </Typography>
                  <Typography variant="h5" color="primary.main" fontWeight="bold">
                    ${order.totalPrice?.toFixed(2)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Order Timeline */}
        <Grid item xs={12} md={5}>
          <OrderTimeline order={order} />
        </Grid>

        {/* Shipping Information */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Shipping Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body1">
                  <strong>Shipping Address:</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.shippingAddress?.street}<br />
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}<br />
                  {order.shippingAddress?.country}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1">
                  <strong>Payment Method:</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.paymentMethod}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Order Items */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Items ({order.orderItems?.length || 0})
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
                    <OrderItemRow key={index} item={item} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Divider sx={{ my: 3 }} />

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
          </Paper>
        </Grid>

        {/* Payment Details (if paid) */}
        {order.isPaid && order.paymentResult && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, bgcolor: '#f0fdf4' }}>
              <Typography variant="h6" gutterBottom color="success.main">
                ✓ Payment Confirmed
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Transaction ID:
                  </Typography>
                  <Typography variant="body2">
                    {order.paymentResult.id}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Payment Date:
                  </Typography>
                  <Typography variant="body2">
                    {new Date(order.paidAt).toLocaleString()}
                  </Typography>
                </Grid>
                {order.paymentResult.email_address && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Receipt sent to:
                    </Typography>
                    <Typography variant="body2">
                      {order.paymentResult.email_address}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>
        )}

        {/* Help Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: '#f8fafc' }}>
            <Typography variant="h6" gutterBottom>
              Need Help?
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              If you have any questions about your order, please contact our customer support.
            </Typography>
            <Button variant="outlined" size="small">
              Contact Support
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OrderDetailsPage;