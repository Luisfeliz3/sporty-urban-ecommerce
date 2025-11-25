import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { sportyUrbanTheme } from './theme/theme';
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

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={sportyUrbanTheme}>
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
              </Routes>
            </main>
          </div>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;