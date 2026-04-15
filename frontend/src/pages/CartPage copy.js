import React, { useState,useCallback } from 'react';
import { debounce } from 'lodash'; // or implement your own debounce
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
} from '@mui/material';
import { Delete, Add, Remove } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  removeFromCartLocal,
  removeFromCartServer,
  updateCartItemQuantityLocal,
  updateCartItemQuantityServer,
  syncCartWithServer,
} from '../store/slices/cartSlice';
import { selectUniqueCartItems } from '../store/slices/cartSlice';
import no_image_avl from "../images/no_images.jpeg";

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // const { loading } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);


    // Use the new selector for cart items (automatically merged)
 const { cartItems, loading } = useSelector((state) => state.cart);
   const [updatingItems, setUpdatingItems] = useState({});
  // Sync cart when component mounts and user is logged in
  React.useEffect(() => {
    if (userInfo) {
      dispatch(syncCartWithServer());
    }
  }, [dispatch, userInfo]);


// Debounced update function
  const debouncedUpdateQuantity = useCallback(
    debounce((productId, size, color, quantity) => {
      dispatch(updateCartItemQuantityLocal({
        productId,
        size,
        color,
        quantity
      }));
      setUpdatingItems(prev => ({ ...prev, [`${productId}_${size}_${color}`]: false }));
    }, 300),
    [dispatch]
  );
  
  const handleUpdateQuantity = (item, newQuantity) => {
    const itemKey = `${item.product}_${item.size}_${item.color}`;
    
    // Prevent multiple updates
    if (updatingItems[itemKey]) return;
    
    setUpdatingItems(prev => ({ ...prev, [itemKey]: true }));
    
    if (newQuantity <= 0) {
      dispatch(removeFromCartLocal({
        productId: item.product,
        size: item.size,
        color: item.color
      }));
      setUpdatingItems(prev => ({ ...prev, [itemKey]: false }));
    } else {
      debouncedUpdateQuantity(item.product, item.size, item.color, newQuantity);
    }
  };
  

  const removeFromCartHandler = useCallback(async (productId, size, color) => {
    try {
      if (userInfo) {
        await dispatch(removeFromCartServer({ productId, size, color })).unwrap();
      } else {
        dispatch(removeFromCartLocal({ productId, size, color }));
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  }, [dispatch, userInfo]);

  const updateQuantityHandler = useCallback(async (productId, size, color, quantity) => {
    // Validate quantity
    if (quantity < 0) return;
    
    try {
      if (userInfo) {
        // For logged-in users, update on server
        if (quantity === 0) {
          await dispatch(removeFromCartServer({ productId, size, color })).unwrap();
        } else {
          await dispatch(updateCartItemQuantityServer({ productId, size, color, quantity })).unwrap();
        }
      } else {
        // For guest users, update locally
        if (quantity === 0) {
          dispatch(removeFromCartLocal({ productId, size, color }));
        } else {
          dispatch(updateCartItemQuantityLocal({ productId, size, color, quantity }));
        }
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  }, [dispatch, userInfo]);

  // Safely calculate totals with validation
  const calculateTotals = useCallback(() => {
    if (!cartItems || cartItems.length === 0) {
      return { subtotal: 0, tax: 0, shipping: 0, total: 0 };
    }

    const subtotal = cartItems.reduce((acc, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return acc + (price * quantity);
    }, 0);

    const tax = subtotal * 0.08;
    const shipping = subtotal > 50 ? 0 : 10;
    const total = subtotal + tax + shipping;

    return { subtotal, tax, shipping, total };
  }, [cartItems]);

  const { subtotal, tax, shipping, total } = calculateTotals();

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
        <Typography variant="h4" gutterBottom>
          Your Cart is Empty
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Add some awesome sportswear to get started!
        </Typography>
        <Button
          variant="contained"
          component={Link}
          to="/"
          sx={{ mt: 2 }}
        >
          Continue Shopping
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Shopping Cart
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cartItems.map((item) => {
                  const price = Number(item.price) || 0;
                  const quantity = Number(item.quantity) || 0;
                  const itemSubtotal = price * quantity;
                  
                  return (
                    <TableRow key={`${item.product}-${item.size}-${item.color}`}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{
                              width: 60,
                              height: 60,
                              objectFit: 'cover',
                              marginRight: 16,
                              borderRadius: 4,
                            }}
                            onError={(e) => {
                              // e.target.src = '/placeholder-image.jpg';
                              e.target.src =  no_image_avl
                            }}
                          />
                          <Typography variant="body1">{item.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{item.size || 'N/A'}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <IconButton
                            size="small"
                            onClick={() =>
                              updateQuantityHandler(
                                item.product,
                                item.size,
                                item.color,
                                quantity - 1
                              )
                            }
                            disabled={loading}
                          >
                            <Remove />
                          </IconButton>
                          <Typography sx={{ mx: 1 }}>{quantity}</Typography>
                          <IconButton
                            size="small"
                            onClick={() =>
                              updateQuantityHandler(
                                item.product,
                                item.size,
                                item.color,
                                quantity + 1
                              )
                            }
                            disabled={loading}
                          >
                            <Add />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell align="right">${price.toFixed(2)}</TableCell>
                      <TableCell align="right">
                        ${itemSubtotal.toFixed(2)}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="error"
                          onClick={() =>
                            removeFromCartHandler(
                              item.product,
                              item.size,
                              item.color
                            )
                          }
                          disabled={loading}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Subtotal:</Typography>
                <Typography>${subtotal.toFixed(2)}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Shipping:</Typography>
                <Typography>
                  {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Tax (8%):</Typography>
                <Typography>${tax.toFixed(2)}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6">${total.toFixed(2)}</Typography>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={checkoutHandler}
                disabled={cartItems.length === 0 || loading}
              >
                Proceed to Checkout
              </Button>

              {subtotal < 50 && subtotal > 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  sx={{ mt: 1 }}
                >
                  Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                </Typography>
              )}
            </CardContent>
          </Card>

          <Button
            fullWidth
            variant="outlined"
            component={Link}
            to="/"
            sx={{ mt: 2 }}
          >
            Continue Shopping
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CartPage;