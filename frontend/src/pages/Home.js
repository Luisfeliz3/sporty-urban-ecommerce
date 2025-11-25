import React, { useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/slices/productSlice';
import ProductGrid from '../components/Product/ProductGrid';
import mainTshirtPic from "../images/urbanmaintshirt.png"


const HomePage = () => {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts({ page: 1 }));
  }, [dispatch]);

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #FF6B35 0%, #2D3748 100%)',
          color: 'white',
          py: 8,
          mb: 6,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{ fontWeight: 700 }}
              >
                URBAN ATHLETE GEAR
              </Typography>
              <Typography variant="h5" gutterBottom sx={{ mb: 3, opacity: 0.9 }}>
                Performance Meets Street Style
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, opacity: 0.8 }}>
                Discover our collection of high-performance athletic wear designed 
                for the urban athlete. From the court to the streets, we've got you covered.
              </Typography>
              <Button
                variant="contained"
                size="large"
                component={Link}
                to="/products"
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'grey.100',
                  },
                }}
              >
                Shop Collection
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src={mainTshirtPic}
                alt="Urban Athletic"
                sx={{
                  width: '100%',
                  borderRadius: 2,
                  boxShadow: 3,
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Featured Products */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            Featured Products
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Best sellers and new arrivals
          </Typography>
        </Box>

        <ProductGrid products={products.slice(0, 8)} loading={loading} />

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            size="large"
            component={Link}
            to="/products"
          >
            View All Products
          </Button>
        </Box>
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card sx={{ textAlign: 'center', p: 3 }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Fast Shipping
                  </Typography>
                  <Typography color="text.secondary">
                    Free shipping on orders over $50. Get your gear in 2-3 business days.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ textAlign: 'center', p: 3 }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Quality Guarantee
                  </Typography>
                  <Typography color="text.secondary">
                    Premium materials and construction. 30-day satisfaction guarantee.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ textAlign: 'center', p: 3 }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Expert Support
                  </Typography>
                  <Typography color="text.secondary">
                    Our team is here to help you find the perfect fit and style.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;