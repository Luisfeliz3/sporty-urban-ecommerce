import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Pagination,
  Card,
  CardContent,
  FormControlLabel,
  Checkbox,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Search,
  FilterList,
  Clear,
  LocalOffer,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, updateFilters, resetFilters } from '../store/slices/productSlice';
import ProductCard from '../components/Product/ProductCard';

const ProductsPage = () => {
  const dispatch = useDispatch();
  const { 
    products, 
    loading, 
    error, 
    filters, 
    availableFilters,
    pagination 
  } = useSelector((state) => state.products);

  const [localFilters, setLocalFilters] = useState(filters);
  const [showFilters, setShowFilters] = useState(false);

  // Sync local filters with Redux filters
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Fetch products when filters change
  useEffect(() => {
    dispatch(fetchProducts(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const applyFilters = () => {
    dispatch(updateFilters(localFilters));
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
    setLocalFilters({
      category: '',
      brand: '',
      sportType: '',
      minPrice: '',
      maxPrice: '',
      size: '',
      color: '',
      featured: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      search: ''
    });
  };

  const handlePageChange = (event, value) => {
    dispatch(updateFilters({ ...filters, page: value }));
  };

  const handleSearch = (event) => {
    if (event.key === 'Enter') {
      applyFilters();
    }
  };

  const handlePriceChange = (event, newValue) => {
    setLocalFilters(prev => ({
      ...prev,
      minPrice: newValue[0],
      maxPrice: newValue[1]
    }));
  };

  const activeFiltersCount = Object.values(filters).filter(
    value => value && value !== '' && value !== 'createdAt' && value !== 'desc'
  ).length - 1; // Subtract 1 for page field

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Shop All Products
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Discover our complete collection of sportswear and accessories
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Filters Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper elevation={2} sx={{ p: 3, position: 'sticky', top: 100 }}>
            {/* Filters Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" component="h2">
                <FilterList sx={{ mr: 1 }} />
                Filters
              </Typography>
              {activeFiltersCount > 0 && (
                <Chip 
                  label={`${activeFiltersCount} active`} 
                  size="small" 
                  color="primary" 
                />
              )}
            </Box>

            {/* Search */}
            <TextField
              fullWidth
              label="Search products"
              value={localFilters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              onKeyPress={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            {/* Category Filter */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={localFilters.category}
                label="Category"
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {availableFilters.categories.map(category => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Brand Filter */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Brand</InputLabel>
              <Select
                value={localFilters.brand}
                label="Brand"
                onChange={(e) => handleFilterChange('brand', e.target.value)}
              >
                <MenuItem value="all">All Brands</MenuItem>
                {availableFilters.brands.map(brand => (
                  <MenuItem key={brand} value={brand}>
                    {brand}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Sport Type Filter */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Sport Type</InputLabel>
              <Select
                value={localFilters.sportType}
                label="Sport Type"
                onChange={(e) => handleFilterChange('sportType', e.target.value)}
              >
                <MenuItem value="all">All Sports</MenuItem>
                {availableFilters.sportTypes.map(sport => (
                  <MenuItem key={sport} value={sport}>
                    {sport.charAt(0).toUpperCase() + sport.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Price Range Filter */}
            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>
                Price Range
              </Typography>
              <Slider
                value={[
                  parseInt(localFilters.minPrice) || availableFilters.priceRange.minPrice,
                  parseInt(localFilters.maxPrice) || availableFilters.priceRange.maxPrice
                ]}
                onChange={handlePriceChange}
                valueLabelDisplay="auto"
                min={availableFilters.priceRange.minPrice}
                max={availableFilters.priceRange.maxPrice}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">
                  ${parseInt(localFilters.minPrice) || availableFilters.priceRange.minPrice}
                </Typography>
                <Typography variant="body2">
                  ${parseInt(localFilters.maxPrice) || availableFilters.priceRange.maxPrice}
                </Typography>
              </Box>
            </Box>

            {/* Size Filter */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Size</InputLabel>
              <Select
                value={localFilters.size}
                label="Size"
                onChange={(e) => handleFilterChange('size', e.target.value)}
              >
                <MenuItem value="all">All Sizes</MenuItem>
                {availableFilters.sizes.map(size => (
                  <MenuItem key={size} value={size}>
                    {size}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Color Filter */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Color</InputLabel>
              <Select
                value={localFilters.color}
                label="Color"
                onChange={(e) => handleFilterChange('color', e.target.value)}
              >
                <MenuItem value="all">All Colors</MenuItem>
                {availableFilters.colors.map(color => (
                  <MenuItem key={color} value={color}>
                    {color}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Featured Filter */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={localFilters.featured === 'true'}
                  onChange={(e) => handleFilterChange('featured', e.target.checked ? 'true' : '')}
                />
              }
              label="Featured Products Only"
            />

            <Divider sx={{ my: 2 }} />

            {/* Sort Options */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={localFilters.sortBy}
                label="Sort By"
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <MenuItem value="createdAt">Newest</MenuItem>
                <MenuItem value="price">Price</MenuItem>
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="rating">Rating</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Sort Order</InputLabel>
              <Select
                value={localFilters.sortOrder}
                label="Sort Order"
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              >
                <MenuItem value="desc">Descending</MenuItem>
                <MenuItem value="asc">Ascending</MenuItem>
              </Select>
            </FormControl>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<Clear />}
                onClick={handleResetFilters}
                fullWidth
              >
                Reset
              </Button>
              <Button
                variant="contained"
                onClick={applyFilters}
                fullWidth
              >
                Apply
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Products Grid */}
        <Grid item xs={12} md={9}>
          {/* Results Header */}
          <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                {loading ? (
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                ) : (
                  <LocalOffer sx={{ mr: 1 }} />
                )}
                {pagination.total} Products Found
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => setShowFilters(!showFilters)}
                  sx={{ display: { md: 'none' } }}
                >
                  <FilterList /> Filters
                </Button>
              </Box>
            </Box>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {filters.category && filters.category !== 'all' && (
                  <Chip 
                    label={`Category: ${filters.category}`}
                    onDelete={() => handleFilterChange('category', '')}
                    size="small"
                  />
                )}
                {filters.brand && filters.brand !== 'all' && (
                  <Chip 
                    label={`Brand: ${filters.brand}`}
                    onDelete={() => handleFilterChange('brand', '')}
                    size="small"
                  />
                )}
                {filters.sportType && filters.sportType !== 'all' && (
                  <Chip 
                    label={`Sport: ${filters.sportType}`}
                    onDelete={() => handleFilterChange('sportType', '')}
                    size="small"
                  />
                )}
                {filters.size && filters.size !== 'all' && (
                  <Chip 
                    label={`Size: ${filters.size}`}
                    onDelete={() => handleFilterChange('size', '')}
                    size="small"
                  />
                )}
                {filters.color && filters.color !== 'all' && (
                  <Chip 
                    label={`Color: ${filters.color}`}
                    onDelete={() => handleFilterChange('color', '')}
                    size="small"
                  />
                )}
                {filters.featured && (
                  <Chip 
                    label="Featured"
                    onDelete={() => handleFilterChange('featured', '')}
                    size="small"
                  />
                )}
                {filters.search && (
                  <Chip 
                    label={`Search: ${filters.search}`}
                    onDelete={() => handleFilterChange('search', '')}
                    size="small"
                  />
                )}
              </Box>
            )}
          </Paper>

          {/* Products Grid */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={60} />
            </Box>
          ) : products.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No products found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Try adjusting your filters or search terms
                </Typography>
                <Button variant="outlined" onClick={handleResetFilters}>
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <Grid container spacing={3}>
                {products.map((product) => (
                  <Grid item xs={12} sm={6} lg={4} key={product._id}>
                    <ProductCard product={product} />
                  </Grid>
                ))}
              </Grid>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                  <Pagination
                    count={pagination.pages}
                    page={pagination.page}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          )}
        </Grid>
      </Grid>

      {/* Mobile Filters Dialog */}
      {showFilters && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'background.paper',
            zIndex: 1300,
            p: 3,
            overflow: 'auto'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Filters</Typography>
            <Button onClick={() => setShowFilters(false)}>Close</Button>
          </Box>
          {/* You can duplicate the filter content here for mobile */}
        </Box>
      )}
    </Container>
  );
};

export default ProductsPage;