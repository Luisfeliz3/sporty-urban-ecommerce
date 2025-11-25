import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';

// Get user info from localStorage
const userInfoFromStorage = localStorage.getItem('userInfo');
const initialState = {
  userInfo: userInfoFromStorage ? JSON.parse(userInfoFromStorage) : null,
  loading: false,
  error: null,
};

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      console.log('🔐 Attempting login...');
      
      const { data } = await API.post('/auth/login', { 
        email: email.toLowerCase().trim(), 
        password 
      });

      console.log('✅ Login successful:', data);
      
      if (data.success) {
        return data.data;
      } else {
        return rejectWithValue(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      
      // Handle different error types
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot connect to server. Please check if backend is running.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      console.log('👤 Attempting registration...');
      
      const { data } = await API.post('/auth/register', { 
        name: name.trim(), 
        email: email.toLowerCase().trim(), 
        password 
      });

      console.log('✅ Registration successful:', data);
      
      if (data.success) {
        return data.data;
      } else {
        return rejectWithValue(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot connect to server. Please check if backend is running.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('userInfo');
      state.userInfo = null;
      state.loading = false;
      state.error = null;
      console.log('👋 User logged out');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
        localStorage.setItem('userInfo', JSON.stringify(action.payload));
      })

      
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register cases
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
        localStorage.setItem('userInfo', JSON.stringify(action.payload));
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;