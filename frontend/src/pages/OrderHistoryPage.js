import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  IconButton,
  Collapse,
  Divider,
} from '@mui/material';
import {
  Visibility,
  KeyboardArrowDown,
  KeyboardArrowUp,
  LocalShipping,
  Payment,
  CheckCircle,
  Pending,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../store/slices/orderSlice';
import no_image_avl from "../images/no_images.jpeg";

// Order Items Table Component for Desktop Expandable View
const OrderItemsTable = ({ items }) => {
  return (
    <Table size="small">
      <TableHead>
        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
          <TableCell>Product</TableCell>
          <TableCell align="center">Size</TableCell>
          <TableCell align="center">Color</TableCell>
          <TableCell align="center">Quantity</TableCell>
          <TableCell align="right">Price</TableCell>
          <TableCell align="right">Total</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {items.map((item, idx) => (
          <TableRow key={idx}>
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <img
                  src={item.image || no_image_avl}
                  alt={item.name}
                  style={{
                    width: 50,
                    height: 50,
                    objectFit: 'cover',
                    borderRadius: 4,
                  }}
                  onError={(e) => {
                    e.target.src = no_image_avl;
                  }}
                />
                <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                  {item.name}
                </Typography>
              </Box>
            </TableCell>
            <TableCell align="center">{item.size || 'N/A'}</TableCell>
            <TableCell align="center">{item.color || 'N/A'}</TableCell>
            <TableCell align="center">{item.quantity}</TableCell>
            <TableCell align="right">${item.price?.toFixed(2)}</TableCell>
            <TableCell align="right">
              <Typography fontWeight="bold">
                ${(item.quantity * item.price).toFixed(2)}
              </Typography>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

// Order Row Component for Desktop View
const OrderRow = ({ order, isExpanded, onToggle }) => {
  return (
    <>
      <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell padding="checkbox">
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={onToggle}
          >
            {isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Typography variant="body2" fontWeight="medium">
            #{order._id?.slice(-8)}
          </Typography>
        </TableCell>
        <TableCell>
          {new Date(order.createdAt).toLocaleDateString()}
        </TableCell>
        <TableCell>{order.orderItems?.length || 0} items</TableCell>
        <TableCell align="right">
          <Typography fontWeight="bold">
            ${order.totalPrice?.toFixed(2)}
          </Typography>
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', gap: 0.5, flexDirection: 'column' }}>
            <Chip
              label={order.isPaid ? 'Paid' : 'Pending'}
              color={order.isPaid ? 'success' : 'warning'}
              size="small"
              icon={order.isPaid ? <CheckCircle /> : <Pending />}
            />
            {order.isDelivered && (
              <Chip
                label="Delivered"
                color="info"
                size="small"
                icon={<LocalShipping />}
              />
            )}
          </Box>
        </TableCell>
        <TableCell align="center">
          <Button
            variant="outlined"
            size="small"
            component={Link}
            to={`/order/${order._id}`}
            startIcon={<Visibility />}
          >
            View Details
          </Button>
        </TableCell>
      </TableRow>
      {/* Expandable Row for Order Items */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Order Items
              </Typography>
              <OrderItemsTable items={order.orderItems} />
              
              {/* Order Summary in Expanded View */}
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Box sx={{ width: 300, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                    Order Summary
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Subtotal:</Typography>
                    <Typography variant="body2">${order.itemsPrice?.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Shipping:</Typography>
                    <Typography variant="body2">
                      {order.shippingPrice === 0 ? 'FREE' : `$${order.shippingPrice?.toFixed(2)}`}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Tax:</Typography>
                    <Typography variant="body2">${order.taxPrice?.toFixed(2)}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2" fontWeight="bold">Total:</Typography>
                    <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
                      ${order.totalPrice?.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

// Order Card Component for Mobile View
const OrderCard = ({ order }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Order #{order._id?.slice(-8)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(order.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
          <Chip
            label={order.isPaid ? 'Paid' : 'Pending'}
            color={order.isPaid ? 'success' : 'warning'}
            size="small"
          />
        </Box>

        <Divider sx={{ my: 1 }} />

        <Box sx={{ mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Items: {order.orderItems?.length || 0}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total: ${order.totalPrice?.toFixed(2)}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
          <Payment fontSize="small" color={order.isPaid ? 'success' : 'warning'} />
          <Typography variant="caption">
            {order.isPaid ? `Paid on ${new Date(order.paidAt).toLocaleDateString()}` : 'Payment pending'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
          <LocalShipping fontSize="small" color={order.isDelivered ? 'success' : 'action'} />
          <Typography variant="caption">
            {order.isDelivered ? `Delivered on ${new Date(order.deliveredAt).toLocaleDateString()}` : 'Processing'}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          size="small"
          fullWidth
          component={Link}
          to={`/order/${order._id}`}
          startIcon={<Visibility />}
        >
          View Order Details
        </Button>

        <Button
          variant="text"
          size="small"
          fullWidth
          onClick={() => setExpanded(!expanded)}
          sx={{ mt: 1 }}
        >
          {expanded ? 'Hide Items' : 'Show Items'} ({order.orderItems?.length})
        </Button>

        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            {order.orderItems?.map((item, idx) => (
              <Box key={idx} sx={{ display: 'flex', gap: 2, py: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                <img
                  src={item.image || no_image_avl}
                  alt={item.name}
                  style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                  onError={(e) => {
                    e.target.src = no_image_avl;
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" noWrap>{item.name}</Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Size: {item.size || 'N/A'} | Color: {item.color || 'N/A'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.quantity} x ${item.price?.toFixed(2)} = ${(item.quantity * item.price).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

const OrderHistoryPage = () => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.order);
  const { userInfo } = useSelector((state) => state.auth);
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    if (!userInfo) {
      return;
    }
    dispatch(getMyOrders());
  }, [dispatch, userInfo]);

  const handleRowToggle = (orderId) => {
    setExpandedRows(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  if (!userInfo) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Please Login to View Your Orders
        </Typography>
        <Button variant="contained" component={Link} to="/login">
          Login
        </Button>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading your orders...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          No Orders Yet
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          You haven't placed any orders yet. Start shopping to see your orders here!
        </Typography>
        <Button variant="contained" component={Link} to="/products">
          Start Shopping
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Orders
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        You have {orders.length} {orders.length === 1 ? 'order' : 'orders'} in total
      </Typography>

      {/* Desktop View */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell padding="checkbox"></TableCell>
                <TableCell>Order ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Items</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <OrderRow
                  key={order._id}
                  order={order}
                  isExpanded={expandedRows[order._id] || false}
                  onToggle={() => handleRowToggle(order._id)}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Mobile View */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {orders.map((order) => (
          <OrderCard key={order._id} order={order} />
        ))}
      </Box>
    </Container>
  );
};

export default OrderHistoryPage;