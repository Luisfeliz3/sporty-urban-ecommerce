import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Divider,
  CircularProgress,
} from '@mui/material';
import { Google, Visibility, VisibilityOff } from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../store/slices/authSlice';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { loading, error, userInfo } = useSelector((state) => state.auth);

  const redirect = location.search ? location.search.split('=')[1] : '/';

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [userInfo, redirect, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
     console.log("<<<<<*****>>>>>>>")
    console.log('Login form submitted:', formData);
    dispatch(login(formData));
  };

  const handleGoogleLogin = () => {
    // For now, just show a message
    alert('Google login will be implemented later');
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Test credentials for easy testing
  const fillTestCredentials = () => {
    setFormData({
      email: 'john@example.com',
      password: '123456'
    });
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" fontWeight="bold">
          Sign In
        </Typography>

        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Welcome back to Urban Athlete
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <Button
                  onClick={handleClickShowPassword}
                  sx={{ minWidth: 'auto', p: 1 }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </Button>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Sign In'
            )}
          </Button>

          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Button
              onClick={fillTestCredentials}
              variant="outlined"
              size="small"
              color="secondary"
            >
              Fill Test Credentials
            </Button>
          </Box>

          <Divider sx={{ my: 2 }}>OR</Divider>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<Google />}
            onClick={handleGoogleLogin}
            sx={{ mb: 2 }}
            disabled={loading}
          >
            Sign in with Google
          </Button>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Don't have an account?{' '}
              <Link
                to={redirect ? `/register?redirect=${redirect}` : '/register'}
                style={{ 
                  color: '#FF6B35', 
                  textDecoration: 'none',
                  fontWeight: 'bold'
                }}
              >
                Sign up here
              </Link>
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              Test: john@example.com / 123456
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;