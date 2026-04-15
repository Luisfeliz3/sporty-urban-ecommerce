import React, { useState } from 'react';
import { Box } from '@mui/material';
import defaultProductImg from "../../images/no_images.jpeg";

const ProductImage = ({ product, size = 'medium', style = {}, onClick }) => {
  const [imgError, setImgError] = useState(false);
  
  const getImageUrl = () => {
    if (!product || imgError) {
      return defaultProductImg;
    }
    
    // Check if images array exists and has items
    if (product.images && product.images.length > 0) {
      const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
      if (primaryImage && primaryImage.url) {
        // Ensure the URL has a leading slash if it's relative
        let url = primaryImage.url;
        if (url && !url.startsWith('http') && !url.startsWith('/')) {
          url = '/' + url;
        }
        return url;
      }
    }
    
    // Check if there's a direct image property (legacy)
    if (product.image) {
      return product.image;
    }
    
    return defaultProductImg;
  };
  
  const sizeMap = {
    small: { width: 40, height: 40 },
    medium: { width: 80, height: 80 },
    large: { width: 200, height: 200 },
    card: { width: '100%', height: 220 },
    product: { width: '100%', height: 'auto', minHeight: 400 }
  };
  
  const defaultSize = sizeMap[size] || sizeMap.medium;
  
  const imageUrl = getImageUrl();
  
  return (
    <Box
      component="img"
      src={imageUrl}
      alt={product?.name || 'Product image'}
      sx={{
        ...defaultSize,
        objectFit: 'contain',
        backgroundColor: '#f5f5f5',
        ...style
      }}
      onError={(e) => {
        console.error(`Image failed to load: ${imageUrl}`);
        e.target.src = defaultProductImg;
        setImgError(true);
      }}
      onClick={onClick}
    />
  );
};

export default ProductImage;