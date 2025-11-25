import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { syncCartWithServer } from '../../store/slices/cartSlice';

const CartSync = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems, lastSync } = useSelector((state) => state.cart);

  useEffect(() => {
    // Sync cart when user logs in
    if (userInfo) {
      console.log('🔄 Syncing cart with server...');
      dispatch(syncCartWithServer());
    }
  }, [userInfo, dispatch]);

  useEffect(() => {
    // Auto-sync cart every 5 minutes when user is logged in
    if (userInfo) {
      const interval = setInterval(() => {
        console.log('🔄 Auto-syncing cart...');
        dispatch(syncCartWithServer());
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(interval);
    }
  }, [userInfo, dispatch]);

  return null; // This is a utility component, doesn't render anything
};

export default CartSync;