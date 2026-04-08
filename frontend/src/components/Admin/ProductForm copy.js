import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  IconButton,
  Card,
  CardContent,
} from '@mui/material';
import { Delete, Add, CloudUpload } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { createProduct, updateProduct } from '../../store/slices/adminSlice';

const categories = ['T-Shirts', 'Jerseys', 'Shorts', 'Hoodies', 'Jackets', 'Accessories'];
const sportTypes = ['basketball', 'soccer', 'running', 'training', 'lifestyle', 'skateboarding', 'yoga', 'football', 'baseball'];
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const defaultColors = [
  { name: 'Black', code: '#000000' },
  { name: 'White', code: '#FFFFFF' },
  { name: 'Navy', code: '#1E3A5F' },
  { name: 'Red', code: '#DC2626' },
  { name: 'Royal Blue', code: '#2563EB' },
  { name: 'Gray', code: '#6B7280' },
  { name: 'Green', code: '#059669' },
];

const ProductForm = ({ open, onClose, onSuccess, product }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.admin);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: 'T-Shirts',
    brand: '',
    sizes: [],
    colors: [],
    inventory: 0,
    featured: false,
    sportType: 'lifestyle',
    tags: [],
  });

  const [images, setImages] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [newColor, setNewColor] = useState({ name: '', code: '#000000' });

  useEffect(() => {
    if (product && open) {
      // Populate form with product data for editing
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        originalPrice: product.originalPrice || '',
        category: product.category || 'T-Shirts',
        brand: product.brand || '',
        sizes: product.sizes || [],
        colors: product.colors || [],
        inventory: product.inventory || 0,
        featured: product.featured || false,
        sportType: product.sportType || 'lifestyle',
        tags: product.tags || [],
      });
      // Note: Images are handled separately since they're files
    } else if (open) {
      // Reset form for new product
      setFormData({
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        category: 'T-Shirts',
        brand: '',
        sizes: [],
        colors: [],
        inventory: 0,
        featured: false,
        sportType: 'lifestyle',
        tags: [],
      });
      setImages([]);
    }
  }, [product, open]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addColor = () => {
    if (newColor.name.trim() && !formData.colors.find(c => c.name === newColor.name.trim())) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, { ...newColor }]
      }));
      setNewColor({ name: '', code: '#000000' });
    }
  };

  const removeColor = (colorToRemove) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter(color => color.name !== colorToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : '',
        inventory: parseInt(formData.inventory),
        images: images
      };

      if (product) {
        // Update existing product
        await dispatch(updateProduct({ id: product._id, productData: submitData })).unwrap();
      } else {
        // Create new product
        await dispatch(createProduct(submitData)).unwrap();
      }

      onSuccess();
    } catch (error) {
      console.error('Product form submission error:', error);
    }
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleColorKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addColor();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle>
        {product ? 'Edit Product' : 'Add New Product'}
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Brand"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </Grid>

            {/* Pricing */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                inputProps={{ min: 0, step: 0.01 }}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Original Price (Optional)"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleInputChange}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            {/* Category & Sport Type */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  label="Category"
                  required
                >
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Sport Type</InputLabel>
                <Select
                  name="sportType"
                  value={formData.sportType}
                  onChange={handleInputChange}
                  label="Sport Type"
                  required
                >
                  {sportTypes.map(sport => (
                    <MenuItem key={sport} value={sport}>
                      {sport.charAt(0).toUpperCase() + sport.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Sizes */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Sizes
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {sizes.map(size => (
                  <Chip
                    key={size}
                    label={size}
                    onClick={() => {
                      const newSizes = formData.sizes.includes(size)
                        ? formData.sizes.filter(s => s !== size)
                        : [...formData.sizes, size];
                      setFormData(prev => ({ ...prev, sizes: newSizes }));
                    }}
                    color={formData.sizes.includes(size) ? 'primary' : 'default'}
                    variant={formData.sizes.includes(size) ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </Grid>

            {/* Colors */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Colors
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {formData.colors.map((color, index) => (
                  <Chip
                    key={index}
                    label={color.name}
                    onDelete={() => removeColor(color.name)}
                    sx={{
                      backgroundColor: color.code,
                      color: '#fff',
                      '& .MuiChip-deleteIcon': {
                        color: '#fff'
                      }
                    }}
                  />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  label="Color Name"
                  value={newColor.name}
                  onChange={(e) => setNewColor(prev => ({ ...prev, name: e.target.value }))}
                  onKeyPress={handleColorKeyPress}
                  size="small"
                />
                <input
                  type="color"
                  value={newColor.code}
                  onChange={(e) => setNewColor(prev => ({ ...prev, code: e.target.value }))}
                  style={{ width: 40, height: 40 }}
                />
                <Button onClick={addColor} startIcon={<Add />} size="small">
                  Add
                </Button>
              </Box>
            </Grid>

            {/* Tags */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {formData.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => removeTag(tag)}
                    size="small"
                  />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  label="New Tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  size="small"
                />
                <Button onClick={addTag} startIcon={<Add />} size="small">
                  Add
                </Button>
              </Box>
            </Grid>

            {/* Inventory & Featured */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Inventory"
                name="inventory"
                value={formData.inventory}
                onChange={handleInputChange}
                inputProps={{ min: 0 }}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                  />
                }
                label="Featured Product"
              />
            </Grid>

            {/* Image Upload */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Product Images
              </Typography>
              
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUpload />}
                sx={{ mb: 2 }}
              >
                Upload Images
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  hidden
                />
              </Button>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Selected {images.length} image(s). First image will be set as primary.
              </Typography>

              <Grid container spacing={2}>
                {images.map((image, index) => (
                  <Grid item xs={6} md={3} key={index}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center', p: 1 }}>
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          style={{
                            width: '100%',
                            height: 100,
                            objectFit: 'cover',
                            borderRadius: 4
                          }}
                        />
                        <Typography variant="body2" noWrap sx={{ mt: 1 }}>
                          {image.name}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => removeImage(index)}
                          color="error"
                          sx={{ mt: 0.5 }}
                        >
                          <Delete />
                        </IconButton>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProductForm;