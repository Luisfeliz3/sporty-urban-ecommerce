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
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Inventory,
  ShoppingBag,
  Search,
  Clear,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { getAdminProducts, deleteProduct, toggleProductActive } from '../store/slices/adminSlice';
import ProductForm from '../components/Admin/ProductForm';
import no_image_avl from "../images/no_images.jpeg"
const AdminDashboard = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  const dispatch = useDispatch();
  const { products, loading, error, pagination } = useSelector((state) => state.admin);
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      dispatch(getAdminProducts({ page: page + 1, limit: rowsPerPage }));
    }
  }, [dispatch, userInfo, page, rowsPerPage]);

  // Filter products based on search term
  useEffect(() => {
    if (products) {
      const filtered = products.filter(product => {
        const searchString = searchTerm.toLowerCase();
        return (
          product.name?.toLowerCase().includes(searchString) ||
          product.sku?.toLowerCase().includes(searchString) ||
          product.category?.toLowerCase().includes(searchString) ||
          product.brand?.toLowerCase().includes(searchString) ||
          product.description?.toLowerCase().includes(searchString)
        );
      });
      setFilteredProducts(filtered);
    }
  }, [products, searchTerm]);

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
    // Refresh the products list
    dispatch(getAdminProducts({ page: page + 1, limit: rowsPerPage }));
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

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
                  <IconButton
                    size="small"
                    onClick={handleClearSearch}
                    edge="end"
                  >
                    <Clear />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddProduct}
          >
            Add New Product
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search Results Info */}
      {searchTerm && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Found {filteredProducts.length} product(s) matching "{searchTerm}"
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ShoppingBag color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {pagination.total || 0}
                  </Typography>
                  <Typography color="text.secondary">
                    Total Products
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Inventory color="success" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {products.filter(p => p.isActive).length}
                  </Typography>
                  <Typography color="text.secondary">
                    Active Products
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ShoppingBag color="warning" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {products.filter(p => p.featured).length}
                  </Typography>
                  <Typography color="text.secondary">
                    Featured Products
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Inventory color="info" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {products.filter(p => p.inventory < 10).length}
                  </Typography>
                  <Typography color="text.secondary">
                    Low Stock
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Products Table */}
        <Grid item xs={12}>
          <Paper elevation={3}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Category</TableCell>
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
                      <TableCell colSpan={8} align="center">
                        <Typography>Loading products...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : getCurrentPageData().length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
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
                              // src={product.images[0]?.url }
                              src={product.images[0]?.url || no_image_avl}
                              alt={product.name}
                              sx={{
                                width: 50,
                                height: 50,
                                objectFit: 'cover',
                                borderRadius: 1,
                                mr: 2
                              }}
                              onError={(e) => {
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
                                onChange={() => handleToggleActive(product)}
                                color="primary"
                              />
                            }
                            label={product.isActive ? 'Active' : 'Inactive'}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={product.featured ? 'Yes' : 'No'} 
                            size="small"
                            color={product.featured ? 'primary' : 'default'}
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
          </Paper>
        </Grid>
      </Grid>

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