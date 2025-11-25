import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const {
        page = 1,
        limit = 25,
        category = '',
        brand = '',
        sportType = '',
        minPrice = '',
        maxPrice = '',
        size = '',
        color = '',
        featured = '',
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search = ''
      } = filters;

      // Build query string
      const params = new URLSearchParams();
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);
      if (category) params.append('category', category);
      if (brand) params.append('brand', brand);
      if (sportType) params.append('sportType', sportType);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (size) params.append('size', size);
      if (color) params.append('color', color);
      if (featured) params.append('featured', featured);
      if (sortBy) params.append('sortBy', sortBy);
      if (sortOrder) params.append('sortOrder', sortOrder);
      if (search) params.append('search', search);

      const { data } = await API.get(`/products?${params.toString()}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const fetchProductDetails = createAsyncThunk(
  'products/fetchProductDetails',
  async (productId) => {
    const { data } = await API.get(`/products/${productId}`);
    return data;
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    product: null,
    loading: false,
    error: null,
    filters: {
      category: '',
      brand: '',
      sportType: '',
      minPrice: '',
      maxPrice: '',
      size: '',
      color: '',
      featured: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      search: ''
    },
    availableFilters: {
      categories: [],
      brands: [],
      sportTypes: [],
      sizes: [],
      colors: [],
      priceRange: { minPrice: 0, maxPrice: 1000 }
    },
    pagination: {
      page: 1,
      pages: 1,
      total: 0,
      hasNext: false,
      hasPrev: false
    }
  },
  reducers: {
    clearProduct: (state) => {
      state.product = null;
    },
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        category: '',
        brand: '',
        sportType: '',
        minPrice: '',
        maxPrice: '',
        size: '',
        color: '',
        featured: '',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        search: ''
      };
    },
    clearProductsError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data;
        state.pagination = action.payload.pagination;
        state.availableFilters = action.payload.filters;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProductDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload.data;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearProduct, updateFilters, resetFilters, clearProductsError } = productSlice.actions;
export default productSlice.reducer;