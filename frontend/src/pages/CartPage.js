import React from 'react';
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
  Select,
  MenuItem,
} from '@mui/material';
import { Delete, Add, Remove } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  removeFromCartLocal,
  removeFromCartServer,
  updateCartItemQuantityLocal,
} from '../store/slices/cartSlice';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get cart items and user info from Redux store
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth); // Add this line

  const removeFromCartHandler = async (productId, size, color) => {
    try {
      if (userInfo) {
        await dispatch( removeFromCartServer({ productId, size, color })).unwrap();
      } else {
        dispatch(removeFromCartLocal({ productId, size, color }));
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantityHandler = (productId, size, color, quantity) => {
    if (quantity === 0) {
      removeFromCartHandler(productId, size, color);
    } else {
      dispatch(updateCartItemQuantityLocal({ productId, size, color, quantity }));
    }
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.08; // 8% tax
  const shipping = subtotal > 50 ? 0 : 10;
  const total = subtotal + tax + shipping;

  const checkoutHandler = () => {
    if (!userInfo) {
      navigate('/login?redirect=shipping');
    } else {
      navigate('/shipping');
    }
  };

  if (cartItems.length === 0) {
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
                  {/* <TableCell>Color</TableCell> */}
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                
                {cartItems.map((item) => (
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
                        />
                        <Typography variant="body1">{item.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{item.size}</TableCell>
                    {/* <TableCell>{item.color}</TableCell> */}
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconButton
                          size="small"
                          onClick={() =>
                            updateQuantityHandler(
                              item.product,
                              item.size,
                              item.color,
                              item.quantity - 1
                            )
                          }
                        >
                          <Remove />
                        </IconButton>
                        <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
                        <IconButton
                          size="small"
                          onClick={() =>
                            updateQuantityHandler(
                              item.product,
                              item.size,
                              item.color,
                              item.quantity + 1
                            )
                          }
                        >
                          <Add />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell align="right">${item.price}</TableCell>
                    <TableCell align="right">
                      ${(item.price * item.quantity).toFixed(2)}
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
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
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
                <Typography>Tax:</Typography>
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
                disabled={cartItems.length === 0}
              >
                Proceed to Checkout
              </Button>

              {subtotal < 50 && (
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