import React, { useState, useCallback, useEffect } from 'react';
import { debounce } from 'lodash';
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Chip,
  Alert,
  Divider,
  Tooltip,
} from '@mui/material';
import { Delete, Add, Remove, ShoppingBag, LocalOffer, Info } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  removeFromCartLocal,
  removeFromCartServer,
  updateCartItemQuantityLocal,
  updateCartItemQuantityServer,
  syncCartWithServer,
} from '../store/slices/cartSlice';
import no_image_avl from "../images/no_images.jpeg";

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems, loading } = useSelector((state) => state.cart);
  const [updatingItems, setUpdatingItems] = useState({});
  const [stockErrors, setStockErrors] = useState({});

  // Sync cart when component mounts and user is logged in
  useEffect(() => {
    if (userInfo) {
      dispatch(syncCartWithServer());
    }
  }, [dispatch, userInfo]);

  // Debounced update function
  const debouncedUpdateQuantity = useCallback(
    debounce((productId, size, color, quantity, itemName) => {
      if (userInfo) {
        dispatch(updateCartItemQuantityServer({
          productId,
          size,
          color,
          quantity
        })).catch((error) => {
          setStockErrors(prev => ({
            ...prev,
            [`${productId}_${size}_${color}`]: error.message || 'Failed to update quantity'
          }));
          setTimeout(() => {
            setStockErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors[`${productId}_${size}_${color}`];
              return newErrors;
            });
          }, 3000);
        });
      } else {
        dispatch(updateCartItemQuantityLocal({
          productId,
          size,
          color,
          quantity
        }));
      }
      setUpdatingItems(prev => ({ ...prev, [`${productId}_${size}_${color}`]: false }));
    }, 300),
    [dispatch, userInfo]
  );
  
  const handleUpdateQuantity = (item, newQuantity) => {
    const itemKey = `${item.product}_${item.size}_${item.color}`;
    
    // Check max quantity (limit to 99)
    if (newQuantity > 99) {
      setStockErrors(prev => ({
        ...prev,
        [itemKey]: 'Maximum 99 items per order'
      }));
      setTimeout(() => {
        setStockErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[itemKey];
          return newErrors;
        });
      }, 3000);
      return;
    }
    
    // Check inventory limit
    if (item.inventory && newQuantity > item.inventory) {
      setStockErrors(prev => ({
        ...prev,
        [itemKey]: `Only ${item.inventory} items available in stock`
      }));
      setTimeout(() => {
        setStockErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[itemKey];
          return newErrors;
        });
      }, 3000);
      return;
    }
    
    // Prevent multiple updates
    if (updatingItems[itemKey]) return;
    
    setUpdatingItems(prev => ({ ...prev, [itemKey]: true }));
    
    if (newQuantity <= 0) {
      if (userInfo) {
        dispatch(removeFromCartServer({
          productId: item.product,
          size: item.size,
          color: item.color
        })).finally(() => {
          setUpdatingItems(prev => ({ ...prev, [itemKey]: false }));
        });
      } else {
        dispatch(removeFromCartLocal({
          productId: item.product,
          size: item.size,
          color: item.color
        }));
        setUpdatingItems(prev => ({ ...prev, [itemKey]: false }));
      }
    } else {
      debouncedUpdateQuantity(item.product, item.size, item.color, newQuantity, item.name);
    }
  };

  const removeFromCartHandler = useCallback(async (productId, size, color) => {
    const itemKey = `${productId}_${size}_${color}`;
    setUpdatingItems(prev => ({ ...prev, [itemKey]: true }));
    
    try {
      if (userInfo) {
        await dispatch(removeFromCartServer({ productId, size, color })).unwrap();
      } else {
        dispatch(removeFromCartLocal({ productId, size, color }));
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      setStockErrors(prev => ({
        ...prev,
        [itemKey]: 'Failed to remove item'
      }));
      setTimeout(() => {
        setStockErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[itemKey];
          return newErrors;
        });
      }, 3000);
    } finally {
      setUpdatingItems(prev => ({ ...prev, [itemKey]: false }));
    }
  }, [dispatch, userInfo]);

  // Safely calculate totals with validation
  const calculateTotals = useCallback(() => {
    if (!cartItems || cartItems.length === 0) {
      return { subtotal: 0, tax: 0, shipping: 0, total: 0, itemCount: 0 };
    }

    const subtotal = cartItems.reduce((acc, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return acc + (price * quantity);
    }, 0);

    const itemCount = cartItems.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
    const tax = subtotal * 0.08;
    const shipping = subtotal > 50 ? 0 : 10;
    const total = subtotal + tax + shipping;

    return { subtotal, tax, shipping, total, itemCount };
  }, [cartItems]);

  const { subtotal, tax, shipping, total, itemCount } = calculateTotals();

  const checkoutHandler = () => {
    if (!userInfo) {
      navigate('/login?redirect=shipping');
    } else {
      navigate('/shipping');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading your cart...
        </Typography>
      </Container>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Box sx={{ mb: 4 }}>
          <ShoppingBag sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Your Cart is Empty
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Looks like you haven't added any items to your cart yet.
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/products"
            size="large"
          >
            Start Shopping
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Product Details</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Price</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cartItems.map((item) => {
                  const price = Number(item.price) || 0;
                  const quantity = Number(item.quantity) || 0;
                  const itemSubtotal = price * quantity;
                  const itemKey = `${item.product}_${item.size}_${item.color}`;
                  const isUpdating = updatingItems[itemKey];
                  const stockError = stockErrors[itemKey];
                  const isLowStock = item.inventory && item.inventory <= 5 && item.inventory > 0;
                  
                  return (
                    <TableRow key={itemKey} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                          <img
                            src={item.image}
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
                            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                              {item.name}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 0.5 }}>
                              {item.size && item.size !== 'N/A' && (
                                <Chip 
                                  label={`Size: ${item.size}`} 
                                  size="small" 
                                  variant="outlined"
                                  sx={{ height: 24, fontSize: '0.7rem' }}
                                />
                              )}
                              {item.color && item.color !== 'N/A' && (
                                <Chip 
                                  label={`Color: ${item.color}`} 
                                  size="small" 
                                  variant="outlined"
                                  sx={{ height: 24, fontSize: '0.7rem' }}
                                />
                              )}
                            </Box>
                            {item.inventory && (
                              <Typography 
                                variant="caption" 
                                color={isLowStock ? 'warning.main' : 'text.secondary'}
                                sx={{ display: 'block', mt: 0.5 }}
                              >
                                {item.inventory > 10 
                                  ? `In Stock: ${item.inventory}+` 
                                  : item.inventory > 0 
                                    ? `Only ${item.inventory} left in stock` 
                                    : 'Out of Stock'}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <IconButton
                            size="small"
                            onClick={() => handleUpdateQuantity(item, quantity - 1)}
                            disabled={isUpdating || loading}
                            sx={{ border: '1px solid', borderColor: 'divider' }}
                          >
                            <Remove fontSize="small" />
                          </IconButton>
                          <Typography sx={{ mx: 2, minWidth: 30, textAlign: 'center' }}>
                            {isUpdating ? <CircularProgress size={20} /> : quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleUpdateQuantity(item, quantity + 1)}
                            disabled={isUpdating || loading || (item.inventory && quantity >= item.inventory)}
                            sx={{ border: '1px solid', borderColor: 'divider' }}
                          >
                            <Add fontSize="small" />
                          </IconButton>
                        </Box>
                        {stockError && (
                          <Alert severity="error" sx={{ mt: 1 }} icon={<Info fontSize="small" />}>
                            {stockError}
                          </Alert>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body1">
                          ${price.toFixed(2)}
                        </Typography>
                        {item.originalPrice && item.originalPrice > price && (
                          <Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                            ${item.originalPrice.toFixed(2)}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                          ${itemSubtotal.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Remove item">
                          <IconButton
                            color="error"
                            onClick={() => removeFromCartHandler(item.product, item.size, item.color)}
                            disabled={isUpdating || loading}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 24 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Order Summary
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography color="text.secondary">Subtotal ({itemCount} items):</Typography>
                <Typography>${subtotal.toFixed(2)}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography color="text.secondary">Shipping:</Typography>
                <Typography color={shipping === 0 ? 'success.main' : 'inherit'}>
                  {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography color="text.secondary">Estimated Tax (8%):</Typography>
                <Typography>${tax.toFixed(2)}</Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">Total:</Typography>
                <Typography variant="h6" fontWeight="bold" color="primary.main">
                  ${total.toFixed(2)}
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={checkoutHandler}
                disabled={cartItems.length === 0 || loading}
                sx={{ py: 1.5, mb: 2 }}
              >
                Proceed to Checkout
              </Button>

              {subtotal < 50 && subtotal > 0 && (
                <Alert severity="info" icon={<LocalOffer />} sx={{ mb: 2 }}>
                  Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                </Alert>
              )}

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/196/196578.png" 
                  alt="Visa" 
                  style={{ height: 30, opacity: 0.6 }}
                />
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/196/196561.png" 
                  alt="Mastercard" 
                  style={{ height: 30, opacity: 0.6 }}
                />
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/196/196539.png" 
                  alt="PayPal" 
                  style={{ height: 30, opacity: 0.6 }}
                />
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/174/174861.png" 
                  alt="Apple Pay" 
                  style={{ height: 30, opacity: 0.6 }}
                />
              </Box>
            </CardContent>
          </Card>

          <Button
            fullWidth
            variant="outlined"
            component={Link}
            to="/products"
            sx={{ mt: 2 }}
            startIcon={<ShoppingBag />}
          >
            Continue Shopping
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CartPage;