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
  Tabs,
  Tab,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { Delete, Add, CloudUpload, ExpandMore } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { createProduct, updateProduct, uploadMultipleProductImages } from '../../store/slices/adminSlice';

// Updated categories for multi-category store
const categories = [
  'Detergents & Laundry',
  'Beauty & Personal Care',
  'Home Care & Cleaning',
  'Grocery & Staples',
  'Health & Household',
  'Home & Kitchen',
  'Baby Care',
  'Pet Care',
  'Auto Care',
  'Office Supplies'
];

const productTypes = [
  { value: 'detergent', label: 'Detergent & Laundry' },
  { value: 'beauty', label: 'Beauty & Personal Care' },
  { value: 'homecare', label: 'Home Care & Cleaning' },
  { value: 'grocery', label: 'Grocery & Staples' },
  { value: 'health', label: 'Health & Household' },
  { value: 'homekitchen', label: 'Home & Kitchen' },
  { value: 'baby', label: 'Baby Care' },
  { value: 'pet', label: 'Pet Care' }
];

// Subcategories based on main category
const subcategories = {
  'Detergents & Laundry': ['Laundry Detergents', 'Fabric Softeners', 'Stain Removers', 'Dryer Sheets', 'Laundry Pods'],
  'Beauty & Personal Care': ['Skincare', 'Haircare', 'Body Care', 'Fragrances', 'Makeup', "Men's Grooming", 'Oral Care', 'Bath & Shower'],
  'Home Care & Cleaning': ['All-Purpose Cleaners', 'Disinfectants', 'Glass Cleaners', 'Bathroom Cleaners', 'Kitchen Cleaners', 'Floor Cleaners'],
  'Grocery & Staples': ['Rice & Grains', 'Cooking Oils', 'Spices & Masalas', 'Snacks & Beverages', 'Breakfast Cereals', 'Pasta & Noodles', 'Canned Goods'],
  'Health & Household': ['Vitamins & Supplements', 'Pain Relief', 'First Aid', 'Personal Hygiene', 'Wellness', 'Medical Supplies'],
  'Home & Kitchen': ['Cookware', 'Kitchen Tools', 'Storage & Organization', 'Home Decor', 'Bedding & Linens', 'Bathroom Accessories'],
  'Baby Care': ['Baby Diapers', 'Baby Wipes', 'Baby Skincare', 'Baby Feeding', 'Baby Safety', 'Baby Gear'],
  'Pet Care': ['Dog Food', 'Cat Food', 'Pet Treats', 'Pet Grooming', 'Pet Accessories', 'Pet Health']
};

const ProductForm = ({ open, onClose, onSuccess, product }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.admin);
  
  const [uploadingImages, setUploadingImages] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [newVariant, setNewVariant] = useState({ name: '', price: '', inventory: 0 });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    price: '',
    originalPrice: '',
    category: 'Detergents & Laundry',
    subcategory: '',
    brand: '',
    productType: 'detergent',
    inventory: 0,
    featured: false,
    tags: [],
    variants: [],
    attributes: {
      // Common attributes
      weight: { value: '', unit: 'g' },
      quantity: 1,
      packSize: '',
      
      // Detergent specific
      detergentType: '',
      scent: '',
      isHypoallergenic: false,
      isEcoFriendly: false,
      washLoads: '',
      
      // Beauty specific
      skinType: [],
      ingredients: [],
      isCrueltyFree: false,
      isVegan: false,
      spf: '',
      
      // Home Care specific
      cleaningType: '',
      isAntibacterial: false,
      
      // Grocery specific
      dietaryInfo: [],
      expiryDate: '',
      nutritionalInfo: { calories: '', protein: '', carbs: '', fat: '' },
      
      // Health specific
      healthCategory: '',
      isPrescriptionRequired: false,
      usageInstructions: '',
      
      // Home & Kitchen specific
      material: '',
      color: '',
      dimensions: { length: '', width: '', height: '', unit: 'cm' }
    }
  });

  const handleFeaturedToggle = (e) => {
  const checked = e.target.checked;
  console.log('Featured toggled to:', checked);
  setFormData(prev => ({
    ...prev,
    featured: checked
  }));
};

useEffect(() => {
  if (product && open) {
    console.log('📝 Editing product with featured status:', product.featured);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      price: product.price || '',
      originalPrice: product.originalPrice || '',
      category: product.category || 'Detergents & Laundry',
      subcategory: product.subcategory || '',
      brand: product.brand || '',
      productType: product.productType || 'detergent',
      inventory: product.inventory || 0,
      featured: product.featured || false, // Ensure this is properly set
      tags: product.tags || [],
      variants: product.variants || [],
      attributes: product.attributes || formData.attributes
    });
    // ... rest of the code
  }
}, [product, open]);

useEffect(() => {
  console.log('FormData featured value changed:', formData.featured);
}, [formData.featured]);

  useEffect(() => {
    if (product && open) {
      console.log('📝 Editing product with images:', product.images);
      setFormData({
        name: product.name || '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        price: product.price || '',
        originalPrice: product.originalPrice || '',
        category: product.category || 'Detergents & Laundry',
        subcategory: product.subcategory || '',
        brand: product.brand || '',
        productType: product.productType || 'detergent',
        inventory: product.inventory || 0,
        featured: product.featured || false,
        tags: product.tags || [],
        variants: product.variants || [],
        attributes: product.attributes || formData.attributes
      });
      // CRITICAL FIX: Ensure images are properly set with their URLs
      const existingImages = product.images || [];
      setImages(existingImages.map(img => ({
        ...img,
        url: img.url, // Keep the full GCS URL
        isPrimary: img.isPrimary || false
      })));
      setImageFiles([]);
    } else if (open) {
      resetForm();
    }
  }, [product, open]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      shortDescription: '',
      price: '',
      originalPrice: '',
      category: 'Detergents & Laundry',
      subcategory: '',
      brand: '',
      productType: 'detergent',
      inventory: 0,
      featured: false,
      tags: [],
      variants: [],
      attributes: {
        weight: { value: '', unit: 'g' },
        quantity: 1,
        packSize: '',
        detergentType: '',
        scent: '',
        isHypoallergenic: false,
        isEcoFriendly: false,
        washLoads: '',
        skinType: [],
        ingredients: [],
        isCrueltyFree: false,
        isVegan: false,
        spf: '',
        cleaningType: '',
        isAntibacterial: false,
        dietaryInfo: [],
        expiryDate: '',
        nutritionalInfo: { calories: '', protein: '', carbs: '', fat: '' },
        healthCategory: '',
        isPrescriptionRequired: false,
        usageInstructions: '',
        material: '',
        color: '',
        dimensions: { length: '', width: '', height: '', unit: 'cm' }
      }
    });
    setImages([]);
    setImageFiles([]);
    setNewTag('');
    setNewVariant({ name: '', price: '', inventory: 0 });
  };

  const handleInputChange = (e) => {
const { name, value, type, checked } = e.target;
  
  // Handle checkbox/switch inputs
  if (type === 'checkbox') {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  } else {
    // Handle text/number inputs
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }
  
  // Debug logging
  console.log(`Field ${name} changed:`, type === 'checkbox' ? checked : value);
  };

  const handleAttributeChange = (path, value) => {
    setFormData(prev => {
      const newAttributes = { ...prev.attributes };
      const keys = path.split('.');
      let current = newAttributes;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return { ...prev, attributes: newAttributes };
    });
  };

  // CRITICAL FIX: Completely rewritten handleImageChange
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setUploadingImages(true);
    
    try {
      console.log('📸 Uploading files:', files.map(f => ({ name: f.name, size: f.size, type: f.type })));
      
      // Upload images to server
      const uploadedImages = await dispatch(uploadMultipleProductImages(files)).unwrap();
      
      console.log('✅ Upload successful - received images:', uploadedImages);
      
      // CRITICAL FIX: Don't modify the URLs - keep them as returned from GCS
      const processedImages = uploadedImages.map((img, index) => ({
        url: img.url, // Keep the full GCS URL as is
        filename: img.filename,
        contentType: img.contentType,
        isPrimary: images.length === 0 && index === 0, // First image becomes primary if no images exist
        alt: formData.name || 'Product image',
        size: img.size,
        uploadedAt: img.uploadedAt || new Date()
      }));
      
      console.log('📸 Processed images:', processedImages);
      
      setImages(prev => {
        const updated = [...prev, ...processedImages];
        console.log('Updated images state:', updated);
        return updated;
      });
      
      alert(`${uploadedImages.length} image(s) uploaded successfully!`);
    } catch (error) {
      console.error('❌ Detailed upload error:', error);
      alert(`Failed to upload images: ${error.message || 'Please try again'}`);
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
  };

  const removeImage = (indexToRemove) => {
    setImages(prev => {
      const newImages = prev.filter((_, index) => index !== indexToRemove);
      // If we removed the primary image, set the first image as primary if available
      if (prev[indexToRemove].isPrimary && newImages.length > 0) {
        newImages[0].isPrimary = true;
      }
      return newImages;
    });
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

  const addVariant = () => {
    if (newVariant.name.trim() && newVariant.price) {
      setFormData(prev => ({
        ...prev,
        variants: [...prev.variants, { 
          ...newVariant, 
          price: parseFloat(newVariant.price),
          inventory: parseInt(newVariant.inventory) || 0
        }]
      }));
      setNewVariant({ name: '', price: '', inventory: 0 });
    }
  };

  const removeVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  // CRITICAL FIX: Updated handleSubmit with better validation and logging
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validate required fields
  if (!formData.name || !formData.price || !formData.category || !formData.brand) {
    alert('Please fill in all required fields');
    return;
  }
  
  // Validate at least one image
  if (images.length === 0) {
    alert('Please upload at least one product image');
    return;
  }
  
  try {
    console.log('📝 Submitting product with images:', images);
    console.log('📝 Featured status before submit:', formData.featured);
    
    // CRITICAL FIX: Ensure featured is a boolean
    const isFeatured = formData.featured === true || formData.featured === 'true';
    
    // Prepare images for submission
    const imagesForSubmission = images.map(img => ({
      url: img.url,
      filename: img.filename,
      contentType: img.contentType || 'image/jpeg',
      isPrimary: img.isPrimary || false,
      alt: img.alt || formData.name,
      size: img.size || 0,
      uploadedAt: img.uploadedAt || new Date()
    }));
    
    // Clean attributes
    const cleanedAttributes = { ...formData.attributes };
    
    // Remove empty strings from enum fields
    if (cleanedAttributes.cleaningType === '' || cleanedAttributes.cleaningType === null) {
      delete cleanedAttributes.cleaningType;
    }
    if (cleanedAttributes.healthCategory === '' || cleanedAttributes.healthCategory === null) {
      delete cleanedAttributes.healthCategory;
    }
    if (cleanedAttributes.detergentType === '' || cleanedAttributes.detergentType === null) {
      delete cleanedAttributes.detergentType;
    }
    
    const submitData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      shortDescription: formData.shortDescription?.trim() || formData.description.substring(0, 200),
      price: parseFloat(formData.price),
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
      category: formData.category,
      subcategory: formData.subcategory,
      brand: formData.brand.trim(),
      productType: formData.productType,
      inventory: parseInt(formData.inventory) || 0,
      featured: isFeatured, // CRITICAL: Send as boolean
      tags: formData.tags.filter(tag => tag && tag.trim() !== ''),
      attributes: cleanedAttributes,
      variants: formData.variants.map(v => ({
        ...v,
        price: parseFloat(v.price),
        inventory: parseInt(v.inventory) || 0
      })),
      images: imagesForSubmission
    };

    console.log('📤 Submitting product data:', {
      ...submitData,
      featured: submitData.featured,
      featuredType: typeof submitData.featured,
      imagesCount: submitData.images.length
    });

    let result;
    if (product) {
      // Update existing product
      result = await dispatch(updateProduct({ 
        id: product._id, 
        productData: submitData 
      })).unwrap();
      console.log('✅ Update successful, featured status:', result.data?.featured);
    } else {
      // Create new product
      result = await dispatch(createProduct(submitData)).unwrap();
      console.log('✅ Create successful, featured status:', result.data?.featured);
    }

    onSuccess();
  } catch (error) {
    console.error('❌ Product form submission error:', error);
    if (error.response?.data?.errors) {
      alert('Validation Error: ' + JSON.stringify(error.response.data.errors));
    } else if (error.response?.data?.message) {
      alert(error.response.data.message);
    } else {
      alert('Error: ' + (error.message || 'Failed to save product'));
    }
  }
};

  const renderProductTypeFields = () => {
    switch (formData.productType) {
      case 'detergent':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Detergent Type</InputLabel>
                <Select
                  value={formData.attributes.detergentType}
                  label="Detergent Type"
                  onChange={(e) => handleAttributeChange('detergentType', e.target.value)}
                >
                  <MenuItem value="Powder">Powder</MenuItem>
                  <MenuItem value="Liquid">Liquid</MenuItem>
                  <MenuItem value="Pods">Pods</MenuItem>
                  <MenuItem value="Sheet">Sheet</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Scent"
                value={formData.attributes.scent}
                onChange={(e) => handleAttributeChange('scent', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Wash Loads"
                value={formData.attributes.washLoads}
                onChange={(e) => handleAttributeChange('washLoads', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Pack Size"
                value={formData.attributes.packSize}
                onChange={(e) => handleAttributeChange('packSize', e.target.value)}
                placeholder="e.g., 1kg, 2L, 50 loads"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.attributes.isHypoallergenic}
                    onChange={(e) => handleAttributeChange('isHypoallergenic', e.target.checked)}
                  />
                }
                label="Hypoallergenic"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.attributes.isEcoFriendly}
                    onChange={(e) => handleAttributeChange('isEcoFriendly', e.target.checked)}
                  />
                }
                label="Eco-Friendly"
              />
            </Grid>
          </Grid>
        );

      case 'beauty':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Skin Type (Multiple)</InputLabel>
                <Select
                  multiple
                  value={formData.attributes.skinType}
                  label="Skin Type"
                  onChange={(e) => handleAttributeChange('skinType', e.target.value)}
                  renderValue={(selected) => selected.join(', ')}
                >
                  {['Normal', 'Oily', 'Dry', 'Combination', 'Sensitive'].map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="SPF"
                value={formData.attributes.spf}
                onChange={(e) => handleAttributeChange('spf', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.attributes.isCrueltyFree}
                    onChange={(e) => handleAttributeChange('isCrueltyFree', e.target.checked)}
                  />
                }
                label="Cruelty Free"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.attributes.isVegan}
                    onChange={(e) => handleAttributeChange('isVegan', e.target.checked)}
                  />
                }
                label="Vegan"
              />
            </Grid>
          </Grid>
        );

      case 'grocery':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Weight"
                value={formData.attributes.weight.value}
                onChange={(e) => handleAttributeChange('weight.value', e.target.value)}
                placeholder="e.g., 500"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Weight Unit</InputLabel>
                <Select
                  value={formData.attributes.weight.unit}
                  label="Weight Unit"
                  onChange={(e) => handleAttributeChange('weight.unit', e.target.value)}
                >
                  <MenuItem value="g">g</MenuItem>
                  <MenuItem value="kg">kg</MenuItem>
                  <MenuItem value="ml">ml</MenuItem>
                  <MenuItem value="L">L</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Dietary Info (Multiple)</InputLabel>
                <Select
                  multiple
                  value={formData.attributes.dietaryInfo}
                  label="Dietary Info"
                  onChange={(e) => handleAttributeChange('dietaryInfo', e.target.value)}
                  renderValue={(selected) => selected.join(', ')}
                >
                  {['Vegetarian', 'Vegan', 'Gluten-Free', 'Organic', 'Non-GMO'].map(info => (
                    <MenuItem key={info} value={info}>{info}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Expiry Date"
                value={formData.attributes.expiryDate}
                onChange={(e) => handleAttributeChange('expiryDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        );

      default:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Weight/Volume"
                value={formData.attributes.weight.value}
                onChange={(e) => handleAttributeChange('weight.value', e.target.value)}
                placeholder="e.g., 500"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Unit</InputLabel>
                <Select
                  value={formData.attributes.weight.unit}
                  label="Unit"
                  onChange={(e) => handleAttributeChange('weight.unit', e.target.value)}
                >
                  <MenuItem value="g">g</MenuItem>
                  <MenuItem value="kg">kg</MenuItem>
                  <MenuItem value="ml">ml</MenuItem>
                  <MenuItem value="L">L</MenuItem>
                  <MenuItem value="oz">oz</MenuItem>
                  <MenuItem value="lb">lb</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Quantity in Pack"
                type="number"
                value={formData.attributes.quantity}
                onChange={(e) => handleAttributeChange('quantity', e.target.value)}
              />
            </Grid>
          </Grid>
        );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth scroll="paper">
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

          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
            <Tab label="Basic Info" />
            <Tab label="Product Details" />
            <Tab label="Variants & Inventory" />
            <Tab label="Images" />
          </Tabs>

          {/* Basic Info Tab */}
      {activeTab === 0 && (
  <Grid container spacing={3}>
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
        label="Short Description"
        name="shortDescription"
        value={formData.shortDescription}
        onChange={handleInputChange}
        multiline
        rows={2}
        helperText="Brief description (max 200 characters)"
        inputProps={{ maxLength: 200 }}
      />
    </Grid>

    <Grid item xs={12}>
      <TextField
        fullWidth
        multiline
        rows={4}
        label="Full Description"
        name="description"
        value={formData.description}
        onChange={handleInputChange}
        required
      />
    </Grid>

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
        <InputLabel>Subcategory</InputLabel>
        <Select
          name="subcategory"
          value={formData.subcategory}
          onChange={handleInputChange}
          label="Subcategory"
        >
          <MenuItem value="">None</MenuItem>
          {(subcategories[formData.category] || []).map(sub => (
            <MenuItem key={sub} value={sub}>{sub}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </Grid>

    <Grid item xs={12} md={6}>
      <FormControl fullWidth>
        <InputLabel>Product Type</InputLabel>
        <Select
          name="productType"
          value={formData.productType}
          onChange={handleInputChange}
          label="Product Type"
          required
        >
          {productTypes.map(type => (
            <MenuItem key={type.value} value={type.value}>
              {type.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Grid>

    <Grid item xs={12} md={6}>
      <TextField
        fullWidth
        type="number"
        label="Price ($)"
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
        label="Original Price ($) - Optional"
        name="originalPrice"
        value={formData.originalPrice}
        onChange={handleInputChange}
        inputProps={{ min: 0, step: 0.01 }}
      />
    </Grid>

    {/* Featured Product Switch - FIXED */}
 <Grid item xs={12} md={6}>
  <Box sx={{ mb: 1 }}>
    <FormControlLabel
      control={
        <Switch
          name="featured"
          checked={formData.featured === true}
          onChange={(e) => {
            console.log('🔄 Featured toggled to:', e.target.checked);
            setFormData(prev => ({
              ...prev,
              featured: e.target.checked
            }));
          }}
          color="primary"
        />
      }
      label={formData.featured ? "⭐ Featured Product (Yes)" : "☆ Featured Product (No)"}
    />
  </Box>
  <Typography variant="caption" color="text.secondary" display="block">
    Featured products appear on the homepage and are highlighted in listings
  </Typography>
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
          onKeyPress={(e) => e.key === 'Enter' && addTag()}
          size="small"
        />
        <Button onClick={addTag} startIcon={<Add />} size="small">
          Add
        </Button>
      </Box>
    </Grid>
  </Grid>
)}

          {/* Product Details Tab */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Product Specifications
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Fields will vary based on product type
              </Typography>
              
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="subtitle1">Common Attributes</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Weight/Volume"
                        value={formData.attributes.weight.value}
                        onChange={(e) => handleAttributeChange('weight.value', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Unit</InputLabel>
                        <Select
                          value={formData.attributes.weight.unit}
                          label="Unit"
                          onChange={(e) => handleAttributeChange('weight.unit', e.target.value)}
                        >
                          <MenuItem value="g">g</MenuItem>
                          <MenuItem value="kg">kg</MenuItem>
                          <MenuItem value="ml">ml</MenuItem>
                          <MenuItem value="L">L</MenuItem>
                          <MenuItem value="oz">oz</MenuItem>
                          <MenuItem value="lb">lb</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Quantity in Pack"
                        type="number"
                        value={formData.attributes.quantity}
                        onChange={(e) => handleAttributeChange('quantity', e.target.value)}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="subtitle1">
                    {formData.productType === 'detergent' && 'Detergent Specifics'}
                    {formData.productType === 'beauty' && 'Beauty Specifics'}
                    {formData.productType === 'grocery' && 'Grocery Specifics'}
                    {(formData.productType === 'health' || formData.productType === 'homecare') && 'Product Specifics'}
                    {!['detergent', 'beauty', 'grocery'].includes(formData.productType) && 'Product Attributes'}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {renderProductTypeFields()}
                </AccordionDetails>
              </Accordion>
            </Box>
          )}

          {/* Variants & Inventory Tab */}
          {activeTab === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Product Variants
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Add variants for different sizes, packs, or versions (e.g., 500ml, 1kg, Family Pack)
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
                  <TextField
                    label="Variant Name"
                    value={newVariant.name}
                    onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                    size="small"
                    placeholder="e.g., 500ml, Family Pack"
                  />
                  <TextField
                    label="Price"
                    type="number"
                    value={newVariant.price}
                    onChange={(e) => setNewVariant({ ...newVariant, price: e.target.value })}
                    size="small"
                    sx={{ width: 100 }}
                  />
                  <TextField
                    label="Inventory"
                    type="number"
                    value={newVariant.inventory}
                    onChange={(e) => setNewVariant({ ...newVariant, inventory: e.target.value })}
                    size="small"
                    sx={{ width: 100 }}
                  />
                  <Button onClick={addVariant} startIcon={<Add />} variant="outlined" size="small">
                    Add Variant
                  </Button>
                </Box>

                {formData.variants.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    {formData.variants.map((variant, index) => (
                      <Card key={index} sx={{ mb: 1 }}>
                        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, '&:last-child': { pb: 1 } }}>
                          <Box>
                            <Typography variant="body1" fontWeight="medium">{variant.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              ${variant.price} | Stock: {variant.inventory}
                            </Typography>
                          </Box>
                          <IconButton size="small" onClick={() => removeVariant(index)} color="error">
                            <Delete />
                          </IconButton>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                  Inventory
                </Typography>
                
                {formData.variants.length === 0 && (
                  <TextField
                    fullWidth
                    type="number"
                    label="Total Inventory"
                    name="inventory"
                    value={formData.inventory}
                    onChange={handleInputChange}
                    inputProps={{ min: 0 }}
                    sx={{ mb: 2 }}
                  />
                )}
                
                {formData.variants.length > 0 && (
                  <Alert severity="info">
                    Total inventory calculated from variants: {formData.variants.reduce((sum, v) => sum + (v.inventory || 0), 0)} units
                  </Alert>
                )}
              </Grid>
            </Grid>
          )}

          {/* Images Tab - FIXED */}
          {activeTab === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Product Images
                </Typography>
                
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={uploadingImages ? <CircularProgress size={20} /> : <CloudUpload />}
                  disabled={uploadingImages}
                  sx={{ mb: 2 }}
                >
                  {uploadingImages ? 'Uploading...' : 'Upload Images'}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    hidden
                  />
                </Button>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {images.length} image(s). Click on an image to set as primary.
                </Typography>

                <Grid container spacing={2}>
                  {images.map((image, index) => {
                    // CRITICAL FIX: Ensure we have a valid URL
                    const imageUrl = image.url;
                    console.log(`🖼️ Rendering image ${index}:`, imageUrl);
                    
                    return (
                      <Grid item xs={6} md={3} key={index}>
                        <Card 
                          sx={{ 
                            cursor: 'pointer',
                            border: image.isPrimary ? '2px solid #1976d2' : '1px solid #e0e0e0',
                            position: 'relative'
                          }}
                          onClick={() => {
                            const newImages = [...images];
                            newImages.forEach((img, i) => {
                              img.isPrimary = i === index;
                            });
                            setImages(newImages);
                          }}
                        >
                          <CardContent sx={{ textAlign: 'center', p: 1 }}>
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={`Product ${index + 1}`}
                                style={{
                                  width: '100%',
                                  height: 100,
                                  objectFit: 'contain',
                                  borderRadius: 4
                                }}
                                onError={(e) => {
                                  console.error(`❌ Failed to load image: ${imageUrl}`);
                                  e.target.src = 'https://via.placeholder.com/100?text=Error';
                                }}
                                onLoad={() => {
                                  console.log(`✅ Image loaded successfully: ${imageUrl}`);
                                }}
                              />
                            ) : (
                              <Box sx={{ width: '100%', height: 100, bgcolor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography variant="caption">No image URL</Typography>
                              </Box>
                            )}
                            {image.isPrimary && (
                              <Typography variant="caption" color="primary" sx={{ mt: 0.5, display: 'block' }}>
                                Primary
                              </Typography>
                            )}
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(index);
                              }}
                              color="error"
                              sx={{ mt: 0.5 }}
                            >
                              <Delete />
                            </IconButton>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>

                {images.length === 0 && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Please upload at least one product image before saving.
                  </Alert>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading || uploadingImages}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading || uploadingImages || images.length === 0}
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