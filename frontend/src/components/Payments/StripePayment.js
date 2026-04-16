// frontend/src/components/Payments/StripePayment.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Alert,
  CircularProgress,
  Typography,
  Paper,
  Divider,
  IconButton,
  Collapse,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AppleIcon from '@mui/icons-material/Apple';
import GoogleIcon from '@mui/icons-material/Google';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { confirmPayment } from '../../store/slices/stripeSlice';
import { clearCartLocal } from '../../store/slices/cartSlice';

let stripePromise;
const getStripePromise = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

// Component for new card payment
const NewCardPaymentForm = ({ order, onSuccess, onClose, clientSecret, setPaymentComplete, setError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

// In NewCardPaymentForm component - update the handleSubmit function
const handleSubmit = async (event) => {
  event.preventDefault();
  
  if (!stripe || !elements) {
    setLocalError('Payment system is not ready. Please wait.');
    return;
  }

  setLoading(true);
  setLocalError('');

  try {
    const { error: submitError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orderconfirmation/${order._id}`,
        payment_method_data: {
          billing_details: {
            name: order.user?.name || '',
            email: order.user?.email || '',
          }
        }
      },
      redirect: 'if_required',
    });

    if (submitError) {
      setLocalError(submitError.message);
      if (setError) setError(submitError.message);
      setLoading(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Confirm payment on backend
      const result = await dispatch(confirmPayment({
        orderId: order._id,
        paymentIntentId: paymentIntent.id
      })).unwrap();
      
      if (result.success) {
        // Clear cart from Redux
        dispatch(clearCartLocal());
        
        // Clear cart from localStorage
        localStorage.removeItem('cartItems');
        
        // Also clear shipping address if you want
        // localStorage.removeItem('shippingAddress');
        
        setPaymentComplete(true);
        
        // Navigate to order confirmation page
        setTimeout(() => {
          navigate(`/orderconfirmation/${order._id}`);
        }, 1500);
      } else {
        setLocalError('Payment confirmation failed. Please contact support.');
        if (setError) setError('Payment confirmation failed. Please contact support.');
        setLoading(false);
      }
    }
  } catch (err) {
    console.error('Payment exception:', err);
    setLocalError(err.message || 'An error occurred during payment');
    if (setError) setError(err.message || 'An error occurred during payment');
    setLoading(false);
  }
};

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
          Enter your card details:
        </Typography>
        <PaymentElement 
          onReady={() => {
            console.log('Payment element ready');
          }}
          onError={(error) => {
            console.error('Payment element error:', error);
            setLocalError(error.message);
            if (setError) setError(error.message);
          }}
        />
      </Box>
      
      {localError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setLocalError('')}>
          {localError}
        </Alert>
      )}
      
      <DialogActions sx={{ px: 0, pb: 0 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="contained" 
          disabled={!stripe || loading || !clientSecret}
          sx={{ minWidth: 160 }}
        >
          {loading ? <CircularProgress size={24} /> : `Pay $${order?.totalPrice?.toFixed(2)}`}
        </Button>
      </DialogActions>
    </form>
  );
};

// Component for saved cards
const SavedCardPayment = ({ order, onSuccess, onClose, savedCards, onUseNewCard, setPaymentComplete, setError }) => {
  const [selectedCard, setSelectedCard] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handlePayment = async () => {
    if (!selectedCard) {
      setLocalError('Please select a payment method');
      return;
    }

    setLoading(true);
    setLocalError('');

    try {
      console.log('Processing payment with saved card:', selectedCard);
      
      const response = await fetch('/api/stripe/create-payment-intent-saved', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.token}`
        },
        body: JSON.stringify({
          orderId: order._id,
          paymentMethodId: selectedCard
        })
      });

      const data = await response.json();
      console.log('Payment response:', data);

      if (data.success && data.paymentIntent.status === 'succeeded') {
        setPaymentComplete(true);
        // Clear cart
        dispatch(clearCartLocal());
        localStorage.removeItem('cartItems');
        // Navigate to order confirmation page
        setTimeout(() => {
          navigate(`/orderconfirmation/${order._id}`);
        }, 1500);
      } else {
        setLocalError(data.message || 'Payment failed. Please try again or use a different card.');
        if (setError) setError(data.message || 'Payment failed. Please try again or use a different card.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setLocalError(err.message || 'An error occurred');
      if (setError) setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Select a saved payment method:
      </Typography>
      
      <FormControl component="fieldset" sx={{ width: '100%', mb: 3 }}>
        <RadioGroup
          value={selectedCard}
          onChange={(e) => setSelectedCard(e.target.value)}
        >
          {savedCards.map((card) => (
            <FormControlLabel
              key={card.id}
              value={card.id}
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CreditCardIcon />
                  <Typography>
                    {card.card?.brand?.toUpperCase() || 'CARD'} •••• {card.card?.last4}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    (Expires: {card.card?.exp_month}/{card.card?.exp_year})
                  </Typography>
                </Box>
              }
              sx={{ mb: 1, width: '100%' }}
            />
          ))}
        </RadioGroup>
      </FormControl>

      <Button
        fullWidth
        variant="outlined"
        onClick={onUseNewCard}
        sx={{ mb: 2 }}
      >
        Use New Card
      </Button>

      {localError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setLocalError('')}>
          {localError}
        </Alert>
      )}

      <DialogActions sx={{ px: 0, pb: 0 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handlePayment}
          disabled={!selectedCard || loading}
          sx={{ minWidth: 160 }}
        >
          {loading ? <CircularProgress size={24} /> : `Pay $${order?.totalPrice?.toFixed(2)}`}
        </Button>
      </DialogActions>
    </Box>
  );
};

const StripePayment = ({ open, onClose, order, onSuccess }) => {
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stripePromiseState, setStripePromiseState] = useState(null);
  const [savedCards, setSavedCards] = useState([]);
  const [useSavedCard, setUseSavedCard] = useState(true);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [loadingSavedCards, setLoadingSavedCards] = useState(false);
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Initialize Stripe
  useEffect(() => {
    const publishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
    if (publishableKey) {
      setStripePromiseState(getStripePromise());
    } else {
      console.error('Stripe publishable key is missing');
      setError('Stripe configuration error. Please contact support.');
    }
  }, []);

  // Load saved cards and create payment intent when modal opens
  useEffect(() => {
    if (open && order && userInfo) {
      console.log('Modal opened for order:', order._id);
      loadSavedCards();
      
      // Always create payment intent for new card option
      if (!useSavedCard) {
        createPaymentIntent();
      }
    }
  }, [open, order, userInfo]);

  const loadSavedCards = async () => {
    setLoadingSavedCards(true);
    try {
      console.log('Fetching saved cards...');
      const response = await fetch('/api/stripe/payment-methods', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userInfo?.token}`
        }
      });
      const data = await response.json();
      console.log('Saved cards response:', data);
      
      if (data.success && data.data && data.data.length > 0) {
        setSavedCards(data.data);
        // If there are saved cards, default to using them
        setUseSavedCard(true);
      } else {
        // No saved cards, default to new card
        setUseSavedCard(false);
        createPaymentIntent();
      }
    } catch (err) {
      console.error('Error fetching saved cards:', err);
      setUseSavedCard(false);
      createPaymentIntent();
    } finally {
      setLoadingSavedCards(false);
    }
  };

  const createPaymentIntent = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Creating payment intent for order:', order._id);
      
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo?.token}`
        },
        body: JSON.stringify({
          orderId: order._id,
          savePaymentMethod: true
        })
      });

      const data = await response.json();
      console.log('Payment intent response:', data);

      if (data.success) {
        setClientSecret(data.clientSecret);
      } else {
        setError(data.message || 'Failed to create payment intent');
      }
    } catch (err) {
      console.error('Error creating payment intent:', err);
      setError(err.message || 'An error occurred while preparing payment');
    } finally {
      setLoading(false);
    }
  };

  const handleUseNewCard = () => {
    setUseSavedCard(false);
    createPaymentIntent();
  };

  const handleUseSavedCard = () => {
    setUseSavedCard(true);
    setClientSecret(null);
  };

  const handleClose = () => {
    if (!paymentComplete) {
      onClose();
    }
  };

  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#4f46e5',
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#ef4444',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  };

  const options = {
    clientSecret,
    appearance,
    loader: 'auto',
    wallets: { applePay: 'auto', googlePay: 'auto' },
  };

  if (paymentComplete) {
    return (
      <Dialog open={open} maxWidth="sm" fullWidth>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h5" color="success.main" gutterBottom>
              ✓ Payment Successful!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Redirecting to order confirmation...
            </Typography>
            <CircularProgress sx={{ mt: 2 }} />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, minHeight: '500px' }
      }}
    >
      <DialogTitle sx={{ pb: 1, borderBottom: '1px solid #e5e7eb' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Secure Checkout</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ mt: 2 }}>
        {/* Order Summary */}
        <Paper sx={{ p: 2, bgcolor: '#f9fafb', mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Order Summary
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Subtotal:</Typography>
            <Typography variant="body2">${order?.itemsPrice?.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Shipping:</Typography>
            <Typography variant="body2">${order?.shippingPrice?.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Tax:</Typography>
            <Typography variant="body2">${order?.taxPrice?.toFixed(2)}</Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1" fontWeight="bold">Total:</Typography>
            <Typography variant="subtitle1" fontWeight="bold" color="#4f46e5">
              ${order?.totalPrice?.toFixed(2)}
            </Typography>
          </Box>
        </Paper>

        {/* Payment Options Toggle */}
        {!loadingSavedCards && savedCards.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Choose payment method:
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant={useSavedCard ? "contained" : "outlined"}
                onClick={handleUseSavedCard}
                sx={{ flex: 1 }}
                disabled={loading}
              >
                Saved Cards ({savedCards.length})
              </Button>
              <Button
                variant={!useSavedCard ? "contained" : "outlined"}
                onClick={handleUseNewCard}
                sx={{ flex: 1 }}
                disabled={loading}
              >
                New Card
              </Button>
            </Box>
          </Box>
        )}

        {/* Payment Methods Info */}
        <Paper sx={{ p: 2, bgcolor: '#f9fafb', mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Accepted Payment Methods:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CreditCardIcon fontSize="small" />
              <Typography variant="body2">Credit/Debit Cards</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AppleIcon fontSize="small" />
              <Typography variant="body2">Apple Pay</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <GoogleIcon fontSize="small" />
              <Typography variant="body2">Google Pay</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccountBalanceIcon fontSize="small" />
              <Typography variant="body2">Bank Accounts (ACH)</Typography>
            </Box>
          </Box>
        </Paper>

        {loadingSavedCards && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Loading saved payment methods...</Typography>
          </Box>
        )}

        {loading && !useSavedCard && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Preparing secure payment...</Typography>
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        
        {!loadingSavedCards && (
          <>
            {useSavedCard && savedCards.length > 0 ? (
              <SavedCardPayment
                order={order}
                onSuccess={onSuccess}
                onClose={handleClose}
                savedCards={savedCards}
                onUseNewCard={handleUseNewCard}
                setPaymentComplete={setPaymentComplete}
                setError={setError}
              />
            ) : !useSavedCard && clientSecret && stripePromiseState ? (
              <Elements stripe={stripePromiseState} options={options}>
                <NewCardPaymentForm
                  order={order}
                  onSuccess={onSuccess}
                  onClose={handleClose}
                  clientSecret={clientSecret}
                  setPaymentComplete={setPaymentComplete}
                  setError={setError}
                />
              </Elements>
            ) : !useSavedCard && !clientSecret && !loading && (
              <Alert severity="info">
                Click "New Card" to enter payment details
              </Alert>
            )}
          </>
        )}

        {/* Security Info */}
        <Collapse in={!loading && !error && !loadingSavedCards}>
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              🔒 Your payment information is encrypted and secure. 
              We never store your full card details.
            </Typography>
          </Box>
        </Collapse>
      </DialogContent>
    </Dialog>
  );
};

export default StripePayment;