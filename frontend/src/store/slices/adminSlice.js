import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';

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

// Create product
export const createProduct = createAsyncThunk(
  'admin/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      // Handle FormData for file uploads
      const formData = new FormData();
      
      // Append product fields
      Object.keys(productData).forEach(key => {
        if (key === 'images') {
          // Append each image file
          productData.images.forEach((image, index) => {
            formData.append('images', image);
          });
        } else if (Array.isArray(productData[key])) {
          // Convert arrays to strings
          formData.append(key, productData[key].join(','));
        } else {
          formData.append(key, productData[key]);
        }
      });

      const { data } = await API.post('/admin/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create product');
    }
  }
);

// Update product
// Update product
export const updateProduct = createAsyncThunk(
  'admin/updateProduct',
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const { data } = await API.put(`/admin/products/${id}`, productData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update product');
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