import React, { useState } from "react";
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
  InputAdornment,
} from "@mui/material";
import { User, Phone, PlusCircle } from "lucide-react";
import { collectionService } from "../../services/collection.service";
import type { Customer } from "../../types/collection.types";

interface CreateCustomerModalProps {
  open: boolean;
  onClose: () => void;
  onCustomerCreated: (customer: Customer) => void;
}

export const CreateCustomerModal: React.FC<CreateCustomerModalProps> = ({
  open,
  onClose,
  onCustomerCreated,
}) => {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setMobile("");
    setErrorMessage(null);
    setLoading(false);
  };

  const handleClose = () => {
    if (loading) return;
    resetForm();
    onClose();
  };

  // Only allow numbers, max 10 digits
  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "");
    if (rawVal.length <= 10) {
      setMobile(rawVal);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage("Customer name is required");
      return;
    }

    if (!mobile) {
      setErrorMessage("Mobile number is required");
      return;
    }

    if (!/^\d{10}$/.test(mobile)) {
      setErrorMessage("Mobile number must be numbers only and exactly 10 digits");
      return;
    }

    setLoading(true);
    try {
      const res = await collectionService.createCustomer({
        name: trimmedName,
        mobile,
      });

      resetForm();
      onCustomerCreated(res.data);
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create customer. Existing mobile numbers cannot be added again.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: { xs: 2.5, sm: 3 },
            m: { xs: 1, sm: 2 },
            width: { xs: "calc(100% - 16px)", sm: "auto" },
            maxWidth: "360px !important",
            p: 0,
            backgroundColor: "background.paper",
            backgroundImage: "none",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 12px 36px rgba(0,0,0,0.5)",
          },
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ pb: 1, pt: { xs: 1.8, sm: 2.2 }, px: { xs: 1.8, sm: 2.5 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <Box
              sx={{
                width: { xs: 34, sm: 38 },
                height: { xs: 34, sm: 38 },
                borderRadius: 2,
                backgroundColor: "rgba(13, 148, 136, 0.15)",
                color: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <PlusCircle size={18} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: 800,
                  lineHeight: 1.2,
                  fontSize: { xs: "0.98rem", sm: "1.12rem" },
                }}
              >
                Create Customer
              </Typography>
              <Typography
                variant="caption"
                noWrap
                color="text.secondary"
                sx={{ display: "block", fontSize: { xs: "0.72rem", sm: "0.78rem" }, mt: 0.2 }}
              >
                Add customer to monthly records
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ px: { xs: 1.8, sm: 2.5 }, pt: 1, pb: 1 }}>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2 }} onClose={() => setErrorMessage(null)}>
              {errorMessage}
            </Alert>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.8, mt: 0.5 }}>
            {/* Customer Name */}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.6, fontSize: { xs: "0.8rem", sm: "0.85rem" } }}>
                Customer Name <span style={{ color: "#ef4444" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter customer name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                disabled={loading}
                slotProps={{
                  input: {
                    sx: { fontSize: { xs: "0.85rem", sm: "0.9rem" } },
                    startAdornment: (
                      <InputAdornment position="start">
                        <User size={15} style={{ color: "#9ca3af" }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>

            {/* Mobile Number */}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.6, fontSize: { xs: "0.8rem", sm: "0.85rem" } }}>
                Mobile Number <span style={{ color: "#ef4444" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter 10-digit number"
                value={mobile}
                onChange={handleMobileChange}
                disabled={loading}
                helperText={
                  mobile.length > 0 && mobile.length < 10
                    ? `${10 - mobile.length} more digits required`
                    : "Numbers only • Exactly 10 digits"
                }
                slotProps={{
                  formHelperText: {
                    sx: { fontSize: { xs: "0.68rem", sm: "0.75rem" }, mx: 0.5 },
                  },
                  input: {
                    sx: { fontSize: { xs: "0.85rem", sm: "0.9rem" } },
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
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: { xs: 1.8, sm: 2.5 }, py: { xs: 1.2, sm: 1.5 }, gap: 1 }}>
          <Button
            onClick={handleClose}
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
            disabled={loading || !name.trim() || mobile.length !== 10}
            sx={{
              minWidth: { xs: 75, sm: 90 },
              fontWeight: 700,
              fontSize: { xs: "0.75rem", sm: "0.82rem" },
              px: { xs: 1.2, sm: 1.8 },
            }}
          >
            {loading ? <CircularProgress size={14} color="inherit" /> : "Create"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateCustomerModal;
