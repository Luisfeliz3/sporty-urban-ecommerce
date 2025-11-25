import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';

// Async thunks for backend cart operations
export const syncCartWithServer = createAsyncThunk(
  'cart/syncCartWithServer',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      
      if (!auth.userInfo) {
        // If not logged in, just return local cart
        const localCart = localStorage.getItem('cartItems');
        return localCart ? JSON.parse(localCart) : [];
      }

      const localCart = localStorage.getItem('cartItems');
      const parsedLocalCart = localCart ? JSON.parse(localCart) : [];

      const { data } = await API.post('/cart/sync', {
        localCart: parsedLocalCart
      });

      // Update local storage with synced cart
      localStorage.setItem('cartItems', JSON.stringify(data.data));
      
      return data.data;
    } catch (error) {
      console.error('Cart sync error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to sync cart');
    }
  }
);

export const addToCartServer = createAsyncThunk(
  'cart/addToCartServer',
  async (item, { rejectWithValue }) => {
    try {
      const { data } = await API.post('/cart', item);
      console.log(item + "<<<<<*****>>>>>>>>")
      // Update local storage
      localStorage.setItem('cartItems', JSON.stringify(data.data));
      
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add item to cart');
    }
  }
);

export const removeFromCartServer = createAsyncThunk(
  'cart/removeFromCartServer',
  async ({ productId, size, color }, { rejectWithValue }) => {
    try {
      const { data } = await API.delete('/cart', {
        data: { product: productId, size, color }
      });
      
      // Update local storage
      localStorage.setItem('cartItems', JSON.stringify(data.data));
      
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove item from cart');
    }
  }
);

export const updateCartItemQuantityServer = createAsyncThunk(
  'cart/updateCartItemQuantityServer',
  async ({ productId, size, color, quantity }, { rejectWithValue }) => {
    try {
      const { data } = await API.put('/cart', {
        product: productId,
        size,
        color,
        quantity
      });
      
      // Update local storage
      localStorage.setItem('cartItems', JSON.stringify(data.data));
      
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update cart item');
    }
  }
);

export const clearCartServer = createAsyncThunk(
  'cart/clearCartServer',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await API.delete('/cart/clear');
      
      // Update local storage
      localStorage.setItem('cartItems', JSON.stringify(data.data));
      
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
    }
  }
);

// Get initial state from localStorage
const cartItemsFromStorage = localStorage.getItem('cartItems')
  ? JSON.parse(localStorage.getItem('cartItems'))
  : [];

const shippingAddressFromStorage = localStorage.getItem('shippingAddress')
  ? JSON.parse(localStorage.getItem('shippingAddress'))
  : {};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cartItems: cartItemsFromStorage,
    shippingAddress: shippingAddressFromStorage,
    paymentMethod: 'Credit Card',
    loading: false,
    error: null,
    lastSync: null,
  },
  reducers: {
    // Local cart actions (for when user is not logged in)
    addToCartLocal: (state, action) => {
      const item = action.payload;
      const existItem = state.cartItems.find(
        (x) => x.product === item.product && x.size === item.size && x.color === item.color
      );

      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
          x.product === existItem.product && x.size === existItem.size && x.color === existItem.color
            ? { ...x, quantity: x.quantity + item.quantity }
            : x
        );
      } else {
        state.cartItems.push(item);
      }

      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    removeFromCartLocal: (state, action) => {
      const { productId, size, color } = action.payload;
      state.cartItems = state.cartItems.filter(
        (item) => !(item.product === productId && item.size === size && item.color === color)
      );
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    updateCartItemQuantityLocal: (state, action) => {
      const { productId, size, color, quantity } = action.payload;
      const item = state.cartItems.find(
        (item) => item.product === productId && item.size === size && item.color === color
      );
      
      if (item) {
        if (quantity === 0) {
          state.cartItems = state.cartItems.filter(
            (item) => !(item.product === productId && item.size === size && item.color === color)
          );
        } else {
          item.quantity = quantity;
        }
        localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
      }
    },
    clearCartLocal: (state) => {
      state.cartItems = [];
      localStorage.removeItem('cartItems');
    },
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      localStorage.setItem('shippingAddress', JSON.stringify(state.shippingAddress));
    },
    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },
    clearCartError: (state) => {
      state.error = null;
    },
    setCartItems: (state, action) => {
      state.cartItems = action.payload;
      localStorage.setItem('cartItems', JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    builder
      // Sync cart with server
      .addCase(syncCartWithServer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncCartWithServer.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload;
        state.lastSync = new Date().toISOString();
      })
      .addCase(syncCartWithServer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add to cart server
      .addCase(addToCartServer.fulfilled, (state, action) => {
        state.cartItems = action.payload;
      })
      // Remove from cart server
      .addCase(removeFromCartServer.fulfilled, (state, action) => {
        state.cartItems = action.payload;
      })
      // Update cart item quantity server
      .addCase(updateCartItemQuantityServer.fulfilled, (state, action) => {
        state.cartItems = action.payload;
      })
      // Clear cart server
      .addCase(clearCartServer.fulfilled, (state, action) => {
        state.cartItems = action.payload;
      });
  },
});

export const {
  addToCartLocal,
  removeFromCartLocal,
  updateCartItemQuantityLocal,
  clearCartLocal,
  saveShippingAddress,
  savePaymentMethod,
  clearCartError,
  setCartItems,
} = cartSlice.actions;

export default cartSlice.reducer;