import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Box,
  Container,
  Menu,
  MenuItem,
  InputBase,
} from "@mui/material";
import {
  Search,
  ShoppingCart,
  Person,
  SportsBasketball,
} from "@mui/icons-material";
import { styled, alpha } from "@mui/material/styles";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice";

const SearchContainer = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartItemsCount = cartItems.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleMenuClose();
    navigate("/");
  };

  return (
    <AppBar position="sticky" sx={{ bgcolor: "secondary.main" }}>
      <Container maxWidth="xl">
        <Toolbar>
          <SportsBasketball sx={{ mr: 2 }} />
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: "none",
              color: "inherit",
              fontWeight: 700,
            }}
          >
            URBAN ATHLETE
          </Typography>
 
<Button color="inherit" component={Link} to="/products">
  Shop All
</Button>
          <SearchContainer>
            <SearchIconWrapper>
              <Search />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search products..."
              inputProps={{ "aria-label": "search" }}
            />
          </SearchContainer>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton color="inherit" component={Link} to="/cart">
              <Badge badgeContent={cartItemsCount} color="primary">
                <ShoppingCart />
              </Badge>
            </IconButton>

            {userInfo ? (
              <>
                <IconButton color="inherit" onClick={handleProfileMenuOpen}>
                  <Person />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  {userInfo?.isAdmin && (
  <MenuItem onClick={handleMenuClose} component={Link} to="/admin">
    Admin Dashboard
  </MenuItem>
)}
                  <MenuItem
                    onClick={handleMenuClose}
                    component={Link}
                    to="/profile"
                  >
                    My Profile
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
