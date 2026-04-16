import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Search,
  FilterList,
  Clear,
  LocalOffer,
  Close,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, updateFilters, resetFilters } from '../store/slices/productSlice';
import ProductCard from '../components/Product/ProductCard';

const ProductsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const searchTimeoutRef = useRef(null);

  // Updated categories for multi-category store
  const categories = [
    'Detergents & Laundry',
    'Beauty & Personal Care',
    'Home Care & Cleaning',
    'Grocery & Staples',
    'Health & Household',
    'Home & Kitchen',
    'Baby Care',
    'Pet Care'
  ];

  const productTypes = [
    { value: 'detergent', label: 'Detergents & Laundry' },
    { value: 'beauty', label: 'Beauty & Personal Care' },
    { value: 'homecare', label: 'Home Care & Cleaning' },
    { value: 'grocery', label: 'Grocery & Staples' },
    { value: 'health', label: 'Health & Household' },
    { value: 'homekitchen', label: 'Home & Kitchen' },
    { value: 'baby', label: 'Baby Care' },
    { value: 'pet', label: 'Pet Care' }
  ];

  // Fetch products when filters change
  useEffect(() => {
    dispatch(fetchProducts(filters));
  }, [dispatch, filters]);

  // Debounced search function
  const debouncedSearch = useCallback((value) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      dispatch(updateFilters({ 
        ...filters, 
        search: value,
        page: 1 
      }));
    }, 500);
  }, [dispatch, filters]);

  // Handle search input change - maintains focus
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchValue(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchValue('');
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    dispatch(updateFilters({ 
      ...filters, 
      search: '',
      page: 1 
    }));
  }, [dispatch, filters]);

  // Handle immediate filter changes (non-search)
  const handleImmediateFilterChange = useCallback((key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    dispatch(updateFilters(newFilters));
  }, [dispatch, filters]);

  const handleResetFilters = useCallback(() => {
    setSearchValue('');
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    dispatch(resetFilters());
  }, [dispatch]);

  const handlePageChange = useCallback((event, value) => {
    dispatch(updateFilters({ ...filters, page: value }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [dispatch, filters]);

  const handlePriceChange = useCallback((event, newValue) => {
    setLocalFilters(prev => ({
      ...prev,
      minPrice: newValue[0],
      maxPrice: newValue[1]
    }));
  }, []);

  const handlePriceChangeComplete = useCallback(() => {
    dispatch(updateFilters({ 
      ...filters, 
      minPrice: localFilters.minPrice,
      maxPrice: localFilters.maxPrice,
      page: 1 
    }));
  }, [dispatch, filters, localFilters.minPrice, localFilters.maxPrice]);

  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) => value && value !== '' && value !== 'all' && key !== 'sortBy' && key !== 'sortOrder' && key !== 'page'
  ).length;

  // Memoize FilterContent to prevent re-renders
  const FilterContent = useMemo(() => (
    <Box sx={{ p: isMobile ? 2 : 0 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          <FilterList sx={{ mr: 1 }} />
          Filters
        </Typography>
        {isMobile && (
          <IconButton onClick={() => setMobileFiltersOpen(false)}>
            <Close />
          </IconButton>
        )}
      </Box>

      {/* Search Field - FIXED: Maintains focus now */}
      <TextField
        fullWidth
        label="Search products"
        value={searchValue}
        onChange={handleSearchChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
          endAdornment: searchValue && (
            <InputAdornment position="end">
              <IconButton 
                size="small" 
                onClick={handleClearSearch}
                edge="end"
                onMouseDown={(e) => e.preventDefault()}
              >
                <Clear />
              </IconButton>
            </InputAdornment>
          )
        }}
        helperText="Type to search - results update automatically"
        sx={{ mb: 3 }}
        autoComplete="off"
      />

      {/* Category Filter */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={filters.category || ''}
          label="Category"
          onChange={(e) => handleImmediateFilterChange('category', e.target.value)}
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories.map(category => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Product Type Filter */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Product Type</InputLabel>
        <Select
          value={filters.productType || ''}
          label="Product Type"
          onChange={(e) => handleImmediateFilterChange('productType', e.target.value)}
        >
          <MenuItem value="">All Types</MenuItem>
          {productTypes.map(type => (
            <MenuItem key={type.value} value={type.value}>
              {type.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Brand Filter */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Brand</InputLabel>
        <Select
          value={filters.brand || ''}
          label="Brand"
          onChange={(e) => handleImmediateFilterChange('brand', e.target.value)}
        >
          <MenuItem value="">All Brands</MenuItem>
          {availableFilters.brands?.map(brand => (
            <MenuItem key={brand} value={brand}>
              {brand}
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
            localFilters.minPrice || availableFilters.priceRange?.minPrice || 0,
            localFilters.maxPrice || availableFilters.priceRange?.maxPrice || 1000
          ]}
          onChange={handlePriceChange}
          onChangeCommitted={handlePriceChangeComplete}
          valueLabelDisplay="auto"
          min={availableFilters.priceRange?.minPrice || 0}
          max={availableFilters.priceRange?.maxPrice || 1000}
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2">
            ${localFilters.minPrice || availableFilters.priceRange?.minPrice || 0}
          </Typography>
          <Typography variant="body2">
            ${localFilters.maxPrice || availableFilters.priceRange?.maxPrice || 1000}
          </Typography>
        </Box>
      </Box>

      {/* Rating Filter */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Minimum Rating</InputLabel>
        <Select
          value={filters.minRating || ''}
          label="Minimum Rating"
          onChange={(e) => handleImmediateFilterChange('minRating', e.target.value)}
        >
          <MenuItem value="">Any Rating</MenuItem>
          <MenuItem value="4">4★ & above</MenuItem>
          <MenuItem value="3">3★ & above</MenuItem>
          <MenuItem value="2">2★ & above</MenuItem>
        </Select>
      </FormControl>

      {/* In Stock Filter */}
      <FormControlLabel
        control={
          <Checkbox
            checked={filters.inStock === 'true'}
            onChange={(e) => handleImmediateFilterChange('inStock', e.target.checked ? 'true' : '')}
          />
        }
        label="In Stock Only"
        sx={{ mb: 2, display: 'block' }}
      />

      {/* Featured Filter */}
      <FormControlLabel
        control={
          <Checkbox
            checked={filters.featured === 'true'}
            onChange={(e) => handleImmediateFilterChange('featured', e.target.checked ? 'true' : '')}
          />
        }
        label="Featured Products Only"
        sx={{ mb: 3, display: 'block' }}
      />

      <Divider sx={{ my: 2 }} />

      {/* Sort Options */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Sort By</InputLabel>
        <Select
          value={filters.sortBy || 'createdAt'}
          label="Sort By"
          onChange={(e) => handleImmediateFilterChange('sortBy', e.target.value)}
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
          value={filters.sortOrder || 'desc'}
          label="Sort Order"
          onChange={(e) => handleImmediateFilterChange('sortOrder', e.target.value)}
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
          Reset All
        </Button>
      </Box>
    </Box>
  ), [isMobile, searchValue, handleSearchChange, handleClearSearch, filters, handleImmediateFilterChange, availableFilters, localFilters, handlePriceChange, handlePriceChangeComplete, handleResetFilters]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Shop All Products
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Discover our complete collection of detergents, beauty products, home care items, groceries, health products, and home & kitchen essentials.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Filters Sidebar - Desktop */}
        {!isMobile && (
          <Grid item xs={12} md={3}>
            <Paper elevation={2} sx={{ p: 3, position: 'sticky', top: 100 }}>
              {FilterContent}
            </Paper>
          </Grid>
        )}

        {/* Products Grid */}
        <Grid item xs={12} md={9}>
          {/* Results Header */}
          <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {loading ? (
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                ) : (
                  <LocalOffer sx={{ mr: 1 }} />
                )}
                <Typography variant="h6">
                  {pagination.total} Products Found
                </Typography>
              </Box>
              
              {isMobile && (
                <Button
                  variant="outlined"
                  startIcon={<FilterList />}
                  onClick={() => setMobileFiltersOpen(true)}
                >
                  Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                </Button>
              )}
            </Box>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {filters.search && (
                  <Chip 
                    label={`Search: ${filters.search}`}
                    onDelete={handleClearSearch}
                    size="small"
                  />
                )}
                {filters.category && (
                  <Chip 
                    label={`Category: ${filters.category}`}
                    onDelete={() => handleImmediateFilterChange('category', '')}
                    size="small"
                  />
                )}
                {filters.productType && (
                  <Chip 
                    label={`Type: ${productTypes.find(t => t.value === filters.productType)?.label || filters.productType}`}
                    onDelete={() => handleImmediateFilterChange('productType', '')}
                    size="small"
                  />
                )}
                {filters.brand && (
                  <Chip 
                    label={`Brand: ${filters.brand}`}
                    onDelete={() => handleImmediateFilterChange('brand', '')}
                    size="small"
                  />
                )}
                {(filters.minPrice || filters.maxPrice) && (
                  <Chip 
                    label={`Price: $${filters.minPrice || 0} - $${filters.maxPrice || '∞'}`}
                    onDelete={() => {
                      handleImmediateFilterChange('minPrice', '');
                      handleImmediateFilterChange('maxPrice', '');
                    }}
                    size="small"
                  />
                )}
                {filters.minRating && (
                  <Chip 
                    label={`${filters.minRating}★ & above`}
                    onDelete={() => handleImmediateFilterChange('minRating', '')}
                    size="small"
                  />
                )}
                {filters.inStock === 'true' && (
                  <Chip 
                    label="In Stock Only"
                    onDelete={() => handleImmediateFilterChange('inStock', '')}
                    size="small"
                  />
                )}
                {filters.featured === 'true' && (
                  <Chip 
                    label="Featured"
                    onDelete={() => handleImmediateFilterChange('featured', '')}
                    size="small"
                  />
                )}
                <Button 
                  size="small" 
                  onClick={handleResetFilters}
                  startIcon={<Clear />}
                >
                  Clear All
                </Button>
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
                    size={isMobile ? "medium" : "large"}
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          )}
        </Grid>
      </Grid>

      {/* Mobile Filters Drawer */}
      <Drawer
        anchor="bottom"
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        PaperProps={{ sx: { height: '85%', borderRadius: '16px 16px 0 0' } }}
      >
        <Box sx={{ overflow: 'auto', p: 2 }}>
          {FilterContent}
        </Box>
      </Drawer>
    </Container>
  );
};

export default ProductsPage;