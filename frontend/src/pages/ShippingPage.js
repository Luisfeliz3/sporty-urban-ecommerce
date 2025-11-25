import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { saveShippingAddress } from '../store/slices/cartSlice';

const steps = ['Shipping', 'Payment', 'Place Order'];

const ShippingPage = () => {
  const { shippingAddress } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    street: shippingAddress.street || '',
    city: shippingAddress.city || '',
    state: shippingAddress.state || '',
    zipCode: shippingAddress.zipCode || '',
    country: shippingAddress.country || 'United States',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.street || !formData.city || !formData.state || !formData.zipCode) {
      alert('Please fill in all required fields');
      return;
    }

    dispatch(saveShippingAddress(formData));
    navigate('/payment');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stepper activeStep={0} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Shipping Address
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Hello {userInfo?.name}, where should we deliver your order?
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            required
            fullWidth
            label="Street Address"
            name="street"
            value={formData.street}
            onChange={handleChange}
            margin="normal"
          />
          
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              required
              fullWidth
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
            />
            <TextField
              required
              fullWidth
              label="State"
              name="state"
              value={formData.state}
              onChange={handleChange}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              required
              fullWidth
              label="ZIP Code"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
            />
            <TextField
              required
              fullWidth
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleChange}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/cart')}
            >
              Back to Cart
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="large"
            >
              Continue to Payment
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ShippingPage;