import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';

// Helper function to get unique item key
export const getCartItemKey = (item) => {
  return `${item.product}_${item.size}_${item.color}`;
};

// Helper function to merge duplicate cart items
const mergeCartItems = (items) => {
  if (!items || !Array.isArray(items)) return [];
  
  const mergedMap = new Map();
  
  items.forEach(item => {
    if (!item || !item.product) return;
    
    const key = getCartItemKey(item);
    if (mergedMap.has(key)) {
      const existing = mergedMap.get(key);
      existing.quantity = (existing.quantity || 0) + (item.quantity || 0);
    } else {
      // Create a clean copy of the item
      mergedMap.set(key, {
        product: item.product,
        name: item.name || 'Product',
        price: Number(item.price) || 0,
        image: typeof item.image === 'string' ? item.image : (item.image?.url || '../../images/no_images.jpeg'),
        size: item.size || 'N/A',
        color: item.color || 'N/A',
        quantity: Number(item.quantity) || 0,
      });
    }
  });
  
  return Array.from(mergedMap.values());
};

// Async thunks for backend cart operations
export const syncCartWithServer = createAsyncThunk(
  'cart/syncCartWithServer',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      
      if (!auth.userInfo) {
        const localCart = localStorage.getItem('cartItems');
        return localCart ? JSON.parse(localCart) : [];
      }

      const localCart = localStorage.getItem('cartItems');
      let parsedLocalCart = localCart ? JSON.parse(localCart) : [];
      
      // Merge duplicate items in local cart before syncing
      const mergedLocalCart = mergeCartItems(parsedLocalCart);

      const { data } = await API.post('/cart/sync', {
        localCart: mergedLocalCart
      });

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
      localStorage.setItem('cartItems', JSON.stringify(data.data));
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
    }
  }
);

// Get initial state from localStorage with merging
const getInitialCartItems = () => {
  try {
    const stored = localStorage.getItem('cartItems');
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return mergeCartItems(parsed);
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
    return [];
  }
};

const getInitialShippingAddress = () => {
  try {
    const stored = localStorage.getItem('shippingAddress');
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    return {};
  }
};

const cartItemsFromStorage = getInitialCartItems();
const shippingAddressFromStorage = getInitialShippingAddress();

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
    // FIXED: This ensures quantity updates instead of duplicates
    addToCartLocal: (state, action) => {
      const newItem = action.payload;
      
      // Validate required fields
      if (!newItem || !newItem.product) {
        console.error('Invalid cart item:', newItem);
        return;
      }
      
      // Find if the item already exists (matching product, size, and color)
      const existingItemIndex = state.cartItems.findIndex(
        (item) => item.product === newItem.product && 
                  item.size === newItem.size && 
                  item.color === newItem.color
      );
      
      if (existingItemIndex !== -1) {
        // Item exists - update quantity
        state.cartItems[existingItemIndex].quantity += newItem.quantity;
        console.log(`Updated quantity for ${state.cartItems[existingItemIndex].name} to ${state.cartItems[existingItemIndex].quantity}`);
      } else {
        // Item doesn't exist - add new item
        state.cartItems.push({
          product: newItem.product,
          name: newItem.name || 'Product',
          price: Number(newItem.price) || 0,
          image: typeof newItem.image === 'string' ? newItem.image : '/images/placeholder.jpg',
          size: newItem.size || 'N/A',
          color: newItem.color || 'N/A',
          quantity: Number(newItem.quantity) || 1,
        });
        console.log(`Added new item: ${newItem.name}`);
      }
      
      // Save to localStorage
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
      const itemIndex = state.cartItems.findIndex(
        (item) => item.product === productId && item.size === size && item.color === color
      );
      
      if (itemIndex !== -1) {
        if (quantity <= 0) {
          state.cartItems.splice(itemIndex, 1);
        } else {
          state.cartItems[itemIndex].quantity = quantity;
        }
        localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
      }
    },
    
clearCartLocal: (state) => {
  state.cartItems = [];
  state.shippingAddress = {};
  state.paymentMethod = 'Credit Card';
  localStorage.removeItem('cartItems');
  localStorage.removeItem('shippingAddress');
  console.log('Cart completely cleared');
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
      state.cartItems = mergeCartItems(action.payload);
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    
    // Utility action to merge any existing duplicates
    mergeDuplicateItems: (state) => {
      state.cartItems = mergeCartItems(state.cartItems);
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(syncCartWithServer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncCartWithServer.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = mergeCartItems(action.payload);
        state.lastSync = new Date().toISOString();
      })
      .addCase(syncCartWithServer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addToCartServer.fulfilled, (state, action) => {
        state.cartItems = mergeCartItems(action.payload);
      })
      .addCase(removeFromCartServer.fulfilled, (state, action) => {
        state.cartItems = mergeCartItems(action.payload);
      })
      .addCase(updateCartItemQuantityServer.fulfilled, (state, action) => {
        state.cartItems = mergeCartItems(action.payload);
      })
      .addCase(clearCartServer.fulfilled, (state, action) => {
        state.cartItems = mergeCartItems(action.payload);
      });
  },
});

// Export actions
export const {
  addToCartLocal,
  removeFromCartLocal,
  updateCartItemQuantityLocal,
  clearCartLocal,
  saveShippingAddress,
  savePaymentMethod,
  clearCartError,
  setCartItems,
  mergeDuplicateItems,
} = cartSlice.actions;

// Selector to get unique cart items (ensures no duplicates in display)
export const selectUniqueCartItems = (state) => {
  return mergeCartItems(state.cart.cartItems);
};

// Selector to get cart item count
export const selectCartItemCount = (state) => {
  return state.cart.cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
};

// Selector to get cart total
export const selectCartTotal = (state) => {
  return state.cart.cartItems.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 0)), 0);
};

export default cartSlice.reducer;