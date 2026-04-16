// Utility function to completely clear cart from all storage
export const clearCartCompletely = (dispatch, clearCartLocalAction) => {
  console.log('Clearing cart completely...');
  
  // Clear from Redux
  if (dispatch && clearCartLocalAction) {
    dispatch(clearCartLocalAction());
  }
  
  // Clear from localStorage
  localStorage.removeItem('cartItems');
  localStorage.removeItem('shippingAddress');
  localStorage.removeItem('paymentMethod');
  
  // Clear sessionStorage if used
  sessionStorage.removeItem('cartItems');
  
  // Dispatch a custom event that other components can listen to
  window.dispatchEvent(new Event('cartCleared'));
  
  console.log('Cart cleared successfully');
};

// Add an event listener to sync cart clearing across tabs
window.addEventListener('storage', (event) => {
  if (event.key === 'cartItems' && !event.newValue) {
    console.log('Cart cleared in another tab');
    // You can dispatch an action here if needed
  }
});