import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import API from '../../utils/api';
import axiosInstance from '../axiosConfig';




// Get all products (admin)
export const getAdminProducts = createAsyncThunk(
  'admin/getAdminProducts',
  async ({ page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const { data } = await API.get(`/admin/products?page=${page}&limit=${limit}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

// Helper function to get auth token from various possible locations
const getAuthToken = () => {
  // Try different possible storage keys
  const token = localStorage.getItem('token') || 
                localStorage.getItem('userToken') || 
                localStorage.getItem('authToken');
  
  // Also check if token is inside userInfo object
  if (!token) {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);
        return user.token || user.accessToken;
      } catch (e) {
        console.error('Error parsing userInfo:', e);
      }
    }
  }
  
  return token;
};

// Add this new async thunk
export const uploadProductImage = createAsyncThunk(
  'admin/uploadProductImage',
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      };
      
      const { data } = await axios.post('/api/admin/upload/image', formData, config);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Update the upload function
export const uploadMultipleProductImages = createAsyncThunk(
  'admin/uploadMultipleProductImages',
  async (files, { rejectWithValue }) => {
    try {
      console.log('Uploading files:', files.length);
      
      const formData = new FormData();
      files.forEach((file, index) => {
        console.log(`Appending file ${index + 1}:`, file.name, file.size, file.type);
        formData.append('images', file);
      });
      
      // Get token using our helper function
      const token = getAuthToken();
      console.log('Token found:', token ? 'YES' : 'NO');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      };
      
      console.log('Sending upload request to:', '/api/admin/upload/images');
      const { data } = await axiosInstance.post('/admin/upload/images', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
    // No need to manually add Authorization header - interceptor adds it
  },
});
      console.log('Upload response:', data);
      
      if (!data.success) {
        throw new Error(data.message || 'Upload failed');
      }
      
      return data.data;
    } catch (error) {
      console.error('Upload error details:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = 'Failed to upload images';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Also update your createProduct and updateProduct functions similarly
export const createProduct = createAsyncThunk(
  'admin/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const token = getAuthToken(); // Use the same helper
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      
      const { data } = await axios.post('/api/admin/products', productData, config);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateProduct = createAsyncThunk(
  'admin/updateProduct',
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const token = getAuthToken(); // Use the same helper
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      
      const { data } = await axios.put(`/api/admin/products/${id}`, productData, config);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


// Delete product
export const deleteProduct = createAsyncThunk(
  'admin/deleteProduct',
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await API.delete(`/admin/products/${productId}`);
      return { productId, data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete product');
    }
  }
);

// Toggle product active status
export const toggleProductActive = createAsyncThunk(
  'admin/toggleProductActive',
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await API.patch(`/admin/products/${productId}/toggle-active`);
      return { productId, data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update product status');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    products: [],
    currentProduct: null,
    loading: false,
    error: null,
    success: false,
    pagination: {
      page: 1,
      pages: 1,
      total: 0,
      hasNext: false,
      hasPrev: false
    }
  },
  reducers: {
    clearAdminState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    clearAdminError: (state) => {
      state.error = null;
    },
    setCurrentProduct: (state, action) => {
      state.currentProduct = action.payload;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get admin products
      .addCase(getAdminProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdminProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getAdminProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.products.unshift(action.payload.data);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Update product
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p._id === action.payload.data._id);
        if (index !== -1) {
          state.products[index] = action.payload.data;
        }
        state.currentProduct = action.payload.data;
      })
      // Delete product
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(p => p._id !== action.payload.productId);
      })
      // Toggle product active
      .addCase(toggleProductActive.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p._id === action.payload.productId);
        if (index !== -1) {
          state.products[index].isActive = action.payload.data.isActive;
        }
      });
  },
});

export const { clearAdminState, clearAdminError, setCurrentProduct, clearCurrentProduct } = adminSlice.actions;
export default adminSlice.reducer;