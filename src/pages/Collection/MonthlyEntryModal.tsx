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
import { CreditCard, Trash2, Save } from "lucide-react";
import { collectionService } from "../../services/collection.service";
import type { MonthlyEntry } from "../../types/collection.types";
import { formatMonthYear } from "../../utils/format";

interface MonthlyEntryModalProps {
  open: boolean;
  onClose: () => void;
  customerId: string;
  customerName: string;
  customerMobile: string;
  month: string; // YYYY-MM
  existingEntry?: MonthlyEntry | null;
  onSaved: () => void;
}

export const MonthlyEntryModal: React.FC<MonthlyEntryModalProps> = ({
  open,
  onClose,
  customerId,
  customerName,
  customerMobile,
  month,
  existingEntry,
  onSaved,
}) => {
  const [amount, setAmount] = useState<string>("");
  const [status, setStatus] = useState<"PAID" | "PENDING">("PAID");
  const [loading, setLoading] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (existingEntry) {
      setAmount(existingEntry.amount > 0 ? existingEntry.amount.toString() : "");
      setStatus(existingEntry.paymentStatus || "PAID");
    } else {
      setAmount("");
      setStatus("PAID");
    }
    setErrorMessage(null);
  }, [existingEntry, open]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^\d]/g, "");
    setAmount(val);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const numAmount = parseInt(amount, 10);
    if (isNaN(numAmount) || numAmount < 0) {
      setErrorMessage("Please enter a valid amount (₹0 or greater)");
      return;
    }

    setLoading(true);
    try {
      await collectionService.saveMonthlyEntry({
        customerId,
        month,
        amount: numAmount,
        paymentStatus: status,
      });

      onSaved();
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || err?.message || "Failed to save entry");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingEntry?._id) return;
    setDeleting(true);
    try {
      await collectionService.deleteMonthlyEntry(existingEntry._id);
      onSaved();
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || err?.message || "Failed to remove entry");
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
              <CreditCard size={18} />
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
                Monthly Entry
              </Typography>
              <Typography
                variant="caption"
                noWrap
                color="text.secondary"
                sx={{ display: "block", fontSize: { xs: "0.72rem", sm: "0.78rem" }, mt: 0.2 }}
              >
                {formatMonthYear(month)}
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

          {/* Customer Summary Card */}
          <Box
            sx={{
              p: { xs: 1.2, sm: 1.5 },
              mb: 1.8,
              borderRadius: 2,
              backgroundColor: "action.hover",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Customer
            </Typography>
            <Typography variant="subtitle1" noWrap sx={{ fontWeight: 800, fontSize: { xs: "0.92rem", sm: "1rem" }, lineHeight: 1.25 }}>
              {customerName}
            </Typography>
            <Typography variant="caption" noWrap sx={{ color: "text.secondary", fontWeight: 600, display: "block", fontSize: { xs: "0.75rem", sm: "0.8rem" }, mt: 0.2 }}>
              {customerMobile}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.8 }}>
            {/* Status Selection: P vs A */}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.8, fontSize: { xs: "0.8rem", sm: "0.85rem" } }}>
                Status Selection
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: { xs: 0.8, sm: 1.2 } }}>
                {/* PAID Button (P) */}
                <Box
                  onClick={() => setStatus("PAID")}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: { xs: 0.6, sm: 1 },
                    px: { xs: 0.8, sm: 1.2 },
                    py: { xs: 0.9, sm: 1.1 },
                    borderRadius: 2,
                    cursor: "pointer",
                    border: "2px solid",
                    borderColor: status === "PAID" ? "#22c55e" : "divider",
                    backgroundColor:
                      status === "PAID" ? "rgba(34, 197, 94, 0.15)" : "transparent",
                    transition: "all 0.15s ease",
                    boxSizing: "border-box",
                    minWidth: 0,
                    "&:hover": {
                      borderColor: "#22c55e",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 22, sm: 24 },
                      height: { xs: 22, sm: 24 },
                      borderRadius: 1.2,
                      backgroundColor: "#22c55e",
                      color: "#fff",
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: { xs: "0.72rem", sm: "0.8rem" },
                      flexShrink: 0,
                    }}
                  >
                    P
                  </Box>
                  <Typography
                    variant="body2"
                    noWrap
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: "0.75rem", sm: "0.82rem" },
                      color: status === "PAID" ? "#22c55e" : "text.secondary",
                      letterSpacing: "0.02em",
                    }}
                  >
                    PAID
                  </Typography>
                </Box>

                {/* PENDING Button (A) */}
                <Box
                  onClick={() => setStatus("PENDING")}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: { xs: 0.6, sm: 1 },
                    px: { xs: 0.8, sm: 1.2 },
                    py: { xs: 0.9, sm: 1.1 },
                    borderRadius: 2,
                    cursor: "pointer",
                    border: "2px solid",
                    borderColor: status === "PENDING" ? "#ef4444" : "divider",
                    backgroundColor:
                      status === "PENDING" ? "rgba(239, 68, 68, 0.15)" : "transparent",
                    transition: "all 0.15s ease",
                    boxSizing: "border-box",
                    minWidth: 0,
                    "&:hover": {
                      borderColor: "#ef4444",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 22, sm: 24 },
                      height: { xs: 22, sm: 24 },
                      borderRadius: 1.2,
                      backgroundColor: "#ef4444",
                      color: "#fff",
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: { xs: "0.72rem", sm: "0.8rem" },
                      flexShrink: 0,
                    }}
                  >
                    A
                  </Box>
                  <Typography
                    variant="body2"
                    noWrap
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: "0.75rem", sm: "0.82rem" },
                      color: status === "PENDING" ? "#ef4444" : "text.secondary",
                      letterSpacing: "0.02em",
                    }}
                  >
                    PENDING
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Monthly Amount Input */}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.6, fontSize: { xs: "0.8rem", sm: "0.85rem" } }}>
                Monthly Amount
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter amount (e.g. 5000)"
                value={amount}
                onChange={handleAmountChange}
                autoFocus
                disabled={loading || deleting}
                slotProps={{
                  input: {
                    sx: { fontSize: { xs: "0.85rem", sm: "0.9rem" } },
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography sx={{ fontWeight: 800, color: "primary.main", fontSize: "0.9rem" }}>
                          ₹
                        </Typography>
                      </InputAdornment>
                    ),
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
            justifyContent: existingEntry ? "space-between" : "flex-end",
            alignItems: "center",
          }}
        >
          {existingEntry && (
            <Button
              color="error"
              size="small"
              onClick={handleDelete}
              disabled={loading || deleting}
              startIcon={deleting ? <CircularProgress size={14} color="inherit" /> : <Trash2 size={14} />}
              sx={{ fontWeight: 600, fontSize: { xs: "0.75rem", sm: "0.82rem" }, px: { xs: 0.8, sm: 1.2 } }}
            >
              Clear
            </Button>
          )}

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
              disabled={loading || deleting}
              startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <Save size={14} />}
              sx={{
                fontWeight: 700,
                minWidth: { xs: 72, sm: 85 },
                fontSize: { xs: "0.75rem", sm: "0.82rem" },
                px: { xs: 1.2, sm: 1.8 },
              }}
            >
              Save
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default MonthlyEntryModal;
