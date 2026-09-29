import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Card,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  TablePagination,
} from "@mui/material";
import {
  Users,
  IndianRupee,
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Search,
  CheckCircle2,
  TrendingUp,
  Phone,
} from "lucide-react";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import dashboardService from "../../services/dashboard.service";
import type { DashboardSummaryData, UnpaidCustomerItem } from "../../types/dashboard.types";
import { formatCurrency, formatMonthYear, getOffsetMonthString } from "../../utils/format";
import WhatsAppReminderModal from "../../components/WhatsAppReminderModal";



export const Dashboard: React.FC = () => {
  const currentSystemDate = new Date();
  const currentYear = currentSystemDate.getFullYear().toString();
  const currentMonthNum = String(currentSystemDate.getMonth() + 1).padStart(2, "0");
  const systemMonthStr = `${currentYear}-${currentMonthNum}`;

  const [selectedYear, setSelectedYear] = useState<string>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<string>(systemMonthStr);
  const [data, setData] = useState<DashboardSummaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [unpaidSearch, setUnpaidSearch] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

  useEffect(() => {
    setPage(0);
  }, [unpaidSearch, selectedMonth]);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await dashboardService.getSummary(selectedYear, selectedMonth);
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || err?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleMonthChange = (newMonth: string) => {
    if (!newMonth) return;
    setSelectedMonth(newMonth);
    const yr = newMonth.split("-")[0];
    if (yr) setSelectedYear(yr);
  };

  const handlePrevMonth = () => {
    const prev = getOffsetMonthString(selectedMonth, -1);
    handleMonthChange(prev);
  };

  const handleNextMonth = () => {
    if (selectedMonth >= systemMonthStr) return;
    const next = getOffsetMonthString(selectedMonth, 1);
    if (next <= systemMonthStr) {
      handleMonthChange(next);
    }
  };

  const [whatsAppModalCust, setWhatsAppModalCust] = useState<UnpaidCustomerItem | null>(null);

  const filteredUnpaid = useMemo(() => {
    if (!data?.unpaidCustomers) return [];
    if (!unpaidSearch.trim()) return data.unpaidCustomers;
    const q = unpaidSearch.toLowerCase().trim();
    return data.unpaidCustomers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.mobile.includes(q)
    );
  }, [data?.unpaidCustomers, unpaidSearch]);

  const paginatedUnpaid = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredUnpaid.slice(start, start + rowsPerPage);
  }, [filteredUnpaid, page, rowsPerPage]);

  return (
    <Box
      sx={{
        p: { xs: 0.4, sm: 1.5 },
        pt: { xs: 0.2, sm: 1 },
        display: "flex",
        flexDirection: "column",
        gap: { xs: 1, sm: 2 },
        backgroundColor: "background.default",
      }}
    >
      {/* Top Filter Bar */}
      <Card
        sx={{
          p: { xs: 0.8, sm: 1.5 },
          borderRadius: { xs: 2, sm: 2.5 },
          backgroundColor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "nowrap",
            gap: { xs: 0.6, sm: 1.5 },
          }}
        >
          {/* Dashboard Title */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, minWidth: 0, flexShrink: 0 }}>
            <TrendingUp size={18} style={{ color: "#0d9488" }} />
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 800,
                fontSize: { xs: "0.88rem", sm: "1.1rem" },
                letterSpacing: "-0.01em",
              }}
            >
              Dashboard
            </Typography>
          </Box>

          {/* Controls: Default Calendar Month & Year Picker */}
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.3, sm: 0.6 }, flexShrink: 0 }}>
            <IconButton
              size="small"
              onClick={handlePrevMonth}
              title="Previous Month"
              sx={{
                p: { xs: 0.3, sm: 0.5 },
                color: "text.primary",
                borderRadius: 1.5,
                backgroundColor: "action.hover",
                "&:hover": { backgroundColor: "action.selected" },
              }}
            >
              <ChevronLeft size={16} />
            </IconButton>

            <TextField
              type="month"
              size="small"
              value={selectedMonth}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleMonthChange(e.target.value)}
              slotProps={{
                htmlInput: {
                  max: systemMonthStr,
                  onClick: (e: any) => {
                    try {
                      e.currentTarget.showPicker?.();
                    } catch {}
                  },
                },
              }}
              sx={{
                width: { xs: 130, sm: 160 },
                "& .MuiInputBase-root": {
                  height: { xs: 30, sm: 34 },
                  borderRadius: 1.5,
                  backgroundColor: "action.hover",
                  fontSize: { xs: "0.75rem", sm: "0.82rem" },
                  fontWeight: 700,
                  cursor: "pointer",
                  colorScheme: (theme: any) => theme.palette.mode,
                  "& input": {
                    py: 0.3,
                    px: { xs: 0.6, sm: 1 },
                    cursor: "pointer",
                  },
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "divider",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "primary.main",
                },
              }}
            />

            <IconButton
              size="small"
              onClick={handleNextMonth}
              disabled={selectedMonth >= systemMonthStr}
              title="Next Month"
              sx={{
                p: { xs: 0.3, sm: 0.5 },
                color: selectedMonth >= systemMonthStr ? "text.disabled" : "text.primary",
                borderRadius: 1.5,
                backgroundColor: "action.hover",
                "&:hover": { backgroundColor: "action.selected" },
              }}
            >
              <ChevronRight size={16} />
            </IconButton>
          </Box>
        </Box>
      </Card>

      {/* Error alert */}
      {errorMessage && (
        <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      {loading && !data ? (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", py: 8 }}>
          <CircularProgress size={36} color="primary" />
        </Box>
      ) : (
        <>
          {/* THE 4 KEY METRIC CARDS */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr 1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: { xs: 1, sm: 1.5 },
            }}
          >
            {/* Card 1: Customer Count */}
            <Card
              sx={{
                p: { xs: 1.2, sm: 1.8 },
                borderRadius: 2,
                backgroundColor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.8 }}>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, fontSize: { xs: "0.7rem", sm: "0.78rem" } }}>
                  Customers
                </Typography>
                <Box
                  sx={{
                    width: { xs: 26, sm: 32 },
                    height: { xs: 26, sm: 32 },
                    borderRadius: 1.5,
                    backgroundColor: "rgba(13, 148, 136, 0.15)",
                    color: "#0d9488",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Users size={16} />
                </Box>
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: "1.3rem", sm: "1.7rem" },
                  color: "text.primary",
                  lineHeight: 1.1,
                }}
              >
                {data?.customerCount ?? 0}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", fontSize: { xs: "0.68rem", sm: "0.75rem" }, mt: 0.4, display: "block" }}>
                Total Active Subscribers
              </Typography>
            </Card>

            {/* Card 2: Current Month Collection */}
            <Card
              sx={{
                p: { xs: 1.2, sm: 1.8 },
                borderRadius: 2,
                backgroundColor: "background.paper",
                border: "1px solid",
                borderColor: "rgba(34, 197, 94, 0.3)",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(34, 197, 94, 0.08)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.8 }}>
                <Typography variant="caption" sx={{ color: "#22c55e", fontWeight: 700, fontSize: { xs: "0.7rem", sm: "0.78rem" } }}>
                  This Month Paid
                </Typography>
                <Box
                  sx={{
                    width: { xs: 26, sm: 32 },
                    height: { xs: 26, sm: 32 },
                    borderRadius: 1.5,
                    backgroundColor: "rgba(34, 197, 94, 0.15)",
                    color: "#22c55e",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IndianRupee size={16} />
                </Box>
              </Box>
              <Typography
                variant="h4"
                noWrap
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: "1.2rem", sm: "1.7rem" },
                  color: "#22c55e",
                  lineHeight: 1.1,
                }}
              >
                {formatCurrency(data?.currentMonthCollection ?? 0)}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", fontSize: { xs: "0.68rem", sm: "0.75rem" }, mt: 0.4, display: "block" }}>
                {data?.paidCustomersCount ?? 0} Paid in {formatMonthYear(selectedMonth)}
              </Typography>
            </Card>

            {/* Card 3: This Month Not Paid Count */}
            <Card
              sx={{
                p: { xs: 1.2, sm: 1.8 },
                borderRadius: 2,
                backgroundColor: "background.paper",
                border: "1px solid",
                borderColor: (data?.thisMonthNotPaidCount ?? 0) > 0 ? "rgba(239, 68, 68, 0.3)" : "divider",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(239, 68, 68, 0.08)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.8 }}>
                <Typography variant="caption" sx={{ color: "#ef4444", fontWeight: 700, fontSize: { xs: "0.7rem", sm: "0.78rem" } }}>
                  This Month Not Paid
                </Typography>
                <Box
                  sx={{
                    width: { xs: 26, sm: 32 },
                    height: { xs: 26, sm: 32 },
                    borderRadius: 1.5,
                    backgroundColor: "rgba(239, 68, 68, 0.15)",
                    color: "#ef4444",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AlertCircle size={16} />
                </Box>
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: "1.3rem", sm: "1.7rem" },
                  color: (data?.thisMonthNotPaidCount ?? 0) > 0 ? "#ef4444" : "text.primary",
                  lineHeight: 1.1,
                }}
              >
                {data?.thisMonthNotPaidCount ?? 0}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", fontSize: { xs: "0.68rem", sm: "0.75rem" }, mt: 0.4, display: "block" }}>
                Unpaid / Pending Customers
              </Typography>
            </Card>

            {/* Card 4: One Year Collection */}
            <Card
              sx={{
                p: { xs: 1.2, sm: 1.8 },
                borderRadius: 2,
                backgroundColor: "background.paper",
                border: "1px solid",
                borderColor: "rgba(59, 130, 246, 0.3)",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(59, 130, 246, 0.08)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.8 }}>
                <Typography variant="caption" sx={{ color: "#3b82f6", fontWeight: 700, fontSize: { xs: "0.7rem", sm: "0.78rem" } }}>
                  1 Year Total
                </Typography>
                <Box
                  sx={{
                    width: { xs: 26, sm: 32 },
                    height: { xs: 26, sm: 32 },
                    borderRadius: 1.5,
                    backgroundColor: "rgba(59, 130, 246, 0.15)",
                    color: "#3b82f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Calendar size={16} />
                </Box>
              </Box>
              <Typography
                variant="h4"
                noWrap
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: "1.2rem", sm: "1.7rem" },
                  color: "#3b82f6",
                  lineHeight: 1.1,
                }}
              >
                {formatCurrency(data?.oneYearCollection ?? 0)}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", fontSize: { xs: "0.68rem", sm: "0.75rem" }, mt: 0.4, display: "block" }}>
                Total Collected in {selectedYear}
              </Typography>
            </Card>
          </Box>

          {/* Unpaid Customers Section */}
          <Card
            sx={{
              p: { xs: 1.2, sm: 2 },
              borderRadius: 2,
              backgroundColor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              display: "flex",
              flexDirection: "column",
            }}
          >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                  <AlertCircle size={18} style={{ color: "#ef4444" }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: { xs: "0.88rem", sm: "1rem" } }}>
                    Unpaid Customers ({filteredUnpaid.length})
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, fontSize: "0.75rem" }}>
                  {formatMonthYear(selectedMonth)}
                </Typography>
              </Box>

              {/* Search input for unpaid customers */}
              <TextField
                size="small"
                fullWidth
                placeholder="Search unpaid customer..."
                value={unpaidSearch}
                onChange={(e) => setUnpaidSearch(e.target.value)}
                sx={{
                  mb: 1.5,
                  "& .MuiInputBase-root": {
                    height: 32,
                    fontSize: "0.8rem",
                    borderRadius: 1.5,
                  },
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start" sx={{ mr: 0.5 }}>
                        <Search size={14} style={{ color: "#9ca3af" }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {/* Customers List */}
              <Box sx={{ flex: 1, maxHeight: 460, overflowY: "auto", pr: 0.5 }}>
                {filteredUnpaid.length === 0 ? (
                  <Box
                    sx={{
                      py: 6,
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <CheckCircle2 size={36} style={{ color: "#22c55e" }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "text.secondary" }}>
                      All customers have paid for {formatMonthYear(selectedMonth)}!
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
                    {paginatedUnpaid.map((cust) => {
                      const isPending = cust.status === "PENDING";

                      return (
                        <Box
                          key={cust._id}
                          sx={{
                            p: { xs: 0.8, sm: 1.2 },
                            borderRadius: 1.5,
                            backgroundColor: "action.hover",
                            border: "1px solid",
                            borderColor: isPending ? "rgba(239, 68, 68, 0.3)" : "divider",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1,
                          }}
                        >
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography
                              variant="body2"
                              noWrap
                              sx={{
                                fontWeight: 800,
                                fontSize: { xs: "0.82rem", sm: "0.9rem" },
                                color: "text.primary",
                              }}
                            >
                              {cust.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              noWrap
                              sx={{
                                color: "text.secondary",
                                fontWeight: 600,
                                fontSize: { xs: "0.7rem", sm: "0.75rem" },
                                display: "block",
                              }}
                            >
                              {cust.mobile}
                            </Typography>
                          </Box>

                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, flexShrink: 0 }}>
                            {isPending ? (
                              <Box
                                sx={{
                                  px: 0.8,
                                  py: 0.2,
                                  borderRadius: 1,
                                  backgroundColor: "rgba(239, 68, 68, 0.15)",
                                  color: "#ef4444",
                                  fontSize: "0.7rem",
                                  fontWeight: 800,
                                }}
                              >
                                {cust.amount > 0 ? formatCurrency(cust.amount) : "PENDING"}
                              </Box>
                            ) : (
                              <Box
                                sx={{
                                  px: 0.8,
                                  py: 0.2,
                                  borderRadius: 1,
                                  backgroundColor: "rgba(156, 163, 175, 0.15)",
                                  color: "text.secondary",
                                  fontSize: "0.7rem",
                                  fontWeight: 700,
                                }}
                              >
                                NO ENTRY
                              </Box>
                            )}

                            {/* Call Icon Button */}
                            <IconButton
                              component="a"
                              href={`tel:${cust.mobile}`}
                              title={`Call ${cust.name}`}
                              size="small"
                              sx={{
                                width: { xs: 30, sm: 34 },
                                height: { xs: 30, sm: 34 },
                                borderRadius: 1.5,
                                backgroundColor: "rgba(59, 130, 246, 0.12)",
                                color: "#3b82f6",
                                border: "1px solid rgba(59, 130, 246, 0.25)",
                                transition: "all 0.15s ease",
                                "&:hover": {
                                  backgroundColor: "rgba(59, 130, 246, 0.25)",
                                  transform: "scale(1.05)",
                                },
                              }}
                            >
                              <Phone size={15} />
                            </IconButton>

                            {/* WhatsApp Forward Bill Button */}
                            <IconButton
                              onClick={() => setWhatsAppModalCust(cust)}
                              title={`Send bill to ${cust.name} on WhatsApp`}
                              size="small"
                              sx={{
                                width: { xs: 30, sm: 34 },
                                height: { xs: 30, sm: 34 },
                                borderRadius: 1.5,
                                backgroundColor: "rgba(37, 211, 102, 0.12)",
                                color: "#25D366",
                                border: "1px solid rgba(37, 211, 102, 0.25)",
                                transition: "all 0.15s ease",
                                "&:hover": {
                                  backgroundColor: "rgba(37, 211, 102, 0.25)",
                                  transform: "scale(1.05)",
                                },
                              }}
                            >
                              <WhatsAppIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Box>

              {/* Pagination with Rows per page */}
              {filteredUnpaid.length > 0 && (
                <TablePagination
                  component="div"
                  count={filteredUnpaid.length}
                  page={page}
                  onPageChange={(_e, newPage) => setPage(newPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  labelRowsPerPage="Rows per page:"
                  sx={{
                    borderTop: "1px solid",
                    borderColor: "divider",
                    mt: 1,
                    "& .MuiTablePagination-toolbar": {
                      px: { xs: 0.5, sm: 1 },
                      minHeight: 40,
                      flexWrap: "wrap",
                      justifyContent: { xs: "center", sm: "space-between" },
                    },
                    "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                      fontSize: { xs: "0.72rem", sm: "0.8rem" },
                      m: 0,
                    },
                    "& .MuiTablePagination-select": {
                      fontSize: { xs: "0.72rem", sm: "0.8rem" },
                      py: 0.2,
                    },
                    "& .MuiTablePagination-actions": {
                      ml: { xs: 0.5, sm: 1 },
                    },
                  }}
                />
              )}
            </Card>
        </>
      )}

      {/* WhatsApp Bill Reminder Modal */}
      <WhatsAppReminderModal
        open={Boolean(whatsAppModalCust)}
        onClose={() => setWhatsAppModalCust(null)}
        customer={whatsAppModalCust}
        month={selectedMonth}
      />
    </Box>
  );
};

export default Dashboard;
