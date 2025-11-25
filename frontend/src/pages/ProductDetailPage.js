import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  Chip,
  Rating,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardMedia,
} from '@mui/material';
import { AddShoppingCart, FavoriteBorder } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductDetails } from '../store/slices/productSlice';
import { addToCart, addToCartLocal } from '../store/slices/cartSlice';
import mainTshirtPic from "../images/urbanmaintshirt.png"


const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { product, loading } = useSelector((state) => state.products);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    dispatch(fetchProductDetails(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes[0]);
      setSelectedColor(product.colors[3]);
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      alert('Please select size and color');
      return;
    }

    dispatch(addToCartLocal({
      product: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0].url,
      size: selectedSize,
      color: selectedColor,
      quantity: quantity,
    }));

    navigate('/cart');
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container>
        <Typography>Product not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardMedia
              component="img"
              image={product.images[0].url || mainTshirtPic}
              alt={product.name}
              sx={{ width: '100%', height: 'auto' }}
            />
          </Card>
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <Typography variant="h4" component="h1" gutterBottom>
            {product.name}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Rating value={product.rating} readOnly sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              ({product.reviewCount} reviews)
            </Typography>
          </Box>

          <Typography variant="h5" color="primary.main" gutterBottom>
            ${product.price}
            {product.originalPrice && (
              <Typography
                component="span"
                variant="h6"
                color="text.secondary"
                sx={{ textDecoration: 'line-through', ml: 1 }}
              >
                ${product.originalPrice}
              </Typography>
            )}
          </Typography>

          <Typography variant="body1" paragraph sx={{ my: 3 }}>
            {product.description}
          </Typography>

          {/* Size Selection */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Size</InputLabel>
            <Select
              value={selectedSize}
              label="Size"
              onChange={(e) => setSelectedSize(e.target.value)}
            >
              {product.sizes.map((size) => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Color Selection */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Color</InputLabel>
            <Select
              value={selectedColor}
              label="Color"
              onChange={(e) => setSelectedColor(e.target.value)}
            >
              {product.colors.map((color) => (
                <MenuItem key={color.name} value={color.name}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        backgroundColor: color.code,
                        borderRadius: '50%',
                        mr: 1,
                        border: '1px solid #ccc'
                      }}
                    />
                    {color.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Quantity */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Quantity</InputLabel>
            <Select
              value={quantity}
              label="Quantity"
              onChange={(e) => setQuantity(e.target.value)}
            >
              {[...Array(10).keys()].map((x) => (
                <MenuItem key={x + 1} value={x + 1}>
                  {x + 1}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddShoppingCart />}
              onClick={handleAddToCart}
              sx={{ flex: 2 }}
            >
              Add to Cart
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<FavoriteBorder />}
              sx={{ flex: 1 }}
            >
              Wishlist
            </Button>
          </Box>

          {/* Product Details */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Product Details
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Brand:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">{product.brand}</Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Category:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">{product.category}</Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Sport Type:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Chip label={product.sportType} size="small" />
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetailPage;