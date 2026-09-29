import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  RadioGroup,
  FormControlLabel,
  Radio,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
} from "@mui/material";
import {
  ArrowLeft,
  Phone,
  Edit3,
  Save,
  X,
  CreditCard,
  History,
} from "lucide-react";
import type { Customer, MonthlyEntry } from "../../types/collection.types";
import { collectionService } from "../../services/collection.service";
import {
  formatCurrency,
  formatMonthYear,
  getCurrentMonthString,
} from "../../utils/format";
import MonthNavigator from "./MonthNavigator";

interface CustomerMonthlyDetailProps {
  customer: Customer;
  initialMonth: string; // YYYY-MM
  onBack: () => void;
  onEntryUpdated: () => void;
}

export const CustomerMonthlyDetail: React.FC<CustomerMonthlyDetailProps> = ({
  customer,
  initialMonth,
  onBack,
  onEntryUpdated,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(initialMonth);
  const [currentEntry, setCurrentEntry] = useState<MonthlyEntry | null>(null);
  const [history, setHistory] = useState<MonthlyEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [amountInput, setAmountInput] = useState<string>("");
  const [paymentStatusInput, setPaymentStatusInput] = useState<"PAID" | "PENDING">("PENDING");

  const currentSystemMonth = getCurrentMonthString();

  // Fetch single month entry + full history
  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      // 1. Fetch single month entry
      const singleRes = await collectionService.getSingleMonthEntry(customer._id, selectedMonth);
      const entry = singleRes.data;
      setCurrentEntry(entry);

      if (entry) {
        setAmountInput(entry.amount.toString());
        setPaymentStatusInput(entry.paymentStatus);
        setIsEditing(false);
      } else {
        setAmountInput("");
        setPaymentStatusInput("PENDING");
        // If there's no entry for this month, default to open form for editing/creating
        setIsEditing(true);
      }

      // 2. Fetch payment history
      const historyRes = await collectionService.getCustomerHistory(customer._id);
      setHistory(historyRes.data || []);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || err?.message || "Failed to load customer records");
    } finally {
      setLoading(false);
    }
  }, [customer._id, selectedMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle amount change (numeric only)
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^\d]/g, "");
    setAmountInput(val);
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const numAmount = parseInt(amountInput, 10);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage("Please enter a valid monthly amount greater than ₹0");
      return;
    }

    setSaving(true);
    try {
      const res = await collectionService.saveMonthlyEntry({
        customerId: customer._id,
        month: selectedMonth,
        amount: numAmount,
        paymentStatus: paymentStatusInput,
      });

      setSuccessMessage(res.message || "Monthly entry saved successfully");
      setIsEditing(false);
      await loadData();
      onEntryUpdated();
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || err?.message || "Failed to save monthly entry"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleQuickMarkPaid = async (entry: MonthlyEntry) => {
    try {
      await collectionService.saveMonthlyEntry({
        customerId: customer._id,
        month: entry.month,
        amount: entry.amount,
        paymentStatus: "PAID",
      });
      loadData();
      onEntryUpdated();
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to update entry");
    }
  };

  return (
    <Box sx={{ maxWidth: 860, mx: "auto", pb: 5 }}>
      {/* Top Navigation */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Button
          onClick={onBack}
          startIcon={<ArrowLeft size={18} />}
          variant="outlined"
          size="small"
          sx={{
            borderColor: "divider",
            color: "text.primary",
            "&:hover": { borderColor: "primary.main", backgroundColor: "action.hover" },
          }}
        >
          Back to Customer List
        </Button>
      </Box>

      {/* 1. Customer Details Header Card */}
      <Card
        sx={{
          mb: 3,
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          backgroundColor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                backgroundColor: "rgba(13, 148, 136, 0.15)",
                color: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "1.25rem",
                border: "2px solid #0d9488",
              }}
            >
              {customer.name ? customer.name.substring(0, 2).toUpperCase() : "CU"}
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: "-0.01em" }}>
                {customer.name}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.3 }}>
                <Phone size={14} style={{ color: "#9ca3af" }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>
                  {customer.mobile}
                </Typography>
                <Chip
                  label={customer.status.toUpperCase()}
                  size="small"
                  color={customer.status === "active" ? "success" : "default"}
                  sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700 }}
                />
              </Box>
            </Box>
          </Box>

          {/* Quick month switch inside header */}
          <MonthNavigator
            selectedMonth={selectedMonth}
            onChangeMonth={(newMonth) => {
              setSelectedMonth(newMonth);
              setSuccessMessage(null);
            }}
          />
        </Box>
      </Card>

      {/* Notifications */}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }} onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {/* 2. Monthly Entry Card */}
      <Card
        sx={{
          mb: 4,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: (theme) =>
            theme.palette.mode === "dark"
              ? "0 8px 24px rgba(0,0,0,0.4)"
              : "0 4px 16px rgba(0,0,0,0.06)",
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2.5,
              borderBottom: "1px solid",
              borderColor: "divider",
              pb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <CreditCard size={22} style={{ color: "#0d9488" }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Monthly Entry — {formatMonthYear(selectedMonth)}
              </Typography>
            </Box>

            {currentEntry && !isEditing && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<Edit3 size={16} />}
                onClick={() => setIsEditing(true)}
                sx={{ fontWeight: 600, borderRadius: 2 }}
              >
                Edit Entry
              </Button>
            )}
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress size={32} color="primary" />
            </Box>
          ) : !isEditing && currentEntry ? (
            /* VIEW MODE FOR EXISTING ENTRY */
            <Box sx={{ py: 1 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 3,
                  alignItems: "center",
                  p: { xs: 2, sm: 3 },
                  borderRadius: 2.5,
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.02)"
                      : "rgba(0, 0, 0, 0.02)",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                {/* Amount Display */}
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Monthly Collection Amount
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      color: "text.primary",
                      mt: 0.5,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {formatCurrency(currentEntry.amount)}
                  </Typography>
                </Box>

                {/* Payment Status Display */}
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Payment Status
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {currentEntry.paymentStatus === "PAID" ? (
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 1,
                          px: 2,
                          py: 0.8,
                          borderRadius: 2,
                          backgroundColor: "rgba(34, 197, 94, 0.12)",
                          color: "#22c55e",
                          border: "1px solid rgba(34, 197, 94, 0.3)",
                        }}
                      >
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            backgroundColor: "#22c55e",
                            boxShadow: "0 0 8px #22c55e",
                          }}
                        />
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, letterSpacing: "0.02em" }}>
                          PAID
                        </Typography>
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 1,
                          px: 2,
                          py: 0.8,
                          borderRadius: 2,
                          backgroundColor: "rgba(239, 68, 68, 0.12)",
                          color: "#ef4444",
                          border: "1px solid rgba(239, 68, 68, 0.3)",
                        }}
                      >
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            backgroundColor: "#ef4444",
                            boxShadow: "0 0 8px #ef4444",
                          }}
                        />
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, letterSpacing: "0.02em" }}>
                          PENDING
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>

              <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  onClick={() => setIsEditing(true)}
                  startIcon={<Edit3 size={16} />}
                  sx={{ fontWeight: 700 }}
                >
                  Edit Entry
                </Button>
              </Box>
            </Box>
          ) : (
            /* CREATE / EDIT FORM */
            <form onSubmit={handleSaveEntry}>
              {currentEntry && (
                <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                  <strong>{formatMonthYear(selectedMonth)}</strong> entry already exists. You are editing the existing record. (Only one record per customer per month is maintained).
                </Alert>
              )}

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                {/* Readonly Customer Details */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
                    gap: 2,
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: "action.hover",
                  }}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Customer Name
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {customer.name}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Mobile Number
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {customer.mobile}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Selected Month
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "primary.main" }}>
                      {formatMonthYear(selectedMonth)}
                    </Typography>
                  </Box>
                </Box>

                {/* Amount Input */}
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.8 }}>
                    Monthly Amount <span style={{ color: "#ef4444" }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter monthly amount (e.g. 5000)"
                    value={amountInput}
                    onChange={handleAmountChange}
                    autoFocus
                    disabled={saving}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Typography sx={{ fontWeight: 700, color: "text.secondary" }}>₹</Typography>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                    There is no daily attendance status or date selection — one single entry covers the entire month.
                  </Typography>
                </Box>

                {/* Payment Status Radio */}
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                    Payment Status
                  </Typography>
                  <RadioGroup
                    row
                    value={paymentStatusInput}
                    onChange={(e) => setPaymentStatusInput(e.target.value as "PAID" | "PENDING")}
                    sx={{ gap: 2 }}
                  >
                    <Box
                      onClick={() => setPaymentStatusInput("PAID")}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        cursor: "pointer",
                        border: "1px solid",
                        borderColor: paymentStatusInput === "PAID" ? "#22c55e" : "divider",
                        backgroundColor:
                          paymentStatusInput === "PAID"
                            ? "rgba(34, 197, 94, 0.08)"
                            : "transparent",
                      }}
                    >
                      <FormControlLabel
                        value="PAID"
                        control={<Radio color="success" size="small" />}
                        label={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                backgroundColor: "#22c55e",
                              }}
                            />
                            <Typography sx={{ fontWeight: 700, color: "#22c55e" }}>PAID</Typography>
                          </Box>
                        }
                        sx={{ m: 0 }}
                      />
                    </Box>

                    <Box
                      onClick={() => setPaymentStatusInput("PENDING")}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        cursor: "pointer",
                        border: "1px solid",
                        borderColor: paymentStatusInput === "PENDING" ? "#ef4444" : "divider",
                        backgroundColor:
                          paymentStatusInput === "PENDING"
                            ? "rgba(239, 68, 68, 0.08)"
                            : "transparent",
                      }}
                    >
                      <FormControlLabel
                        value="PENDING"
                        control={<Radio color="error" size="small" />}
                        label={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                backgroundColor: "#ef4444",
                              }}
                            />
                            <Typography sx={{ fontWeight: 700, color: "#ef4444" }}>PENDING</Typography>
                          </Box>
                        }
                        sx={{ m: 0 }}
                      />
                    </Box>
                  </RadioGroup>
                </Box>

                {/* Form Buttons */}
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 2 }}>
                  {currentEntry && (
                    <Button
                      variant="outlined"
                      color="inherit"
                      onClick={() => setIsEditing(false)}
                      disabled={saving}
                      startIcon={<X size={16} />}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={saving || !amountInput || parseInt(amountInput, 10) <= 0}
                    startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save size={16} />}
                    sx={{ fontWeight: 700, minWidth: 130 }}
                  >
                    {saving ? "Saving..." : "Save Entry"}
                  </Button>
                </Box>
              </Box>
            </form>
          )}
        </CardContent>
      </Card>

      {/* 3. Payment History Section */}
      <Card
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
            <History size={20} style={{ color: "#6366f1" }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Payment History
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
            Unpaid amounts from previous months remain visibly highlighted in red until cleared.
          </Typography>

          {history.length === 0 ? (
            <Box
              sx={{
                py: 4,
                textAlign: "center",
                backgroundColor: "action.hover",
                borderRadius: 2,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No past payment history recorded for this customer yet.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: "action.hover" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Month</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Payment Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map((item) => {
                    const isSelected = item.month === selectedMonth;
                    const isCurrent = item.month === currentSystemMonth;
                    const isPaid = item.paymentStatus === "PAID";
                    const isUnpaidPast = item.month < currentSystemMonth && !isPaid;

                    return (
                      <TableRow
                        key={item._id || item.month}
                        sx={{
                          backgroundColor: isSelected
                            ? "action.selected"
                            : isUnpaidPast
                            ? "rgba(239, 68, 68, 0.04)"
                            : "inherit",
                          "&:hover": { backgroundColor: "action.hover" },
                        }}
                      >
                        {/* Month */}
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {formatMonthYear(item.month)}
                            </Typography>
                            {isCurrent && (
                              <Chip
                                label="CURRENT"
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: "0.6rem",
                                  fontWeight: 700,
                                  backgroundColor: "rgba(99, 102, 241, 0.12)",
                                  color: "#6366f1",
                                }}
                              />
                            )}
                          </Box>
                        </TableCell>

                        {/* Amount */}
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              color: isUnpaidPast ? "#ef4444" : "text.primary",
                            }}
                          >
                            {formatCurrency(item.amount)}
                          </Typography>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          {isPaid ? (
                            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.8 }}>
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  backgroundColor: "#22c55e",
                                }}
                              />
                              <Typography
                                variant="caption"
                                sx={{ fontWeight: 800, color: "#22c55e", letterSpacing: "0.02em" }}
                              >
                                PAID
                              </Typography>
                            </Box>
                          ) : (
                            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.8 }}>
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  backgroundColor: "#ef4444",
                                  boxShadow: isUnpaidPast ? "0 0 6px #ef4444" : "none",
                                }}
                              />
                              <Typography
                                variant="caption"
                                sx={{ fontWeight: 800, color: "#ef4444", letterSpacing: "0.02em" }}
                              >
                                PENDING
                              </Typography>
                            </Box>
                          )}
                        </TableCell>

                        {/* Action */}
                        <TableCell align="right">
                          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                            {!isPaid && (
                              <Button
                                size="small"
                                variant="outlined"
                                color="success"
                                onClick={() => handleQuickMarkPaid(item)}
                                sx={{ py: 0.2, px: 1, fontSize: "0.75rem", borderRadius: 1.5 }}
                              >
                                Mark Paid
                              </Button>
                            )}
                            <Button
                              size="small"
                              variant="text"
                              onClick={() => {
                                setSelectedMonth(item.month);
                                setIsEditing(true);
                              }}
                              sx={{ py: 0.2, px: 1, fontSize: "0.75rem" }}
                            >
                              View/Edit
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default CustomerMonthlyDetail;
