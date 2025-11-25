import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';

// Get user profile
export const getProfile = createAsyncThunk(
  'profile/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await API.get('/profile');
      return data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Failed to fetch profile';
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Update profile
export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const { data } = await API.put('/profile', profileData);
      return data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Failed to update profile';
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Add address
export const addAddress = createAsyncThunk(
  'profile/addAddress',
  async (addressData, { rejectWithValue }) => {
    try {
      const { data } = await API.post('/profile/address', addressData);
      return data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Failed to add address';
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Delete address
export const deleteAddress = createAsyncThunk(
  'profile/deleteAddress',
  async (addressId, { rejectWithValue }) => {
    try {
      const { data } = await API.delete(`/profile/address/${addressId}`);
      return data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Failed to delete address';
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Add payment method
export const addPaymentMethod = createAsyncThunk(
  'profile/addPaymentMethod',
  async (paymentData, { rejectWithValue }) => {
    try {
      const { data } = await API.post('/profile/payment-methods', paymentData);
      return data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Failed to add payment method';
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Delete payment method
export const deletePaymentMethod = createAsyncThunk(
  'profile/deletePaymentMethod',
  async (paymentMethodId, { rejectWithValue }) => {
    try {
      const { data } = await API.delete(`/profile/payment-methods/${paymentMethodId}`);
      return data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Failed to delete payment method';
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Set default payment method
export const setDefaultPaymentMethod = createAsyncThunk(
  'profile/setDefaultPaymentMethod',
  async (paymentMethodId, { rejectWithValue }) => {
    try {
      const { data } = await API.put(`/profile/payment-methods/${paymentMethodId}/default`);
      return data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Failed to set default payment method';
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Change password
export const changePassword = createAsyncThunk(
  'profile/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const { data } = await API.put('/profile/password', {
        currentPassword,
        newPassword
      });
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Failed to change password';
      
      return rejectWithValue(errorMessage);
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    user: null,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearProfile: (state) => {
      state.user = null;
      state.error = null;
      state.success = false;
    },
    clearProfileError: (state) => {
      state.error = null;
    },
    resetProfileState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get profile
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.success = true;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Add address
      .addCase(addAddress.fulfilled, (state, action) => {
        if (state.user) {
          state.user.addresses = action.payload;
        }
      })
      // Delete address
      .addCase(deleteAddress.fulfilled, (state, action) => {
        if (state.user) {
          state.user.addresses = action.payload;
        }
      })
      // Add payment method
      .addCase(addPaymentMethod.fulfilled, (state, action) => {
        if (state.user) {
          state.user.paymentMethods = action.payload;
        }
      })
      // Delete payment method
      .addCase(deletePaymentMethod.fulfilled, (state, action) => {
        if (state.user) {
          state.user.paymentMethods = action.payload;
        }
      })
      // Set default payment method
      .addCase(setDefaultPaymentMethod.fulfilled, (state, action) => {
        if (state.user) {
          state.user.paymentMethods = action.payload;
        }
      });
  },
});

export const { clearProfile, clearProfileError, resetProfileState } = profileSlice.actions;
export default profileSlice.reducer;