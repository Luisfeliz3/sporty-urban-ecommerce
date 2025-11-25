import React, { useState } from 'react';
import {
  Container,
  Paper,
  Button,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Card,
  CardContent,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { savePaymentMethod } from '../store/slices/cartSlice';

const steps = ['Shipping', 'Payment', 'Place Order'];

const PaymentPage = () => {
  const { shippingAddress, cartItems } = useSelector((state) => state.cart);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Calculate order summary
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const taxPrice = itemsPrice * 0.08;
  const shippingPrice = itemsPrice > 50 ? 0 : 10;
  const totalPrice = itemsPrice + taxPrice + shippingPrice;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!shippingAddress) {
      alert('Please complete shipping information first');
      navigate('/shipping');
      return;
    }

    dispatch(savePaymentMethod(paymentMethod));
    navigate('/placeorder');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stepper activeStep={1} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ display: 'flex', gap: 4 }}>
        {/* Payment Method Selection */}
        <Box sx={{ flex: 2 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Payment Method
            </Typography>

            <FormControl component="fieldset" sx={{ mt: 2, width: '100%' }}>
              <FormLabel component="legend">Select Payment Method</FormLabel>
              <RadioGroup
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <FormControlLabel
                  value="Credit Card"
                  control={<Radio />}
                  label="Credit Card"
                />
                <FormControlLabel
                  value="PayPal"
                  control={<Radio />}
                  label="PayPal"
                />
                <FormControlLabel
                  value="Apple Pay"
                  control={<Radio />}
                  label="Apple Pay"
                />
                <FormControlLabel
                  value="Google Pay"
                  control={<Radio />}
                  label="Google Pay"
                />
              </RadioGroup>
            </FormControl>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/shipping')}
              >
                Back to Shipping
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="large"
                onClick={handleSubmit}
              >
                Continue to Review
              </Button>
            </Box>
          </Paper>
        </Box>

        {/* Order Summary */}
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Items:</Typography>
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
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, pt: 1, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6">${totalPrice.toFixed(2)}</Typography>
              </Box>

              <Typography variant="body2" color="text.secondary">
                {cartItems.length} item(s) in cart
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default PaymentPage;