import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
} from '@mui/material';
import { AddShoppingCart, FavoriteBorder } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCartLocal } from '../../store/slices/cartSlice';
import defaultTshirt from "./defaultTshirt.png";


const ProductCard = ({ product }) => {
  const dispatch = useDispatch();

  const handleAddToCart = () => {
    dispatch(addToCartLocal({
      product: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0] ,
      size: product.sizes[0],
      color: product.colors[0],
      quantity: 1,
    }));
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="290"
        image={product.images[0].url || defaultTshirt}
        alt={product.name}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" component="h2" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
            {product.name}
          </Typography>
          <Chip
            label={product.sportType}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {product.brand}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="h6" color="primary.main" fontWeight="600">
            ${product.price}
          </Typography>
          {product.originalPrice && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textDecoration: 'line-through' }}
            >
              ${product.originalPrice}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {product.tags.slice(0, 2).map((tag, index) => (
            <Chip
              key={index}
              label={tag}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.rem' }}
            />
          ))}
        </Box>
      </CardContent>
      
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddShoppingCart />}
          onClick={handleAddToCart}
          size="small"
        >
           <Typography variant="h1" component="h2" sx={{ fontSize: '0.7rem', fontWeight: 600 }}>
            {"Add To Cart"}
          </Typography>
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