import React, { useState } from 'react';
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { saveShippingAddress, savePaymentMethod, clearCartLocal } from '../store/slices/cartSlice';

const steps = ['Shipping', 'Payment', 'Place Order'];

const CheckoutPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [shippingData, setShippingData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems, shippingAddress } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.08;
  const shipping = subtotal > 50 ? 0 : 10;
  const total = subtotal + tax + shipping;

  const handleNext = () => {
    if (activeStep === 0) {
      dispatch(saveShippingAddress(shippingData));
    } else if (activeStep === 1) {
      dispatch(savePaymentMethod(paymentMethod));
    } else if (activeStep === 2) {
      placeOrderHandler();
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const placeOrderHandler = () => {
    // Implement order creation and payment processing
    console.log('Placing order...');
    dispatch(clearCartLocal());
    navigate('/order-success');
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Street Address"
                  value={shippingData.street}
                  onChange={(e) =>
                    setShippingData({ ...shippingData, street: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="City"
                  value={shippingData.city}
                  onChange={(e) =>
                    setShippingData({ ...shippingData, city: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="State"
                  value={shippingData.state}
                  onChange={(e) =>
                    setShippingData({ ...shippingData, state: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="ZIP Code"
                  value={shippingData.zipCode}
                  onChange={(e) =>
                    setShippingData({ ...shippingData, zipCode: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Country"
                  value={shippingData.country}
                  onChange={(e) =>
                    setShippingData({ ...shippingData, country: e.target.value })
                  }
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 1:
        return (
          <FormControl component="fieldset" sx={{ mt: 2 }}>
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
            </RadioGroup>
          </FormControl>
        );
      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            {cartItems.map((item) => (
              <Box key={`${item.product}-${item.size}-${item.color}`} sx={{ mb: 2 }}>
                <Typography variant="body1">
                  {item.name} - {item.size} - {item.color}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.quantity} x ${item.price} = ${(item.quantity * item.price).toFixed(2)}
                </Typography>
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>Subtotal:</Typography>
              <Typography>${subtotal.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>Shipping:</Typography>
              <Typography>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>Tax:</Typography>
              <Typography>${tax.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6">${total.toFixed(2)}</Typography>
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Checkout
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {steps[activeStep]}
              </Typography>
              {renderStepContent(activeStep)}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  {activeStep === steps.length - 1 ? 'Place Order' : 'Next'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Total
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
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6">${total.toFixed(2)}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CheckoutPage;