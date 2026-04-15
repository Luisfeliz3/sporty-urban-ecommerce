import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Switch,
  FormControlLabel,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Inventory,
  ShoppingBag,
  Search,
  Clear,
  Category,
  LocalOffer,
  TrendingUp,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { getAdminProducts, deleteProduct, toggleProductActive } from '../store/slices/adminSlice';
import ProductForm from '../components/Admin/ProductForm';
import no_image_avl from "../images/no_images.jpeg";


// Tab panel component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminDashboard = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [productTypeFilter, setProductTypeFilter] = useState('all');
  const [tabValue, setTabValue] = useState(0);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const dispatch = useDispatch();
  const { products, loading, error, pagination } = useSelector((state) => state.admin);
  const { userInfo } = useSelector((state) => state.auth);

  // Product categories for new store
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
    'detergent', 'beauty', 'homecare', 'grocery', 'health', 'homekitchen', 'baby', 'pet'
  ];

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      dispatch(getAdminProducts({ page: page + 1, limit: rowsPerPage }));
    }
  }, [dispatch, userInfo, page, rowsPerPage]);


  
  // Filter products based on search term and filters
  useEffect(() => {
    if (products) {
      let filtered = [...products];
      
      // Search filter
      if (searchTerm) {
        const searchString = searchTerm.toLowerCase();
        filtered = filtered.filter(product => (
          product.name?.toLowerCase().includes(searchString) ||
          product.sku?.toLowerCase().includes(searchString) ||
          product.category?.toLowerCase().includes(searchString) ||
          product.brand?.toLowerCase().includes(searchString) ||
          product.description?.toLowerCase().includes(searchString)
        ));
      }
      
      // Category filter
      if (categoryFilter !== 'all') {
        filtered = filtered.filter(product => product.category === categoryFilter);
      }
      
      // Product type filter
      if (productTypeFilter !== 'all') {
        filtered = filtered.filter(product => product.productType === productTypeFilter);
      }
      
      setFilteredProducts(filtered);
    }
  }, [products, searchTerm, categoryFilter, productTypeFilter]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (productToDelete) {
      dispatch(deleteProduct(productToDelete._id));
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleToggleActive = (product) => {
    dispatch(toggleProductActive(product._id));
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductFormOpen(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductFormOpen(true);
  };

  const handleProductFormClose = () => {
    setProductFormOpen(false);
    setEditingProduct(null);
  };

  const handleProductFormSuccess = () => {
    setProductFormOpen(false);
    setEditingProduct(null);
    dispatch(getAdminProducts({ page: page + 1, limit: rowsPerPage }));
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Reset filters when changing tabs
    if (newValue === 0) {
      setCategoryFilter('all');
      setProductTypeFilter('all');
      setSearchTerm('');
    }
  };

  // Get stats for dashboard
  const getStats = () => {
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.isActive).length;
    const lowStockProducts = products.filter(p => p.inventory < 10 && p.inventory > 0).length;
    const outOfStockProducts = products.filter(p => p.inventory === 0 && p.isActive).length;
    const featuredProducts = products.filter(p => p.featured).length;
    
    // Category breakdown
    const categoryCount = {};
    categories.forEach(cat => {
      categoryCount[cat] = products.filter(p => p.category === cat).length;
    });
    
    return { totalProducts, activeProducts, lowStockProducts, outOfStockProducts, featuredProducts, categoryCount };
  };

  const stats = getStats();

  // Get current page data
  const getCurrentPageData = () => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  };

  

  if (!userInfo || !userInfo.isAdmin) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Alert severity="error">
          Admin access required. You don't have permission to view this page.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1">
          Admin Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch} edge="end">
                    <Clear />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button variant="contained" startIcon={<Add />} onClick={handleAddProduct}>
            Add New Product
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ShoppingBag color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.totalProducts}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Total Products
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Inventory color="success" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.activeProducts}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Active Products
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocalOffer color="warning" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.featuredProducts}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Featured Products
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp color="error" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.lowStockProducts}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Low Stock
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Category color="info" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.outOfStockProducts}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Out of Stock
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs for different views */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="All Products" />
          <Tab label="By Category" />
          <Tab label="Inventory Alerts" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {/* Filter Bar */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map(cat => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Product Type</InputLabel>
              <Select
                value={productTypeFilter}
                label="Product Type"
                onChange={(e) => setProductTypeFilter(e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                {productTypes.map(type => (
                  <MenuItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {(categoryFilter !== 'all' || productTypeFilter !== 'all' || searchTerm) && (
              <Button size="small" onClick={() => {
                setCategoryFilter('all');
                setProductTypeFilter('all');
                setSearchTerm('');
              }}>
                Clear Filters
              </Button>
            )}
          </Box>

          {searchTerm && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Found {filteredProducts.length} product(s) matching "{searchTerm}"
            </Alert>
          )}

          {/* Products Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Product Type</TableCell>
                  <TableCell>Brand</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Inventory</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Featured</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Typography>Loading products...</Typography>
                    </TableCell>
                  </TableRow>
                ) : getCurrentPageData().length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Typography>
                        {searchTerm ? `No products found matching "${searchTerm}"` : 'No products available'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  getCurrentPageData().map((product) => (
                    <TableRow key={product._id}>
                   <TableCell>
  <Box sx={{ display: 'flex', alignItems: 'center' }}>
    <Box
      component="img"
      src={product.images && product.images[0] ? product.images[0].url : no_image_avl}
      alt={product.name}
      sx={{
        width: 50,
        height: 50,
        objectFit: 'contain',
        borderRadius: 1,
        mr: 2,
        bgcolor: '#f5f5f5'
      }}
      onError={(e) => {
        console.error(`Failed to load admin image: ${product.images?.[0]?.url}`);
        e.target.src = no_image_avl;
      }}
    />
    <Box>
      <Typography variant="body1" fontWeight="medium">
        {product.name}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        SKU: {product.sku}
      </Typography>
    </Box>
  </Box>
</TableCell>
                      <TableCell>
                        <Chip label={product.category} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={product.productType} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{product.brand}</TableCell>
                      <TableCell>${product.price}</TableCell>
                      <TableCell>
                        <Chip 
                          label={product.inventory} 
                          size="small"
                          color={product.inventory === 0 ? 'error' : product.inventory < 10 ? 'warning' : 'success'}
                        />
                      </TableCell>
                <TableCell>
  <FormControlLabel
    control={
      <Switch
        checked={product.isActive}
        onChange={async (e) => {
          e.stopPropagation(); // Prevent row click events
          try {
            // Dispatch the toggle action
            const result = await dispatch(toggleProductActive(product._id)).unwrap();
            console.log('✅ Active status toggled:', result);
            
            // Optional: Show a quick feedback
            const newStatus = result.data?.isActive ?? !product.isActive;
            const statusText = newStatus ? 'activated' : 'deactivated';
            // You can show a snackbar here if you want
            console.log(`Product ${statusText} successfully`);
          } catch (error) {
            console.error('❌ Failed to toggle status:', error);
            alert('Failed to update product status');
          }
        }}
        color="primary"
        size="small"
      />
    }
    label={product.isActive ? 'Active' : 'Inactive'}
    labelPlacement="start"
    sx={{ 
      mr: 0,
      '& .MuiFormControlLabel-label': { 
        fontSize: '0.875rem',
        mr: 1 
      }
    }}
  />
</TableCell>
                      <TableCell>
                       <Chip 
    label={product.featured ? 'Yes' : 'No'} 
    size="small"
    color={product.featured ? 'primary' : 'default'}
    icon={product.featured ? <TrendingUp /> : null}
  />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditProduct(product)}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(product)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredProducts.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>Products by Category</Typography>
          <Grid container spacing={2}>
            {categories.map(cat => (
              <Grid item xs={12} sm={6} md={4} key={cat}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{cat}</Typography>
                    <Typography variant="h3" color="primary">
                      {stats.categoryCount[cat] || 0}
                    </Typography>
                    <Typography color="text.secondary">Products</Typography>
                    <Button 
                      size="small" 
                      onClick={() => {
                        setCategoryFilter(cat);
                        setTabValue(0);
                      }}
                    >
                      View Products
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Inventory Alerts</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card sx={{ bgcolor: 'warning.light' }}>
                <CardContent>
                  <Typography variant="h6">Low Stock Products</Typography>
                  <Typography variant="h3">{stats.lowStockProducts}</Typography>
                  <Typography>Products with less than 10 units</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ bgcolor: 'error.light' }}>
                <CardContent>
                  <Typography variant="h6">Out of Stock Products</Typography>
                  <Typography variant="h3">{stats.outOfStockProducts}</Typography>
                  <Typography>Products that need restocking</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {products.filter(p => p.inventory < 10).length > 0 && (
            <TableContainer component={Paper} sx={{ mt: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Inventory</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.filter(p => p.inventory < 10).map(product => (
                    <TableRow key={product._id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>
                        <Chip 
                          label={product.inventory} 
                          size="small"
                          color={product.inventory === 0 ? 'error' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>{product.inventory === 0 ? 'Out of Stock' : 'Low Stock'}</TableCell>
                      <TableCell>
                        <Button size="small" onClick={() => handleEditProduct(product)}>
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Product Form Dialog */}
      <ProductForm
        open={productFormOpen}
        onClose={handleProductFormClose}
        onSuccess={handleProductFormSuccess}
        product={editingProduct}
      />
    </Container>
  );
};

export default AdminDashboard;