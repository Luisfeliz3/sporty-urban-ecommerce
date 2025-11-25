import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Divider,
  Alert,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Edit, Delete, Add, CreditCard, LocationOn, Person, Lock } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile, updateProfile, addAddress, deleteAddress, addPaymentMethod, deletePaymentMethod, setDefaultPaymentMethod, changePassword } from '../store/slices/profileSlice';

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const ProfilePage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [addAddressDialog, setAddAddressDialog] = useState(false);
  const [addPaymentDialog, setAddPaymentDialog] = useState(false);
  const [changePasswordDialog, setChangePasswordDialog] = useState(false);

  const dispatch = useDispatch();
  const { user, loading, error, success } = useSelector((state) => state.profile);
  const { userInfo } = useSelector((state) => state.auth);

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    preferences: {
      newsletter: true,
      smsNotifications: false,
      emailNotifications: true,
    }
  });

  const [addressForm, setAddressForm] = useState({
    type: 'shipping',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    isDefault: false
  });

  const [paymentForm, setPaymentForm] = useState({
    type: 'credit_card',
    cardType: 'visa',
    last4: '',
    expiryMonth: '',
    expiryYear: '',
    isDefault: false
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (userInfo) {
      dispatch(getProfile());
    }
  }, [dispatch, userInfo]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.profile?.phone || '',
        dateOfBirth: user.profile?.dateOfBirth ? new Date(user.profile.dateOfBirth).toISOString().split('T')[0] : '',
        gender: user.profile?.gender || '',
        preferences: {
          newsletter: user.preferences?.newsletter ?? true,
          smsNotifications: user.preferences?.smsNotifications ?? false,
          emailNotifications: user.preferences?.emailNotifications ?? true,
        }
      });
    }
  }, [user]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    dispatch(updateProfile(profileForm));
    setEditMode(false);
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    dispatch(addAddress(addressForm));
    setAddAddressDialog(false);
    setAddressForm({
      type: 'shipping',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      isDefault: false
    });
  };

  const handleAddPayment = (e) => {
    e.preventDefault();
    
    // Basic validation for last 4 digits
    if (paymentForm.last4.length !== 4 || !/^\d+$/.test(paymentForm.last4)) {
      alert('Please enter valid last 4 digits of your card');
      return;
    }

    dispatch(addPaymentMethod(paymentForm));
    setAddPaymentDialog(false);
    setPaymentForm({
      type: 'credit_card',
      cardType: 'visa',
      last4: '',
      expiryMonth: '',
      expiryYear: '',
      isDefault: false
    });
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert('New password must be at least 6 characters');
      return;
    }

    dispatch(changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    }));
    setChangePasswordDialog(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleDeleteAddress = (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      dispatch(deleteAddress(addressId));
    }
  };

  const handleDeletePayment = (paymentMethodId) => {
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      dispatch(deletePaymentMethod(paymentMethodId));
    }
  };

  const handleSetDefaultPayment = (paymentMethodId) => {
    dispatch(setDefaultPaymentMethod(paymentMethodId));
  };

  const getCardIcon = (cardType) => {
    switch (cardType) {
      case 'visa': return '💳';
      case 'mastercard': return '💳';
      case 'amex': return '💳';
      case 'discover': return '💳';
      default: return '💳';
    }
  };

  if (!userInfo) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h4">
          Please log in to view your profile
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Profile
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Profile updated successfully!
        </Alert>
      )}

      <Paper elevation={3}>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab icon={<Person />} label="Personal Info" />
          <Tab icon={<LocationOn />} label="Addresses" />
          <Tab icon={<CreditCard />} label="Payment Methods" />
          <Tab icon={<Lock />} label="Security" />
        </Tabs>

        {/* Personal Info Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">Personal Information</Typography>
            <Button
              variant={editMode ? "outlined" : "contained"}
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? 'Cancel' : 'Edit Profile'}
            </Button>
          </Box>

          <Box component="form" onSubmit={handleProfileSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  disabled={!editMode}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  disabled={!editMode}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  disabled={!editMode}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  value={profileForm.dateOfBirth}
                  onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                  disabled={!editMode}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth disabled={!editMode}>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={profileForm.gender}
                    label="Gender"
                    onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                    <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Communication Preferences
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={profileForm.preferences.newsletter}
                      onChange={(e) => setProfileForm({
                        ...profileForm,
                        preferences: { ...profileForm.preferences, newsletter: e.target.checked }
                      })}
                      disabled={!editMode}
                    />
                  }
                  label="Receive newsletter and promotions"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={profileForm.preferences.emailNotifications}
                      onChange={(e) => setProfileForm({
                        ...profileForm,
                        preferences: { ...profileForm.preferences, emailNotifications: e.target.checked }
                      })}
                      disabled={!editMode}
                    />
                  }
                  label="Email notifications"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={profileForm.preferences.smsNotifications}
                      onChange={(e) => setProfileForm({
                        ...profileForm,
                        preferences: { ...profileForm.preferences, smsNotifications: e.target.checked }
                      })}
                      disabled={!editMode}
                    />
                  }
                  label="SMS notifications"
                />
              </Grid>
            </Grid>

            {editMode && (
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button type="submit" variant="contained" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="outlined" onClick={() => setEditMode(false)}>
                  Cancel
                </Button>
              </Box>
            )}
          </Box>
        </TabPanel>

        {/* Addresses Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">Saved Addresses</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setAddAddressDialog(true)}
            >
              Add Address
            </Button>
          </Box>

          <Grid container spacing={3}>
            {user?.addresses?.map((address) => (
              <Grid item xs={12} md={6} key={address._id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {address.type === 'shipping' ? 'Shipping Address' : 'Billing Address'}
                          {address.isDefault && (
                            <Typography variant="caption" color="primary" sx={{ ml: 1 }}>
                              (Default)
                            </Typography>
                          )}
                        </Typography>
                        <Typography>
                          {address.street}<br />
                          {address.city}, {address.state} {address.zipCode}<br />
                          {address.country}
                        </Typography>
                      </Box>
                      <Box>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteAddress(address._id)}
                          size="small"
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}

            {(!user?.addresses || user.addresses.length === 0) && (
              <Grid item xs={12}>
                <Typography color="text.secondary" align="center">
                  No addresses saved yet.
                </Typography>
              </Grid>
            )}
          </Grid>

          {/* Add Address Dialog */}
          <Dialog open={addAddressDialog} onClose={() => setAddAddressDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Add New Address</DialogTitle>
            <DialogContent>
              <Box component="form" sx={{ mt: 2 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Address Type</InputLabel>
                  <Select
                    value={addressForm.type}
                    label="Address Type"
                    onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value })}
                  >
                    <MenuItem value="shipping">Shipping</MenuItem>
                    <MenuItem value="billing">Billing</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Street Address"
                  value={addressForm.street}
                  onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                  sx={{ mb: 2 }}
                  required
                />
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    fullWidth
                    label="City"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    required
                  />
                  <TextField
                    fullWidth
                    label="State"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    required
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    fullWidth
                    label="ZIP Code"
                    value={addressForm.zipCode}
                    onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Country"
                    value={addressForm.country}
                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                    required
                  />
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={addressForm.isDefault}
                      onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    />
                  }
                  label="Set as default address"
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setAddAddressDialog(false)}>Cancel</Button>
              <Button onClick={handleAddAddress} variant="contained">
                Add Address
              </Button>
            </DialogActions>
          </Dialog>
        </TabPanel>

        {/* Payment Methods Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">Payment Methods</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setAddPaymentDialog(true)}
            >
              Add Payment Method
            </Button>
          </Box>

          <Grid container spacing={3}>
            {user?.paymentMethods?.map((payment) => (
              <Grid item xs={12} md={6} key={payment._id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {getCardIcon(payment.cardType)} {payment.cardType.toUpperCase()} •••• {payment.last4}
                          {payment.isDefault && (
                            <Typography variant="caption" color="primary" sx={{ ml: 1 }}>
                              (Default)
                            </Typography>
                          )}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Expires: {payment.expiryMonth}/{payment.expiryYear}
                        </Typography>
                      </Box>
                      <Box>
                        {!payment.isDefault && (
                          <Button
                            size="small"
                            onClick={() => handleSetDefaultPayment(payment._id)}
                            sx={{ mr: 1 }}
                          >
                            Set Default
                          </Button>
                        )}
                        <IconButton
                          color="error"
                          onClick={() => handleDeletePayment(payment._id)}
                          size="small"
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}

            {(!user?.paymentMethods || user.paymentMethods.length === 0) && (
              <Grid item xs={12}>
                <Typography color="text.secondary" align="center">
                  No payment methods saved yet.
                </Typography>
              </Grid>
            )}
          </Grid>

          {/* Add Payment Method Dialog */}
          <Dialog open={addPaymentDialog} onClose={() => setAddPaymentDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Add Payment Method</DialogTitle>
            <DialogContent>
              <Box component="form" sx={{ mt: 2 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Card Type</InputLabel>
                  <Select
                    value={paymentForm.cardType}
                    label="Card Type"
                    onChange={(e) => setPaymentForm({ ...paymentForm, cardType: e.target.value })}
                  >
                    <MenuItem value="visa">Visa</MenuItem>
                    <MenuItem value="mastercard">Mastercard</MenuItem>
                    <MenuItem value="amex">American Express</MenuItem>
                    <MenuItem value="discover">Discover</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Last 4 Digits"
                  value={paymentForm.last4}
                  onChange={(e) => setPaymentForm({ ...paymentForm, last4: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                  sx={{ mb: 2 }}
                  required
                  inputProps={{ maxLength: 4 }}
                />
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Expiry Month (MM)"
                    value={paymentForm.expiryMonth}
                    onChange={(e) => setPaymentForm({ ...paymentForm, expiryMonth: e.target.value.replace(/\D/g, '').slice(0, 2) })}
                    required
                    inputProps={{ maxLength: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Expiry Year (YYYY)"
                    value={paymentForm.expiryYear}
                    onChange={(e) => setPaymentForm({ ...paymentForm, expiryYear: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    required
                    inputProps={{ maxLength: 4 }}
                  />
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={paymentForm.isDefault}
                      onChange={(e) => setPaymentForm({ ...paymentForm, isDefault: e.target.checked })}
                    />
                  }
                  label="Set as default payment method"
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setAddPaymentDialog(false)}>Cancel</Button>
              <Button onClick={handleAddPayment} variant="contained">
                Add Payment Method
              </Button>
            </DialogActions>
          </Dialog>
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h5" gutterBottom>
            Security Settings
          </Typography>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Change Password
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Ensure your account is using a long, random password to stay secure.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setChangePasswordDialog(true)}
              >
                Change Password
              </Button>
            </CardContent>
          </Card>

          {/* Change Password Dialog */}
          <Dialog open={changePasswordDialog} onClose={() => setChangePasswordDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Change Password</DialogTitle>
            <DialogContent>
              <Box component="form" sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Current Password"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  sx={{ mb: 2 }}
                  required
                />
                <TextField
                  fullWidth
                  label="New Password"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  sx={{ mb: 2 }}
                  required
                />
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setChangePasswordDialog(false)}>Cancel</Button>
              <Button onClick={handleChangePassword} variant="contained">
                Change Password
              </Button>
            </DialogActions>
          </Dialog>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default ProfilePage;