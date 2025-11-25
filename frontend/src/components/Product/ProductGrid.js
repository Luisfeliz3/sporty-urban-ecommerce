import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import ProductCard from './ProductCard';

const ProductGrid = ({ products, loading }) => {
  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography>Loading products...</Typography>
      </Box>
    );
  }

  if (!products || products.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No products found
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {products.map((product) => (
        <Grid item key={product._id} xs={12} sm={6} md={4} lg={3}>
          <ProductCard product={product} />
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductGrid;