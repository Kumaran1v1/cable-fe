import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAppDispatch, useAppSelector } from "../../store";
import { logout } from "../../store/slices/authSlice";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  onToggleSidebar: () => void;
}

import { authService } from "../../services/auth.service";

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn("Logout error:", err);
    } finally {
      dispatch(logout());
      navigate("/login");
    }
  };

  return (
    <AppBar position="sticky" elevation={1} sx={{ backgroundColor: "primary.main" }}>
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onToggleSidebar}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
          Cable Management App
        </Typography>

        {isAuthenticated ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body2">
              {user?.name || "User"} ({user?.role || "Member"})
            </Typography>
            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              size="small"
              variant="outlined"
              sx={{ borderColor: "rgba(255,255,255,0.5)" }}
            >
              Logout
            </Button>
          </Box>
        ) : (
          <Button color="inherit" onClick={() => navigate("/login")}>
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
