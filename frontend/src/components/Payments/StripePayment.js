import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  PaymentElement,
  useStripe,
  useElements,
  Elements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useDispatch, useSelector } from 'react-redux';
import { confirmPayment, clearStripeState } from '../../store/slices/stripeSlice';

// Load Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const StripePaymentForm = ({ order, onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();

  const { clientSecret, loading, error } = useSelector((state) => state.stripe);
  const [savePaymentMethod, setSavePaymentMethod] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    if (!stripe || !clientSecret) {
      return;
    }
  }, [stripe, clientSecret]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setPaymentProcessing(true);
    setPaymentError('');

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setPaymentError(submitError.message);
        setPaymentProcessing(false);
        return;
      }

      const { error: confirmationError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/order-success`,
          payment_method_data: {
            billing_details: {
              name: order.user.name,
              email: order.user.email,
              address: {
                line1: order.shippingAddress.street,
                city: order.shippingAddress.city,
                state: order.shippingAddress.state,
                postal_code: order.shippingAddress.zipCode,
                country: order.shippingAddress.country || 'US',
              },
            },
          },
        },
        redirect: 'if_required',
      });

      if (confirmationError) {
        setPaymentError(confirmationError.message);
        setPaymentProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirm payment with backend
        await dispatch(confirmPayment({
          orderId: order._id,
          paymentIntentId: paymentIntent.id
        })).unwrap();

        onSuccess(order);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError(error.message || 'Payment failed');
    } finally {
      setPaymentProcessing(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {paymentError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {paymentError}
        </Alert>
      )}

      <Typography variant="h6" gutterBottom>
        Payment Details
      </Typography>

      <Box sx={{ mb: 2 }}>
        <PaymentElement />
      </Box>

      <FormControlLabel
        control={
          <Checkbox
            checked={savePaymentMethod}
            onChange={(e) => setSavePaymentMethod(e.target.checked)}
            color="primary"
          />
        }
        label="Save payment method for future purchases"
      />

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Your payment information is secure and encrypted.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button
          onClick={onClose}
          disabled={paymentProcessing}
          fullWidth
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || paymentProcessing || loading}
          fullWidth
          variant="contained"
        >
          {paymentProcessing ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            `Pay $${order.totalPrice.toFixed(2)}`
          )}
        </Button>
      </Box>
    </Box>
  );
};

const StripePayment = ({ open, onClose, order, onSuccess }) => {
  const dispatch = useDispatch();
  const { clientSecret } = useSelector((state) => state.stripe);

  useEffect(() => {
    if (!open) {
      dispatch(clearStripeState());
    }
  }, [open, dispatch]);

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#FF6B35',
        colorBackground: '#ffffff',
        colorText: '#1A202C',
        colorDanger: '#df1b41',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Complete Your Payment
      </DialogTitle>
      <DialogContent>
        {clientSecret ? (
          <Elements stripe={stripePromise} options={options}>
            <StripePaymentForm
              order={order}
              onSuccess={onSuccess}
              onClose={onClose}
            />
          </Elements>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StripePayment;