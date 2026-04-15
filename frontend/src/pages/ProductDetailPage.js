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
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
} from '@mui/material';
import { AddShoppingCart, FavoriteBorder, ExpandMore, LocalShipping, Security, Refresh } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductDetails } from '../store/slices/productSlice';
import { addToCartLocal } from '../store/slices/cartSlice';
import defaultProductImg from "../images/no_images.jpeg";
import ProductImage from '../components/Common/ProductImage';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { product, loading } = useSelector((state) => state.products);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  // Add this helper function at the top of ProductDetailPage component
const getImageUrl = (image) => {
  if (!image) return defaultProductImg;
  if (image.url) {
    // Handle relative URLs
    if (image.url.startsWith('/')) return image.url;
    if (image.url.startsWith('http')) return image.url;
    return defaultProductImg;
  }
  return defaultProductImg;
};
  useEffect(() => {
    dispatch(fetchProductDetails(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product]);


  
  const handleAddToCart = () => {
    dispatch(addToCartLocal({
      product: product._id,
      name: product.name,
      price: selectedVariant ? selectedVariant.price : product.price,
      // image: product.images[0]?.url || defaultProductImg,
      image: product.images[0]?.url,
      variant: selectedVariant ? selectedVariant.name : 'Standard',
      quantity: quantity,
    }));

    // Show success message or navigate to cart
    navigate('/cart');
  };

  const getProductTypeIcon = () => {
    // Return appropriate icon based on product type
    return null;
  };

  const renderSpecifications = () => {
    const specs = [];
    
    // Common specs
    if (product.attributes?.brand) specs.push({ label: 'Brand', value: product.brand });
    if (product.attributes?.weight?.value) specs.push({ label: 'Weight', value: `${product.attributes.weight.value}${product.attributes.weight.unit}` });
    if (product.attributes?.quantity) specs.push({ label: 'Quantity', value: `${product.attributes.quantity} items` });
    if (product.attributes?.packSize) specs.push({ label: 'Pack Size', value: product.attributes.packSize });
    
    // Product type specific
    switch (product.productType) {
      case 'detergent':
        if (product.attributes?.detergentType) specs.push({ label: 'Type', value: product.attributes.detergentType });
        if (product.attributes?.scent) specs.push({ label: 'Scent', value: product.attributes.scent });
        if (product.attributes?.washLoads) specs.push({ label: 'Wash Loads', value: product.attributes.washLoads });
        if (product.attributes?.isHypoallergenic) specs.push({ label: 'Hypoallergenic', value: 'Yes' });
        if (product.attributes?.isEcoFriendly) specs.push({ label: 'Eco-Friendly', value: 'Yes' });
        break;
      case 'beauty':
        if (product.attributes?.skinType?.length) specs.push({ label: 'Skin Type', value: product.attributes.skinType.join(', ') });
        if (product.attributes?.spf) specs.push({ label: 'SPF', value: product.attributes.spf });
        if (product.attributes?.isCrueltyFree) specs.push({ label: 'Cruelty Free', value: 'Yes' });
        if (product.attributes?.isVegan) specs.push({ label: 'Vegan', value: 'Yes' });
        break;
      case 'grocery':
        if (product.attributes?.dietaryInfo?.length) specs.push({ label: 'Dietary Info', value: product.attributes.dietaryInfo.join(', ') });
        if (product.attributes?.expiryDate) specs.push({ label: 'Best Before', value: new Date(product.attributes.expiryDate).toLocaleDateString() });
        break;
      case 'health':
        if (product.attributes?.healthCategory) specs.push({ label: 'Category', value: product.attributes.healthCategory });
        if (product.attributes?.isPrescriptionRequired) specs.push({ label: 'Prescription Required', value: 'Yes' });
        break;
      case 'homekitchen':
        if (product.attributes?.material) specs.push({ label: 'Material', value: product.attributes.material });
        if (product.attributes?.color) specs.push({ label: 'Color', value: product.attributes.color });
        if (product.attributes?.dimensions?.length) specs.push({ label: 'Dimensions', value: `${product.attributes.dimensions.length} x ${product.attributes.dimensions.width} x ${product.attributes.dimensions.height} ${product.attributes.dimensions.unit}` });
        break;
    }
    
    return specs;
  };

  if (loading) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Typography>Loading product details...</Typography>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Typography>Product not found</Typography>
        <Button variant="contained" onClick={() => navigate('/products')} sx={{ mt: 2 }}>
          Continue Shopping
        </Button>
      </Container>
    );
  }

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentOriginalPrice = selectedVariant?.originalPrice || product.originalPrice;
  const currentInventory = selectedVariant ? selectedVariant.inventory : product.inventory;
  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Card>
<ProductImage product={product} size="product" />
          </Card>
          {product.images.length > 1 && (
            <Box sx={{ display: 'flex', gap: 1, mt: 2, overflowX: 'auto' }}>
              {product.images.map((image, index) => (
                <Box
                  key={index}
                  component="img"
                  src={image.url}
                  alt={`Thumbnail ${index + 1}`}
                  onClick={() => setActiveImage(index)}
                  sx={{
                    width: 80,
                    height: 80,
                    objectFit: 'cover',
                    borderRadius: 1,
                    cursor: 'pointer',
                    border: activeImage === index ? '2px solid #1976d2' : '1px solid #e0e0e0',
                    '&:hover': { borderColor: 'primary.main' }
                  }}
                />
              ))}
            </Box>
          )}
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <Typography variant="h4" component="h1" gutterBottom>
            {product.name}
          </Typography>
          
          <Typography variant="body1" color="text.secondary" gutterBottom>
            by {product.brand}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Rating value={product.rating} readOnly precision={0.5} />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({product.reviewCount} reviews)
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 3 }}>
            <Typography variant="h4" color="primary.main" fontWeight="bold">
              ${currentPrice}
            </Typography>
            {currentOriginalPrice && currentOriginalPrice > currentPrice && (
              <Typography variant="h6" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                ${currentOriginalPrice}
              </Typography>
            )}
            {currentOriginalPrice && currentOriginalPrice > currentPrice && (
              <Chip 
                label={`Save ${Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)}%`}
                color="success"
                size="small"
              />
            )}
          </Box>

          <Typography variant="body1" paragraph sx={{ my: 3 }}>
            {product.shortDescription || product.description.substring(0, 200)}
          </Typography>

          {/* Variants Selection */}
          {product.variants && product.variants.length > 0 && (
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Select Variant</InputLabel>
              <Select
                value={selectedVariant?.name || ''}
                label="Select Variant"
                onChange={(e) => {
                  const variant = product.variants.find(v => v.name === e.target.value);
                  setSelectedVariant(variant);
                }}
              >
                {product.variants.map((variant) => (
                  <MenuItem key={variant.name} value={variant.name}>
                    {variant.name} - ${variant.price}
                    {variant.inventory === 0 && ' (Out of Stock)'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Quantity */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Quantity</InputLabel>
            <Select
              value={quantity}
              label="Quantity"
              onChange={(e) => setQuantity(e.target.value)}
              disabled={currentInventory === 0}
            >
              {[...Array(Math.min(10, currentInventory || 10)).keys()].map((x) => (
                <MenuItem key={x + 1} value={x + 1}>
                  {x + 1}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Stock Status */}
          {currentInventory === 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Out of Stock
            </Alert>
          )}
          {currentInventory > 0 && currentInventory < 10 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Only {currentInventory} left in stock - order soon
            </Alert>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddShoppingCart />}
              onClick={handleAddToCart}
              disabled={currentInventory === 0}
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

          {/* Shipping Info */}
          <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 2, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <LocalShipping color="primary" />
                  <Typography variant="caption" display="block">Free Shipping</Typography>
                  <Typography variant="caption" color="text.secondary">on orders $50+</Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Security color="primary" />
                  <Typography variant="caption" display="block">Secure Checkout</Typography>
                  <Typography variant="caption" color="text.secondary">100% Secure</Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Refresh color="primary" />
                  <Typography variant="caption" display="block">Easy Returns</Typography>
                  <Typography variant="caption" color="text.secondary">30-day returns</Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Category Tags */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
            <Chip label={product.category} size="small" />
            {product.subcategory && <Chip label={product.subcategory} size="small" variant="outlined" />}
            {product.tags.slice(0, 3).map((tag, index) => (
              <Chip key={index} label={tag} size="small" variant="outlined" />
            ))}
          </Box>
        </Grid>
      </Grid>

      {/* Product Details Accordion */}
      <Box sx={{ mt: 6 }}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">Product Description</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" paragraph>
              {product.description}
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">Specifications</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {renderSpecifications().map((spec, index) => (
                <React.Fragment key={index}>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">{spec.label}</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">{spec.value}</Typography>
                  </Grid>
                </React.Fragment>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">Shipping & Returns</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              <strong>Shipping:</strong> Free standard shipping on orders over $50. Express shipping available at checkout.
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Returns:</strong> We accept returns within 30 days of delivery for unopened products in original condition.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Container>
  );
};

export default ProductDetailPage;