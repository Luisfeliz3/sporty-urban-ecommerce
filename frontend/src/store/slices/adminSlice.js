import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';
import axiosInstance from '../axiosConfig';

const getAuthToken = () => {
  const token = localStorage.getItem('token') || 
                localStorage.getItem('userToken') || 
                localStorage.getItem('authToken');
  
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

export const getAdminProducts = createAsyncThunk(
  'admin/getAdminProducts',
  async ({ page = 1, limit = 20, search = '', category = '', productType = '' } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (productType) params.append('productType', productType);
      
      const { data } = await API.get(`/admin/products?${params.toString()}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const uploadMultipleProductImages = createAsyncThunk(
  'admin/uploadMultipleProductImages',
  async (files, { rejectWithValue }) => {
    try {
      console.log('📸 Starting upload for', files.length, 'files');
      
      const formData = new FormData();
      files.forEach((file, index) => {
        console.log(`File ${index + 1}:`, file.name, (file.size / 1024).toFixed(2), 'KB', file.type);
        formData.append('images', file);
      });
      
      const token = getAuthToken();
      console.log('Token found:', token ? 'YES' : 'NO');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      // Make sure to use the correct axios instance
      const response = await axiosInstance.post('/admin/upload/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Upload response status:', response.status);
      console.log('Upload response data:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Upload failed');
      }
      
      // Return the uploaded images data
      const uploadedImages = response.data.data;
      console.log(`✅ Successfully uploaded ${uploadedImages.length} images`);
      console.log('Image URLs:', uploadedImages.map(img => img.url));
      
      return uploadedImages;
    } catch (error) {
      console.error('❌ Upload error details:', error);
      console.error('Error response:', error.response?.data);
      
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

export const createProduct = createAsyncThunk(
  'admin/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const { data } = await axiosInstance.post('/admin/products', productData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateProduct = createAsyncThunk(
  'admin/updateProduct',
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const { data } = await axiosInstance.put(`/admin/products/${id}`, productData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

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

export const toggleProductActive = createAsyncThunk(
  'admin/toggleProductActive',
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await API.patch(`/admin/products/${productId}/toggle-active`);
      console.log('Toggle response:', data);
      return { 
        productId, 
        isActive: data.data.isActive  // Make sure this matches your response structure
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update product status');
    }
  }
);

export const bulkUploadProducts = createAsyncThunk(
  'admin/bulkUploadProducts',
  async (csvFile, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('csv', csvFile);
      
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const { data } = await axiosInstance.post('/admin/products/bulk-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to bulk upload products');
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
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p._id === action.payload.data._id);
        if (index !== -1) {
          state.products[index] = action.payload.data;
        }
        state.currentProduct = action.payload.data;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(p => p._id !== action.payload.productId);
      })
.addCase(toggleProductActive.fulfilled, (state, action) => {
  const index = state.products.findIndex(p => p._id === action.payload.productId);
  if (index !== -1) {
    // Update the isActive status in the products array
    state.products[index].isActive = action.payload.isActive;
    console.log(`Product ${index} status updated to:`, action.payload.isActive);
  }
})
      .addCase(bulkUploadProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkUploadProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.products = [...action.payload.data, ...state.products];
      })
      .addCase(bulkUploadProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAdminState, clearAdminError, setCurrentProduct, clearCurrentProduct } = adminSlice.actions;
export default adminSlice.reducer;