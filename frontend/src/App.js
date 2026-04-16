import React from 'react';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCartItems } from './store/slices/cartSlice';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { productsTheme } from './theme/theme';
import RegisterPage from './pages/RegisterPage';
import Header from './components/Layout/Header';
import HomePage from './pages/Home';
import LoginPage from './pages/LoginPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ShippingPage from './pages/ShippingPage';
import PaymentPage from './pages/PaymentPage';
import PlaceOrderPage from './pages/PlaceOrderPage';
import ProfilePage from './pages/ProfilePage';
import CartSync from './components/Cart/CartSync';
import OrderSuccessPage from './pages/OrderSuccessPage';
import AdminDashboard from './pages/AdminDashboard';
import ProductsPage from './pages/ProductsPage';
import { mergeDuplicateItems } from './store/slices/cartSlice';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
function App() {

 const dispatch = useDispatch();
 
  useEffect(() => {
    // Clean up any existing duplicates when app loads
    dispatch(mergeDuplicateItems());
  }, [dispatch]);

 useEffect(() => {
    // Clean up duplicates when app loads
    const cartItems = localStorage.getItem('cartItems');
    if (cartItems) {
      const parsedItems = JSON.parse(cartItems);
      const mergedItems = [];
      
      parsedItems.forEach(item => {
        const existingIndex = mergedItems.findIndex(
          x => x.product === item.product && x.size === item.size && x.color === item.color
        );
        if (existingIndex !== -1) {
          mergedItems[existingIndex].quantity += item.quantity;
        } else {
          mergedItems.push({ ...item });
        }
      });
      
      if (mergedItems.length !== parsedItems.length) {
        dispatch(setCartItems(mergedItems));
      }
    }
  }, [dispatch]);

  return (
    <Provider store={store}>
      <ThemeProvider theme={productsTheme}>
        <CssBaseline />
        <Router>
          <div className="App">
             <CartSync /> {/* Add this line */}
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/shipping" element={<ShippingPage />} />
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/placeorder" element={<PlaceOrderPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/order/:orderId" element={<OrderSuccessPage />} />
                <Route path="/order-success" element={<OrderSuccessPage />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/order/:id" element={<OrderConfirmationPage />} />
                <Route path="/orders" element={<OrderHistoryPage />} />
               <Route path="/orderconfirmation/:id" element={<OrderConfirmationPage />} />

               <Route path="/order/:id" element={<OrderDetailsPage />} />
              </Routes>
            </main>
          </div>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;