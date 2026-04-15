import React, { useState } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  Rating,
} from '@mui/material';
import { AddShoppingCart, FavoriteBorder } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCartLocal } from '../../store/slices/cartSlice';
import defaultProductImg from "../../images/no_images.jpeg";
import ProductImage from '../Common/ProductImage';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const [imgError, setImgError] = useState(false);

  // Helper function to get the correct image URL
  const getImageUrl = () => {
    if (!product.images || product.images.length === 0) {
      return defaultProductImg;
    }
    
    const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
    let imageUrl = primaryImage?.url;
    
    // If no URL found, use default
    if (!imageUrl) {
      return defaultProductImg;
    }
    
    // If the URL is relative, make sure it starts correctly
    if (imageUrl.startsWith('/')) {
      return imageUrl;
    }
    
    // If it's an absolute URL from GCS, use as is
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // Default fallback
    return defaultProductImg;
  };

  const handleAddToCart = () => {
    const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
    
    dispatch(addToCartLocal({
      product: product._id,
      name: product.name,
      price: defaultVariant ? defaultVariant.price : product.price,
      image: getImageUrl(),
      variant: defaultVariant ? defaultVariant.name : 'Standard',
      quantity: 1,
    }));
  };

  const displayPrice = product.variants && product.variants.length > 0 
    ? product.variants[0].price 
    : product.price;

  const displayOriginalPrice = product.variants && product.variants.length > 0 && product.variants[0].originalPrice
    ? product.variants[0].originalPrice
    : product.originalPrice;

  const getProductTypeLabel = (type) => {
    const types = {
      detergent: 'Laundry',
      beauty: 'Beauty',
      homecare: 'Home Care',
      grocery: 'Grocery',
      health: 'Health',
      homekitchen: 'Home & Kitchen',
      baby: 'Baby Care',
      pet: 'Pet Care'
    };
    return types[type] || type;
  };

  const imageUrl = getImageUrl();
  
  console.log('Product image URL:', imageUrl); // Debug log

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {product.featured && (
        <Chip
          label="Featured"
          color="primary"
          size="small"
          sx={{ position: 'absolute', top: 10, left: 10, zIndex: 1 }}
        />
      )}
      
      <ProductImage product={product} size="card" />
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {product.brand}
          </Typography>
          <Chip
            label={getProductTypeLabel(product.productType)}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.7rem' }}
          />
        </Box>
        
        <Typography 
          variant="h6" 
          component={Link} 
          to={`/product/${product._id}`} 
          sx={{ 
            textDecoration: 'none', 
            color: 'inherit',
            '&:hover': { color: 'primary.main' },
            fontSize: '1rem',
            fontWeight: 600,
            display: 'block',
            mb: 1
          }}
        >
          {product.name}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="h6" color="primary.main" fontWeight="600">
            ${displayPrice}
          </Typography>
          {displayOriginalPrice && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textDecoration: 'line-through' }}
            >
              ${displayOriginalPrice}
            </Typography>
          )}
        </Box>

        {product.rating > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Rating value={product.rating} readOnly size="small" />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
              ({product.reviewCount})
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
          {product.attributes?.packSize && (
            <Chip label={product.attributes.packSize} size="small" variant="outlined" />
          )}
          {product.attributes?.weight?.value && (
            <Chip label={`${product.attributes.weight.value}${product.attributes.weight.unit}`} size="small" variant="outlined" />
          )}
          {product.attributes?.quantity > 1 && (
            <Chip label={`${product.attributes.quantity}-pack`} size="small" variant="outlined" />
          )}
        </Box>
      </CardContent>
      
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddShoppingCart />}
          onClick={handleAddToCart}
          size="small"
          disabled={product.inventory === 0}
        >
          {product.inventory === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
        <Button
          component={Link}
          to={`/product/${product._id}`}
          variant="outlined"
          size="small"
          fullWidth
        >
          Details
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;