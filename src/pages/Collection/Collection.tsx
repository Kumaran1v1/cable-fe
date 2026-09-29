import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Layers,
} from "lucide-react";
import type { GridCustomer, MonthlyEntry } from "../../types/collection.types";
import { collectionService } from "../../services/collection.service";
import { formatCurrency } from "../../utils/format";
import CreateCustomerModal from "./CreateCustomerModal";
import EditCustomerModal from "./EditCustomerModal";
import MonthlyEntryModal from "./MonthlyEntryModal";

const MONTH_NAMES = [
  { num: "01", short: "JAN", name: "January" },
  { num: "02", short: "FEB", name: "February" },
  { num: "03", short: "MAR", name: "March" },
  { num: "04", short: "APR", name: "April" },
  { num: "05", short: "MAY", name: "May" },
  { num: "06", short: "JUN", name: "June" },
  { num: "07", short: "JUL", name: "July" },
  { num: "08", short: "AUG", name: "August" },
  { num: "09", short: "SEP", name: "September" },
  { num: "10", short: "OCT", name: "October" },
  { num: "11", short: "NOV", name: "November" },
  { num: "12", short: "DEC", name: "December" },
];

export const Collection: React.FC = () => {
  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const currentSystemDate = new Date();
  const currentYear = currentSystemDate.getFullYear().toString();
  const currentMonthNum = String(currentSystemDate.getMonth() + 1).padStart(2, "0");
  const currentYearMonth = `${currentYear}-${currentMonthNum}`;

  const [selectedYear, setSelectedYear] = useState<string>(currentYear);
  const [customers, setCustomers] = useState<GridCustomer[]>([]);
  const [monthSummaries, setMonthSummaries] = useState<
    Record<string, { totalAmount: number; totalPaid: number; totalPending: number }>
  >({});
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "paid">("all");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active cell state for keyboard / click selection highlight
  const [activeCellKey, setActiveCellKey] = useState<string | null>(null);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [editCustomer, setEditCustomer] = useState<GridCustomer | null>(null);
  const [entryModalState, setEntryModalState] = useState<{
    open: boolean;
    customerId: string;
    customerName: string;
    customerMobile: string;
    month: string;
    existingEntry: MonthlyEntry | null;
  }>({
    open: false,
    customerId: "",
    customerName: "",
    customerMobile: "",
    month: "",
    existingEntry: null,
  });

  // Fetch full 12-month grid data for the selected year
  const fetchGridData = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await collectionService.getYearGrid(selectedYear, searchQuery);
      setCustomers(res.data || []);
      setMonthSummaries(res.monthSummaries || {});
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || err?.message || "Failed to load collection grid");
    } finally {
      setLoading(false);
    }
  }, [selectedYear, searchQuery]);

  useEffect(() => {
    fetchGridData();
  }, [fetchGridData]);

  // Auto-scroll table horizontally to current month on mobile
  useEffect(() => {
    if (selectedYear === currentYear && tableContainerRef.current) {
      const monthIndex = parseInt(currentMonthNum, 10) - 1; // 0-based
      if (monthIndex > 1) {
        const isMobile = window.innerWidth < 600;
        const colWidth = isMobile ? 62 : 80;
        // Scroll so current month is visible
        tableContainerRef.current.scrollLeft = Math.max(0, (monthIndex - (isMobile ? 2 : 3)) * colWidth);
      }
    }
  }, [selectedYear, currentYear, currentMonthNum, customers.length]);

  // Year navigation
  const handlePrevYear = () => {
    const prev = (parseInt(selectedYear, 10) - 1).toString();
    setSelectedYear(prev);
  };

  const handleNextYear = () => {
    const nextNum = parseInt(selectedYear, 10) + 1;
    if (nextNum > parseInt(currentYear, 10)) return; // Don't allow future years
    setSelectedYear(nextNum.toString());
  };

  // Open entry modal on cell click
  const handleCellClick = (customer: GridCustomer, monthStr: string) => {
    // Check if future month
    if (monthStr > currentYearMonth) {
      // Future month restriction
      return;
    }

    setActiveCellKey(`${customer._id}_${monthStr}`);
    const existing = customer.entries?.[monthStr] || null;

    setEntryModalState({
      open: true,
      customerId: customer._id,
      customerName: customer.name,
      customerMobile: customer.mobile,
      month: monthStr,
      existingEntry: existing,
    });
  };

  // Active month used to evaluate Paid vs Pending status
  const activeMonthKey = useMemo(() => {
    return selectedYear === currentYear ? currentYearMonth : `${selectedYear}-12`;
  }, [selectedYear, currentYear, currentYearMonth]);

  // Counts for each status category
  const statusCounts = useMemo(() => {
    let paid = 0;
    let pending = 0;
    customers.forEach((c) => {
      const isPaid = c.entries?.[activeMonthKey]?.paymentStatus === "PAID";
      if (isPaid) {
        paid++;
      } else {
        pending++;
      }
    });
    return { all: customers.length, paid, pending };
  }, [customers, activeMonthKey]);

  // Filtered customer list by search query and status filter
  const filteredCustomers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return customers.filter((c) => {
      // 1. Text search match
      if (q) {
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesMobile = c.mobile.includes(q);
        if (!matchesName && !matchesMobile) return false;
      }

      // 2. Status dropdown filter
      if (statusFilter === "all") return true;
      const isPaid = c.entries?.[activeMonthKey]?.paymentStatus === "PAID";
      if (statusFilter === "paid") return isPaid;
      if (statusFilter === "pending") return !isPaid;

      return true;
    });
  }, [customers, searchQuery, statusFilter, activeMonthKey]);

  return (
    <Box
      sx={{
        p: { xs: 0.4, sm: 1.5 },
        pt: { xs: 0.2, sm: 1 },
        height: { xs: "calc(100vh - 66px)", sm: "calc(100vh - 75px)" },
        display: "flex",
        flexDirection: "column",
        gap: { xs: 0.6, sm: 1.2 },
        backgroundColor: "background.default",
      }}
    >
      {/* Top Toolbar Bar */}
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
        <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 0.8, sm: 1.2 } }}>
          {/* Top Row: Title, Year Picker & Create Button strictly in ONE single row */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "nowrap !important",
              gap: { xs: 0.5, sm: 1 },
              width: "100%",
            }}
          >
            {/* 1. Title & Brand Icon */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, flexShrink: 0, minWidth: 0 }}>
              <Layers size={16} style={{ color: "#0d9488", flexShrink: 0 }} />
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "0.82rem", sm: "1.05rem" },
                  letterSpacing: "-0.01em",
                  lineHeight: 1.2,
                }}
              >
                <Box component="span" sx={{ display: { xs: "none", md: "inline" } }}>
                  Monthly{" "}
                </Box>
                Collection
              </Typography>
            </Box>

            {/* Controls: Year Picker + Create Customer Button on same row */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                flexWrap: "nowrap !important",
                gap: { xs: 0.5, sm: 1 },
                flexShrink: 0,
              }}
            >
              {/* 2. Year Selector */}
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.1,
                  px: { xs: 0.3, sm: 0.5 },
                  py: 0.1,
                  borderRadius: 1.5,
                  backgroundColor: "action.hover",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <IconButton
                  size="small"
                  onClick={handlePrevYear}
                  sx={{ color: "text.primary", p: { xs: 0.2, sm: 0.4 } }}
                >
                  <ChevronLeft size={14} />
                </IconButton>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 800,
                    minWidth: { xs: 32, sm: 42 },
                    textAlign: "center",
                    fontSize: { xs: "0.75rem", sm: "0.85rem" },
                    lineHeight: 1,
                  }}
                >
                  {selectedYear}
                </Typography>
                <IconButton
                  size="small"
                  onClick={handleNextYear}
                  disabled={parseInt(selectedYear, 10) >= parseInt(currentYear, 10)}
                  sx={{
                    color:
                      parseInt(selectedYear, 10) >= parseInt(currentYear, 10)
                        ? "text.disabled"
                        : "text.primary",
                    p: { xs: 0.2, sm: 0.4 },
                  }}
                >
                  <ChevronRight size={14} />
                </IconButton>
              </Box>

              {/* 3. Create Customer Button */}
              <Button
                variant="contained"
                size="small"
                startIcon={<Plus size={13} />}
                onClick={() => setCreateModalOpen(true)}
                sx={{
                  fontWeight: 700,
                  borderRadius: 1.5,
                  px: { xs: 0.8, sm: 1.6 },
                  py: { xs: 0.35, sm: 0.5 },
                  fontSize: { xs: "0.72rem", sm: "0.82rem" },
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  boxShadow: "0 2px 8px rgba(13, 148, 136, 0.3)",
                }}
              >
                <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                  Create Customer
                </Box>
                <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
                  Add
                </Box>
              </Button>
            </Box>
          </Box>

          {/* Bottom Row: Compact Search Input, Status Filter Dropdown & Legend */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 0.8, sm: 1.5 },
            }}
          >
            <TextField
              size="small"
              placeholder="Search by name or mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                flex: 1,
                minWidth: 0,
                "& .MuiInputBase-root": {
                  height: { xs: 32, sm: 38 },
                  fontSize: { xs: "0.78rem", sm: "0.875rem" },
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

            {/* Status Filter Dropdown (All, Pending, Paid) */}
            <FormControl size="small" sx={{ minWidth: { xs: 96, sm: 130 }, flexShrink: 0 }}>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | "pending" | "paid")}
                sx={{
                  height: { xs: 32, sm: 38 },
                  fontSize: { xs: "0.75rem", sm: "0.85rem" },
                  fontWeight: 700,
                  borderRadius: 1.5,
                  backgroundColor: "background.paper",
                  "& .MuiSelect-select": {
                    py: { xs: 0.4, sm: 0.8 },
                    px: { xs: 0.8, sm: 1.5 },
                  },
                }}
              >
                <MenuItem value="all" sx={{ fontSize: "0.82rem", fontWeight: 700 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                    <Box sx={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "text.secondary" }} />
                    <span>All ({statusCounts.all})</span>
                  </Box>
                </MenuItem>
                <MenuItem value="pending" sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#ef4444" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                    <Box sx={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#ef4444" }} />
                    <span>Pending ({statusCounts.pending})</span>
                  </Box>
                </MenuItem>
                <MenuItem value="paid" sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#22c55e" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                    <Box sx={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#22c55e" }} />
                    <span>Paid ({statusCounts.paid})</span>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            {/* Badges Legend (Visible on medium+ screens) */}
            <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 2, flexShrink: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                <Box
                  sx={{
                    width: 18,
                    height: 18,
                    borderRadius: "4px",
                    backgroundColor: "#22c55e",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: "0.65rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  P
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
                  PAID
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                <Box
                  sx={{
                    width: 18,
                    height: 18,
                    borderRadius: "4px",
                    backgroundColor: "#ef4444",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: "0.65rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  A
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
                  PENDING
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                <Typography sx={{ fontWeight: 800, color: "text.disabled", fontSize: "0.9rem" }}>-</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
                  No Record
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Card>

      {/* Error alert */}
      {errorMessage && (
        <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      {/* Main Grid Matrix Table */}
      <Card
        sx={{
          flex: 1,
          borderRadius: 2.5,
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: (theme) =>
            theme.palette.mode === "dark" ? "#0b0f19" : "#ffffff",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <CircularProgress size={40} color="primary" />
          </Box>
        ) : (
          <TableContainer
            ref={tableContainerRef}
            sx={{
              height: "100%",
              overflow: "auto",
              "&::-webkit-scrollbar": { width: 6, height: 6 },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(255,255,255,0.15)",
                borderRadius: 4,
              },
            }}
          >
            <Table stickyHeader sx={{ minWidth: { xs: 780, sm: 920, md: 1050 }, borderCollapse: "separate" }}>
              {/* Header Row: Customer column + 12 Month columns */}
              <TableHead>
                <TableRow>
                  {/* Sticky Customer Header */}
                  <TableCell
                    sx={{
                      position: "sticky",
                      left: 0,
                      zIndex: 3,
                      backgroundColor: (theme) =>
                        theme.palette.mode === "dark" ? "#111827" : "#f8fafc",
                      borderRight: "1px solid",
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      minWidth: { xs: 110, sm: 160, md: 200 },
                      maxWidth: { xs: 125, sm: 180, md: 220 },
                      width: { xs: 115, sm: 170, md: 210 },
                      py: { xs: 1, sm: 1.5 },
                      px: { xs: 1, sm: 2 },
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 800,
                        letterSpacing: "0.04em",
                        color: "text.secondary",
                        fontSize: { xs: "0.68rem", sm: "0.75rem" },
                      }}
                    >
                      CUSTOMER ({filteredCustomers.length})
                    </Typography>
                  </TableCell>

                  {/* 12 Month Columns */}
                  {MONTH_NAMES.map((m) => {
                    const mKey = `${selectedYear}-${m.num}`;
                    const isCurrent = mKey === currentYearMonth;
                    const isFuture = mKey > currentYearMonth;

                    return (
                      <TableCell
                        key={m.num}
                        align="center"
                        sx={{
                          zIndex: 2,
                          backgroundColor: (theme) =>
                            theme.palette.mode === "dark" ? "#111827" : "#f8fafc",
                          borderRight: "1px solid",
                          borderBottom: "1px solid",
                          borderColor: "divider",
                          minWidth: { xs: 54, sm: 66, md: 80 },
                          maxWidth: { xs: 62, sm: 76, md: 95 },
                          width: { xs: 58, sm: 70, md: 88 },
                          py: { xs: 0.8, sm: 1.2 },
                          px: { xs: 0.2, sm: 1 },
                          opacity: isFuture ? 0.45 : 1,
                        }}
                      >
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 800,
                              letterSpacing: "0.03em",
                              fontSize: { xs: "0.68rem", sm: "0.75rem" },
                              color: isCurrent ? "primary.main" : "text.secondary",
                            }}
                          >
                            {m.short}
                          </Typography>
                          {isCurrent && (
                            <Box
                              sx={{
                                width: 12,
                                height: 2,
                                borderRadius: 1,
                                backgroundColor: "primary.main",
                                mt: 0.2,
                              }}
                            />
                          )}
                        </Box>
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>

              {/* Body: Customers x 12 Month Cells */}
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} align="center" sx={{ py: 8 }}>
                      <Typography variant="body1" color="text.secondary">
                        No customers found matching your search.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((cust) => (
                    <TableRow key={cust._id}>
                      {/* Sticky Left Customer Cell */}
                      <TableCell
                        sx={{
                          position: "sticky",
                          left: 0,
                          zIndex: 1,
                          backgroundColor: (theme) =>
                            theme.palette.mode === "dark" ? "#0f172a" : "#ffffff",
                          borderRight: "1px solid",
                          borderBottom: "1px solid",
                          borderColor: "divider",
                          py: { xs: 0.8, sm: 1.2 },
                          px: { xs: 1, sm: 2 },
                          minWidth: { xs: 110, sm: 160, md: 200 },
                          maxWidth: { xs: 125, sm: 180, md: 220 },
                          width: { xs: 115, sm: 170, md: 210 },
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <Box sx={{ overflow: "hidden", pr: 0.5, minWidth: 0 }}>
                            <Typography
                              variant="body2"
                              noWrap
                              sx={{
                                fontWeight: 800,
                                color: "text.primary",
                                lineHeight: 1.2,
                                fontSize: { xs: "0.78rem", sm: "0.875rem" },
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
                                display: "block",
                                fontSize: { xs: "0.68rem", sm: "0.75rem" },
                              }}
                            >
                              {cust.mobile}
                            </Typography>
                          </Box>

                          {/* Pencil Edit Icon */}
                          <Tooltip title="Edit Customer" arrow>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditCustomer(cust);
                              }}
                              sx={{
                                color: "text.disabled",
                                p: { xs: 0.3, sm: 0.5 },
                                "&:hover": { color: "primary.main", backgroundColor: "action.hover" },
                              }}
                            >
                              <Edit2 size={13} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>

                      {/* 12 Monthly Entry Cells */}
                      {MONTH_NAMES.map((m) => {
                        const mKey = `${selectedYear}-${m.num}`;
                        const entry = cust.entries?.[mKey] || null;
                        const isCurrent = mKey === currentYearMonth;
                        const isFuture = mKey > currentYearMonth;
                        const cellKey = `${cust._id}_${mKey}`;
                        const isSelectedCell = activeCellKey === cellKey;

                        const isPaid = entry?.paymentStatus === "PAID";

                        return (
                          <TableCell
                            key={m.num}
                            align="center"
                            onClick={() => !isFuture && handleCellClick(cust, mKey)}
                            sx={{
                              borderRight: "1px solid",
                              borderBottom: "1px solid",
                              borderColor: "divider",
                              py: { xs: 0.6, sm: 1 },
                              px: { xs: 0.2, sm: 0.5 },
                              minWidth: { xs: 54, sm: 66, md: 80 },
                              maxWidth: { xs: 62, sm: 76, md: 95 },
                              width: { xs: 58, sm: 70, md: 88 },
                              cursor: isFuture ? "not-allowed" : "pointer",
                              backgroundColor: isSelectedCell
                                ? "rgba(13, 148, 136, 0.18)"
                                : isCurrent
                                ? (theme) =>
                                    theme.palette.mode === "dark"
                                      ? "rgba(13, 148, 136, 0.04)"
                                      : "rgba(13, 148, 136, 0.02)"
                                : "inherit",
                              outline: isSelectedCell ? "1.5px solid #0d9488" : "none",
                              outlineOffset: "-1.5px",
                              transition: "background-color 0.12s ease",
                              "&:hover": {
                                backgroundColor: !isFuture
                                  ? (theme) =>
                                      theme.palette.mode === "dark"
                                        ? "rgba(255, 255, 255, 0.05)"
                                        : "rgba(0, 0, 0, 0.04)"
                                  : "inherit",
                              },
                            }}
                          >
                            {entry ? (
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                {/* Badge P / A */}
                                <Box
                                  sx={{
                                    width: { xs: 22, sm: 28 },
                                    height: { xs: 18, sm: 24 },
                                    borderRadius: { xs: "4px", sm: "6px" },
                                    backgroundColor: isPaid ? "#22c55e" : "#ef4444",
                                    color: "#ffffff",
                                    fontWeight: 800,
                                    fontSize: { xs: "0.68rem", sm: "0.8rem" },
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow: isPaid
                                      ? "0 2px 6px rgba(34, 197, 94, 0.3)"
                                      : "0 2px 6px rgba(239, 68, 68, 0.3)",
                                  }}
                                >
                                  {isPaid ? "P" : "A"}
                                </Box>

                                {/* Amount under badge */}
                                <Typography
                                  variant="caption"
                                  noWrap
                                  sx={{
                                    fontWeight: 800,
                                    color: isPaid ? "#2dd4bf" : "#f87171",
                                    fontSize: { xs: "0.62rem", sm: "0.75rem" },
                                    mt: { xs: 0.2, sm: 0.4 },
                                    lineHeight: 1,
                                    letterSpacing: "-0.01em",
                                  }}
                                >
                                  {formatCurrency(entry.amount)}
                                </Typography>
                              </Box>
                            ) : (
                              /* Empty Cell: Dash '-' */
                              <Typography
                                sx={{
                                  color: isFuture
                                    ? "text.disabled"
                                    : "rgba(255, 255, 255, 0.2)",
                                  fontWeight: 700,
                                  fontSize: { xs: "0.9rem", sm: "1.1rem" },
                                  userSelect: "none",
                                }}
                              >
                                -
                              </Typography>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                )}

                {/* Bottom Row: Month Summaries */}
                {filteredCustomers.length > 0 && (
                  <TableRow>
                    <TableCell
                      sx={{
                        position: "sticky",
                        left: 0,
                        zIndex: 1,
                        backgroundColor: (theme) =>
                          theme.palette.mode === "dark" ? "#111827" : "#f1f5f9",
                        borderRight: "1px solid",
                        borderColor: "divider",
                        py: { xs: 1, sm: 1.5 },
                        px: { xs: 1, sm: 2 },
                        minWidth: { xs: 110, sm: 160, md: 200 },
                        maxWidth: { xs: 125, sm: 180, md: 220 },
                        width: { xs: 115, sm: 170, md: 210 },
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 800,
                          color: "text.primary",
                          fontSize: { xs: "0.65rem", sm: "0.75rem" },
                        }}
                      >
                        TOTAL
                      </Typography>
                    </TableCell>

                    {MONTH_NAMES.map((m) => {
                      const mKey = `${selectedYear}-${m.num}`;
                      const sum = monthSummaries[mKey] || { totalAmount: 0, totalPaid: 0, totalPending: 0 };

                      return (
                        <TableCell
                          key={m.num}
                          align="center"
                          sx={{
                            backgroundColor: (theme) =>
                              theme.palette.mode === "dark" ? "#111827" : "#f1f5f9",
                            borderRight: "1px solid",
                            borderColor: "divider",
                            py: { xs: 0.6, sm: 1 },
                            px: { xs: 0.2, sm: 0.5 },
                            minWidth: { xs: 54, sm: 66, md: 80 },
                            maxWidth: { xs: 62, sm: 76, md: 95 },
                            width: { xs: 58, sm: 70, md: 88 },
                          }}
                        >
                          {sum.totalAmount > 0 ? (
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                              <Typography
                                variant="caption"
                                noWrap
                                sx={{
                                  fontWeight: 800,
                                  color: "#2dd4bf",
                                  fontSize: { xs: "0.62rem", sm: "0.75rem" },
                                }}
                              >
                                {formatCurrency(sum.totalAmount)}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.8rem" }}>
                              -
                            </Typography>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* 1. Monthly Entry Modal (opens on cell click) */}
      <MonthlyEntryModal
        open={entryModalState.open}
        onClose={() => setEntryModalState((prev) => ({ ...prev, open: false }))}
        customerId={entryModalState.customerId}
        customerName={entryModalState.customerName}
        customerMobile={entryModalState.customerMobile}
        month={entryModalState.month}
        existingEntry={entryModalState.existingEntry}
        onSaved={fetchGridData}
      />

      {/* 2. Create Customer Modal */}
      <CreateCustomerModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCustomerCreated={fetchGridData}
      />

      {/* 3. Edit Customer Modal (pencil icon) */}
      <EditCustomerModal
        open={Boolean(editCustomer)}
        onClose={() => setEditCustomer(null)}
        customer={editCustomer}
        onUpdated={fetchGridData}
      />
    </Box>
  );
};

export default Collection;
