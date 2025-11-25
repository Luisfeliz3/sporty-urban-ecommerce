import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';

// Create order
export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      console.log('📦 Creating order:', orderData);
      
      const { data } = await API.post('/orders', orderData);

      console.log('✅ Order created successfully:', data);
      return data.data;
    } catch (error) {
      console.error('❌ Order creation error:', error);
      
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Failed to create order';
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Get order details
export const getOrderDetails = createAsyncThunk(
  'order/getOrderDetails',
  async (orderId, { rejectWithValue }) => {
    try {
      const { data } = await API.get(`/orders/${orderId}`);
      return data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Failed to fetch order details';
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Pay order
export const payOrder = createAsyncThunk(
  'order/payOrder',
  async ({ orderId, paymentResult }, { rejectWithValue }) => {
    try {
      const { data } = await API.put(`/orders/${orderId}/pay`, paymentResult);
      return data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Failed to process payment';
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Get user orders
export const getMyOrders = createAsyncThunk(
  'order/getMyOrders',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await API.get('/orders/myorders');
      return data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Failed to fetch orders';
      
      return rejectWithValue(errorMessage);
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    order: null,
    orders: [],
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearOrder: (state) => {
      state.order = null;
      state.error = null;
      state.success = false;
    },
    clearOrderError: (state) => {
      state.error = null;
    },
    resetOrderState: (state) => {
      state.order = null;
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
        state.success = true;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Get order details
      .addCase(getOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(getOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Pay order
      .addCase(payOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(payOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(payOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get user orders
      .addCase(getMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearOrder, clearOrderError, resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;