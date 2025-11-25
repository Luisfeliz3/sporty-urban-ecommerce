import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import productReducer from './slices/productSlice';
import orderReducer from './slices/orderSlice';
import profileReducer from './slices/profileSlice';
import stripeReducer from './slices/stripeSlice'; 
import adminReducer from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    products: productReducer,
    order: orderReducer,
    profile: profileReducer, 
    stripe: stripeReducer,  
     admin: adminReducer,
  },
});