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
        productType = '',
        brand = '',
        minPrice = '',
        maxPrice = '',
        featured = '',
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search = '',
        inStock = '',
        minRating = ''
      } = filters;

      const params = new URLSearchParams();
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);
      if (category) params.append('category', category);
      if (productType) params.append('productType', productType);
      if (brand) params.append('brand', brand);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (featured) params.append('featured', featured);
      if (sortBy) params.append('sortBy', sortBy);
      if (sortOrder) params.append('sortOrder', sortOrder);
      if (search) params.append('search', search);
      if (inStock) params.append('inStock', inStock);
      if (minRating) params.append('minRating', minRating);

      const { data } = await API.get(`/products?${params.toString()}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const fetchProductDetails = createAsyncThunk(
  'products/fetchProductDetails',
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await API.get(`/products/${productId}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch product details');
    }
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeaturedProducts',
  async (limit = 8) => {
    const { data } = await API.get(`/products/featured/products?limit=${limit}`);
    return data;
  }
);

export const fetchNewArrivals = createAsyncThunk(
  'products/fetchNewArrivals',
  async (limit = 12) => {
    const { data } = await API.get(`/products/new-arrivals/limit?limit=${limit}`);
    return data;
  }
);

export const fetchBestSelling = createAsyncThunk(
  'products/fetchBestSelling',
  async (limit = 8) => {
    const { data } = await API.get(`/products/best-selling/limit?limit=${limit}`);
    return data;
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    product: null,
    featuredProducts: [],
    newArrivals: [],
    bestSelling: [],
    loading: false,
    error: null,
    filters: {
      category: '',
      productType: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      featured: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      search: '',
      inStock: '',
      minRating: '',
      page: 1
    },
    availableFilters: {
      categories: [],
      brands: [],
      productTypes: [],
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
        productType: '',
        brand: '',
        minPrice: '',
        maxPrice: '',
        featured: '',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        search: '',
        inStock: '',
        minRating: '',
        page: 1
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
        if (action.payload.filters) {
          state.availableFilters = action.payload.filters;
        }
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
        state.error = action.payload;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.featuredProducts = action.payload.data;
      })
      .addCase(fetchNewArrivals.fulfilled, (state, action) => {
        state.newArrivals = action.payload.data;
      })
      .addCase(fetchBestSelling.fulfilled, (state, action) => {
        state.bestSelling = action.payload.data;
      });
  },
});

export const { clearProduct, updateFilters, resetFilters, clearProductsError } = productSlice.actions;
export default productSlice.reducer;