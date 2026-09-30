import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Mail, Lock, Eye, EyeOff, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ROUTES } from "../../routes/routeConstants";

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setErrorMessage("Please enter both login identifier and password");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid login credentials");
      }

      login(data.token, data.user);
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        background: "linear-gradient(135deg, #090d16 0%, #0d1527 50%, #060911 100%)",
      }}
    >
      <Card
        sx={{
          maxWidth: 440,
          width: "100%",
          p: { xs: 2.5, sm: 4 },
          borderRadius: 3,
          backgroundColor: "rgba(17, 24, 39, 0.85)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)",
        }}
      >
        <CardContent sx={{ p: 0 }}>
          {/* Logo & Header */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "16px",
                backgroundColor: "rgba(13, 148, 136, 0.15)",
                border: "1px solid rgba(45, 212, 191, 0.4)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
                color: "#2dd4bf",
              }}
            >
              <Layers size={28} />
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: "#f8fafc",
                letterSpacing: "-0.02em",
                mb: 0.5,
              }}
            >
              Login
            </Typography>
            <Typography variant="body2" color="#94a3b8">
              Sign in to manage your network and collections
            </Typography>
          </Box>

          {errorMessage && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                backgroundColor: "rgba(239, 68, 68, 0.12)",
                color: "#fca5a5",
                border: "1px solid rgba(239, 68, 68, 0.3)",
              }}
            >
              {errorMessage}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
          >
            <TextField
              label="Email or Mobile Number"
              variant="outlined"
              fullWidth
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={loading}
              placeholder="Enter your email or phone number"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={19} style={{ color: "#2dd4bf" }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "rgba(15, 23, 42, 0.65)",
                  color: "#f8fafc",
                  "& fieldset": { borderColor: "rgba(255, 255, 255, 0.12)" },
                  "&:hover fieldset": { borderColor: "rgba(45, 212, 191, 0.5)" },
                  "&.Mui-focused fieldset": {
                    borderColor: "#2dd4bf",
                    boxShadow: "0 0 10px rgba(45, 212, 191, 0.2)",
                  },
                },
                "& .MuiInputLabel-root": { color: "#94a3b8" },
                "& .MuiInputLabel-root.Mui-focused": { color: "#2dd4bf" },
              }}
            />

            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              placeholder="Enter your password"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock size={19} style={{ color: "#2dd4bf" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: "#94a3b8", "&:hover": { color: "#2dd4bf" } }}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "rgba(15, 23, 42, 0.65)",
                  color: "#f8fafc",
                  "& fieldset": { borderColor: "rgba(255, 255, 255, 0.12)" },
                  "&:hover fieldset": { borderColor: "rgba(45, 212, 191, 0.5)" },
                  "&.Mui-focused fieldset": {
                    borderColor: "#2dd4bf",
                    boxShadow: "0 0 10px rgba(45, 212, 191, 0.2)",
                  },
                },
                "& .MuiInputLabel-root": { color: "#94a3b8" },
                "& .MuiInputLabel-root.Mui-focused": { color: "#2dd4bf" },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              fullWidth
              sx={{
                py: 1.4,
                mt: 1,
                borderRadius: 2,
                fontWeight: 700,
                fontSize: "15px",
                textTransform: "none",
                background: "linear-gradient(135deg, #0d9488 0%, #10b981 100%)",
                boxShadow: "0 8px 24px rgba(13, 148, 136, 0.35)",
                color: "#ffffff",
                transition: "all 0.2s ease",
                "&:hover": {
                  background: "linear-gradient(135deg, #14b8a6 0%, #34d399 100%)",
                  boxShadow: "0 10px 28px rgba(45, 212, 191, 0.5)",
                  transform: "translateY(-1px)",
                },
              }}
            >
              {loading ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                "Sign In"
              )}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
