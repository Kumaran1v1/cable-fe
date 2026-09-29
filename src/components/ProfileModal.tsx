import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Avatar,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
} from "@mui/material";
import {
  User as UserIcon,
  Mail,
  Phone,
  Building,
  Lock,
  Camera,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  X,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/user.service";

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ open, onClose }) => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [profileImage, setProfileImage] = useState<string>("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing profile details strictly once when modal opens
  useEffect(() => {
    if (!open) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    setPassword("");
    setShowPassword(false);

    // 1. Immediately prefill from auth context user
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setMobile(user.mobile || "");
      setCompanyName(user.companyName || "Cable Network");
      setAge(user.age ? user.age.toString() : "");
      setGender((user.gender as any) || "");
      setProfileImage(user.profileImage || "");
    }

    // 2. Fetch fresh data once from server without triggering infinite loop
    let isMounted = true;
    const fetchProfile = async () => {
      setFetching(true);
      try {
        const res = await userService.getProfile();
        if (isMounted && res.success && res.data) {
          const u = res.data;
          setName(u.name || "");
          setEmail(u.email || "");
          setMobile(u.mobile || "");
          setCompanyName(u.companyName || "Cable Network");
          setAge(u.age ? u.age.toString() : "");
          setGender((u.gender as any) || "");
          setProfileImage(u.profileImage || "");
        }
      } catch (err: any) {
        // Silently use current context state if offline or failed
      } finally {
        if (isMounted) setFetching(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [open]);

  // Handle local image upload via FileReader
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (PNG, JPG, WEBP)");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage("Image file size should be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setProfileImage(base64);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setProfileImage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw.length <= 10) {
      setMobile(raw);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage("Name is required");
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    if (mobile && mobile.length !== 10) {
      setErrorMessage("Mobile number must be exactly 10 digits");
      return;
    }

    if (password && password.length < 6) {
      setErrorMessage("New password must be at least 6 characters");
      return;
    }

    const numAge = age ? parseInt(age, 10) : undefined;
    if (numAge !== undefined && (isNaN(numAge) || numAge < 0 || numAge > 120)) {
      setErrorMessage("Please enter a valid age between 1 and 120");
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        name: trimmedName,
        email: trimmedEmail.toLowerCase(),
        mobile: mobile.trim(),
        companyName: companyName.trim() || "Cable Network",
        gender,
        profileImage,
      };

      if (numAge !== undefined) {
        payload.age = numAge;
      }

      if (password) {
        payload.password = password;
      }

      const res = await userService.updateProfile(payload);
      if (res.success && res.data) {
        updateUser(res.data);
        setSuccessMessage("Profile updated successfully! New login details are now active.");
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || err?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (nameStr: string) => {
    if (!nameStr) return "U";
    const parts = nameStr.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      disableRestoreFocus
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: { xs: 2.5, sm: 3 },
            m: { xs: 1, sm: 2 },
            width: { xs: "calc(100% - 16px)", sm: "auto" },
            maxWidth: "460px !important",
            p: 0,
            backgroundColor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 14px 40px rgba(0,0,0,0.5)",
          },
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle
          sx={{
            pb: 1,
            pt: { xs: 1.8, sm: 2.2 },
            px: { xs: 1.8, sm: 2.5 },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                backgroundColor: "rgba(13, 148, 136, 0.15)",
                color: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <UserIcon size={18} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: 800,
                  lineHeight: 1.2,
                  fontSize: { xs: "0.98rem", sm: "1.12rem" },
                }}
              >
                Profile & Settings
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.72rem" }}>
                Update basic info, project name & login credentials
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}>
            <X size={18} />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            px: { xs: 1.8, sm: 2.5 },
            py: 1,
            maxHeight: "75vh",
            overflowY: "auto",
          }}
        >
          {fetching ? (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", py: 6 }}>
              <CircularProgress size={32} color="primary" />
            </Box>
          ) : (
            <>
              {errorMessage && (
                <Alert severity="error" sx={{ mb: 1.8, borderRadius: 2 }} onClose={() => setErrorMessage(null)}>
                  {errorMessage}
                </Alert>
              )}

              {successMessage && (
                <Alert
                  severity="success"
                  icon={<CheckCircle2 size={18} />}
                  sx={{ mb: 1.8, borderRadius: 2 }}
                >
                  {successMessage}
                </Alert>
              )}

              {/* Profile Image Avatar & Upload Button */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mb: 2.2,
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: "action.hover",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Box sx={{ position: "relative" }}>
                  <Avatar
                    src={profileImage || undefined}
                    sx={{
                      width: 62,
                      height: 62,
                      bgcolor: "primary.main",
                      fontSize: "1.2rem",
                      fontWeight: 800,
                      border: "2px solid #0d9488",
                      boxShadow: "0 4px 12px rgba(13, 148, 136, 0.25)",
                    }}
                  >
                    {!profileImage && getInitials(name)}
                  </Avatar>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleImageUpload}
                  />

                  <IconButton
                    size="small"
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      position: "absolute",
                      bottom: -4,
                      right: -4,
                      bgcolor: "primary.main",
                      color: "#fff",
                      width: 24,
                      height: 24,
                      boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
                      "&:hover": { bgcolor: "#0f766e" },
                    }}
                  >
                    <Camera size={13} />
                  </IconButton>
                </Box>

                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: "0.85rem", lineHeight: 1.2 }}>
                    Profile Photo
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.72rem", mb: 0.8 }}>
                    PNG, JPG or WEBP (Max 2MB)
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => fileInputRef.current?.click()}
                      sx={{ py: 0.2, px: 1, fontSize: "0.72rem", fontWeight: 700, borderRadius: 1.5 }}
                    >
                      Upload
                    </Button>
                    {profileImage && (
                      <Button
                        size="small"
                        color="error"
                        onClick={handleRemoveImage}
                        startIcon={<Trash2 size={12} />}
                        sx={{ py: 0.2, px: 1, fontSize: "0.72rem", fontWeight: 600 }}
                      >
                        Remove
                      </Button>
                    )}
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.6 }}>
                {/* 1. Basic Details */}
                <Typography variant="caption" sx={{ fontWeight: 800, color: "primary.main", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Basic Details
                </Typography>

                {/* Name */}
                <TextField
                  fullWidth
                  size="small"
                  label="Full Name *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  slotProps={{
                    input: {
                      sx: { fontSize: "0.85rem" },
                      startAdornment: (
                        <InputAdornment position="start">
                          <UserIcon size={15} style={{ color: "#9ca3af" }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                {/* Age & Gender in 2 columns */}
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    disabled={loading}
                    placeholder="e.g. 30"
                    slotProps={{
                      input: {
                        sx: { fontSize: "0.85rem" },
                        startAdornment: (
                          <InputAdornment position="start">
                            <Calendar size={15} style={{ color: "#9ca3af" }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  <FormControl fullWidth size="small">
                    <InputLabel id="profile-gender-label" sx={{ fontSize: "0.85rem" }}>
                      Gender
                    </InputLabel>
                    <Select
                      labelId="profile-gender-label"
                      label="Gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      disabled={loading}
                      sx={{ fontSize: "0.85rem" }}
                    >
                      <MenuItem value="" sx={{ fontSize: "0.85rem" }}>
                        <em>Not specified</em>
                      </MenuItem>
                      <MenuItem value="male" sx={{ fontSize: "0.85rem" }}>
                        Male
                      </MenuItem>
                      <MenuItem value="female" sx={{ fontSize: "0.85rem" }}>
                        Female
                      </MenuItem>
                      <MenuItem value="other" sx={{ fontSize: "0.85rem" }}>
                        Other
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Mobile Number */}
                <TextField
                  fullWidth
                  size="small"
                  label="Mobile Number"
                  value={mobile}
                  onChange={handleMobileChange}
                  disabled={loading}
                  placeholder="10-digit mobile"
                  helperText="Can be used to log in"
                  slotProps={{
                    formHelperText: { sx: { fontSize: "0.68rem", mx: 0.5 } },
                    input: {
                      sx: { fontSize: "0.85rem" },
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone size={15} style={{ color: "#9ca3af" }} />
                        </InputAdornment>
                      ),
                      endAdornment: mobile.length > 0 ? (
                        <InputAdornment position="end">
                          <Typography
                            variant="caption"
                            sx={{
                              color: mobile.length === 10 ? "success.main" : "text.secondary",
                              fontWeight: 700,
                              fontSize: "0.72rem",
                            }}
                          >
                            {mobile.length}/10
                          </Typography>
                        </InputAdornment>
                      ) : null,
                    },
                  }}
                />

                {/* 2. Project / Business Name */}
                <Typography variant="caption" sx={{ fontWeight: 800, color: "primary.main", textTransform: "uppercase", letterSpacing: "0.04em", mt: 0.5 }}>
                  Project / Business Name
                </Typography>

                <TextField
                  fullWidth
                  size="small"
                  label="Project / Company Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  disabled={loading}
                  placeholder="e.g. Cable Network"
                  helperText="Displayed in the header and sidebar"
                  slotProps={{
                    formHelperText: { sx: { fontSize: "0.68rem", mx: 0.5 } },
                    input: {
                      sx: { fontSize: "0.85rem" },
                      startAdornment: (
                        <InputAdornment position="start">
                          <Building size={15} style={{ color: "#9ca3af" }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                {/* 3. Security & Login Credentials */}
                <Typography variant="caption" sx={{ fontWeight: 800, color: "primary.main", textTransform: "uppercase", letterSpacing: "0.04em", mt: 0.5 }}>
                  Login Credentials
                </Typography>

                {/* Login Email */}
                <TextField
                  fullWidth
                  size="small"
                  label="Login Email *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  placeholder="admin@cable.com"
                  slotProps={{
                    input: {
                      sx: { fontSize: "0.85rem" },
                      startAdornment: (
                        <InputAdornment position="start">
                          <Mail size={15} style={{ color: "#9ca3af" }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                {/* Password Update */}
                <TextField
                  fullWidth
                  size="small"
                  label="New Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  placeholder="Leave blank to keep existing"
                  helperText="Minimum 6 characters. Enter only if changing password."
                  slotProps={{
                    formHelperText: { sx: { fontSize: "0.68rem", mx: 0.5 } },
                    input: {
                      sx: { fontSize: "0.85rem" },
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock size={15} style={{ color: "#9ca3af" }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: "text.secondary" }}
                          >
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ px: { xs: 1.8, sm: 2.5 }, py: { xs: 1.2, sm: 1.5 }, gap: 1 }}>
          <Button
            onClick={onClose}
            disabled={loading}
            color="inherit"
            size="small"
            sx={{ fontWeight: 600, fontSize: { xs: "0.75rem", sm: "0.82rem" }, px: { xs: 1, sm: 1.5 } }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="small"
            disabled={loading || fetching || !name.trim() || !email.trim()}
            sx={{
              minWidth: { xs: 90, sm: 110 },
              fontWeight: 700,
              fontSize: { xs: "0.75rem", sm: "0.82rem" },
              px: { xs: 1.4, sm: 2 },
            }}
          >
            {loading ? <CircularProgress size={14} color="inherit" /> : "Save Changes"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProfileModal;
