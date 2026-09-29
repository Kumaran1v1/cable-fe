import React, { useState, useEffect } from "react";
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
import { User, Phone, Edit, Trash2 } from "lucide-react";
import { collectionService } from "../../services/collection.service";
import type { GridCustomer } from "../../types/collection.types";

interface EditCustomerModalProps {
  open: boolean;
  onClose: () => void;
  customer: GridCustomer | null;
  onUpdated: () => void;
}

export const EditCustomerModal: React.FC<EditCustomerModalProps> = ({
  open,
  onClose,
  customer,
  onUpdated,
}) => {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setMobile(customer.mobile);
    }
    setErrorMessage(null);
  }, [customer, open]);

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "");
    if (rawVal.length <= 10) {
      setMobile(rawVal);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;
    setErrorMessage(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage("Customer name is required");
      return;
    }

    if (!mobile || !/^\d{10}$/.test(mobile)) {
      setErrorMessage("Mobile number must be numbers only and exactly 10 digits");
      return;
    }

    setLoading(true);
    try {
      await collectionService.updateCustomer(customer._id, {
        name: trimmedName,
        mobile,
      });

      onUpdated();
      onClose();
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || err?.message || "Failed to update customer"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!customer) return;
    if (!window.confirm(`Are you sure you want to delete customer "${customer.name}" and all their records?`)) {
      return;
    }

    setDeleting(true);
    try {
      await collectionService.deleteCustomer(customer._id);
      onUpdated();
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || err?.message || "Failed to delete customer");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 12px 36px rgba(0,0,0,0.5)",
          },
        },
      }}
    >
      <form onSubmit={handleSave}>
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
              <Edit size={18} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "0.98rem", sm: "1.12rem" },
                  lineHeight: 1.2,
                }}
              >
                Edit Customer
              </Typography>
              <Typography
                variant="caption"
                noWrap
                color="text.secondary"
                sx={{ display: "block", fontSize: { xs: "0.72rem", sm: "0.78rem" }, mt: 0.2 }}
              >
                Update customer contact details
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
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.6, fontSize: { xs: "0.8rem", sm: "0.85rem" } }}>
                Customer Name <span style={{ color: "#ef4444" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                disabled={loading || deleting}
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
                disabled={loading || deleting}
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

        <DialogActions
          sx={{
            px: { xs: 1.8, sm: 2.5 },
            py: { xs: 1.2, sm: 1.5 },
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            color="error"
            size="small"
            onClick={handleDelete}
            disabled={loading || deleting}
            startIcon={deleting ? <CircularProgress size={14} color="inherit" /> : <Trash2 size={14} />}
            sx={{ fontWeight: 600, fontSize: { xs: "0.75rem", sm: "0.82rem" }, px: { xs: 0.8, sm: 1.2 } }}
          >
            Delete
          </Button>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              onClick={onClose}
              disabled={loading || deleting}
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
              disabled={loading || deleting || !name.trim() || mobile.length !== 10}
              sx={{
                fontWeight: 700,
                minWidth: { xs: 68, sm: 80 },
                fontSize: { xs: "0.75rem", sm: "0.82rem" },
                px: { xs: 1.2, sm: 1.8 },
              }}
            >
              {loading ? <CircularProgress size={14} color="inherit" /> : "Save"}
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditCustomerModal;
