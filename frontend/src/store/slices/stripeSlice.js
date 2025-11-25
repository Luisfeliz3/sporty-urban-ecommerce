import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';

// Create payment intent
export const createPaymentIntent = createAsyncThunk(
  'stripe/createPaymentIntent',
  async ({ orderId, savePaymentMethod = false }, { rejectWithValue }) => {
    try {
      const { data } = await API.post('/stripe/create-payment-intent', {
        orderId,
        savePaymentMethod
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create payment intent');
    }
  }
);

// Confirm payment
export const confirmPayment = createAsyncThunk(
  'stripe/confirmPayment',
  async ({ orderId, paymentIntentId }, { rejectWithValue }) => {
    try {
      const { data } = await API.post('/stripe/confirm-payment', {
        orderId,
        paymentIntentId
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to confirm payment');
    }
  }
);

// Create setup intent for saving payment methods
export const createSetupIntent = createAsyncThunk(
  'stripe/createSetupIntent',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await API.post('/stripe/create-setup-intent');
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create setup intent');
    }
  }
);

// Get saved payment methods
export const getPaymentMethods = createAsyncThunk(
  'stripe/getPaymentMethods',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await API.get('/stripe/payment-methods');
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment methods');
    }
  }
);

// Set default payment method
export const setDefaultPaymentMethod = createAsyncThunk(
  'stripe/setDefaultPaymentMethod',
  async (paymentMethodId, { rejectWithValue }) => {
    try {
      const { data } = await API.post('/stripe/set-default-payment-method', {
        paymentMethodId
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to set default payment method');
    }
  }
);

const stripeSlice = createSlice({
  name: 'stripe',
  initialState: {
    clientSecret: null,
    paymentIntentId: null,
    setupIntentClientSecret: null,
    paymentMethods: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearStripeState: (state) => {
      state.clientSecret = null;
      state.paymentIntentId = null;
      state.setupIntentClientSecret = null;
      state.error = null;
    },
    clearStripeError: (state) => {
      state.error = null;
    },
    setClientSecret: (state, action) => {
      state.clientSecret = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create payment intent
      .addCase(createPaymentIntent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.loading = false;
        state.clientSecret = action.payload.clientSecret;
        state.paymentIntentId = action.payload.paymentIntentId;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Confirm payment
      .addCase(confirmPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmPayment.fulfilled, (state) => {
        state.loading = false;
        state.clientSecret = null;
        state.paymentIntentId = null;
      })
      .addCase(confirmPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create setup intent
      .addCase(createSetupIntent.fulfilled, (state, action) => {
        state.setupIntentClientSecret = action.payload.clientSecret;
      })
      // Get payment methods
      .addCase(getPaymentMethods.fulfilled, (state, action) => {
        state.paymentMethods = action.payload.data;
      });
  },
});

export const { clearStripeState, clearStripeError, setClientSecret } = stripeSlice.actions;
export default stripeSlice.reducer;