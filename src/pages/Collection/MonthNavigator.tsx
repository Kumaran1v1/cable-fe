import React from "react";
import { Box, Typography, IconButton, Tooltip, Chip } from "@mui/material";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import {
  formatMonthYear,
  getCurrentMonthString,
  getOffsetMonthString,
} from "../../utils/format";

interface MonthNavigatorProps {
  selectedMonth: string; // YYYY-MM
  onChangeMonth: (newMonth: string) => void;
  size?: "small" | "medium";
}

export const MonthNavigator: React.FC<MonthNavigatorProps> = ({
  selectedMonth,
  onChangeMonth,
  size = "medium",
}) => {
  const currentMonth = getCurrentMonthString();
  const isCurrent = selectedMonth === currentMonth;
  const isFuture = selectedMonth >= currentMonth;

  const handlePrev = () => {
    const prev = getOffsetMonthString(selectedMonth, -1);
    onChangeMonth(prev);
  };

  const handleNext = () => {
    if (isFuture) return;
    const next = getOffsetMonthString(selectedMonth, 1);
    if (next <= currentMonth) {
      onChangeMonth(next);
    }
  };

  const handleResetCurrent = () => {
    onChangeMonth(currentMonth);
  };

  const formattedMonth = formatMonthYear(selectedMonth);

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: { xs: 0.5, sm: 1 },
        px: { xs: 1.5, sm: 2 },
        py: size === "small" ? 0.6 : 0.9,
        borderRadius: 3,
        backgroundColor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: (theme) =>
          theme.palette.mode === "dark"
            ? "0 4px 12px rgba(0,0,0,0.3)"
            : "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      {/* Previous Month Button */}
      <Tooltip title="Previous Month" arrow>
        <IconButton
          size="small"
          onClick={handlePrev}
          sx={{
            color: "text.primary",
            "&:hover": {
              backgroundColor: "action.hover",
              color: "primary.main",
            },
          }}
          aria-label="Previous month"
        >
          <ChevronLeft size={20} />
        </IconButton>
      </Tooltip>

      {/* Selected Month Display */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          minWidth: { xs: 140, sm: 170 },
          justifyContent: "center",
          userSelect: "none",
        }}
      >
        <Calendar size={17} style={{ color: "#0d9488" }} />
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            fontSize: size === "small" ? "0.9rem" : "1rem",
            letterSpacing: "-0.01em",
          }}
        >
          {formattedMonth}
        </Typography>

        {isCurrent ? (
          <Chip
            label="Current"
            size="small"
            color="primary"
            variant="outlined"
            sx={{
              height: 20,
              fontSize: "0.65rem",
              fontWeight: 700,
              borderRadius: 1,
              borderColor: "primary.main",
              display: { xs: "none", sm: "inline-flex" },
            }}
          />
        ) : (
          <Tooltip title="Jump to Current Month" arrow>
            <Chip
              label="Today"
              size="small"
              onClick={handleResetCurrent}
              clickable
              sx={{
                height: 20,
                fontSize: "0.65rem",
                fontWeight: 600,
                borderRadius: 1,
                cursor: "pointer",
                display: { xs: "none", sm: "inline-flex" },
              }}
            />
          </Tooltip>
        )}
      </Box>

      {/* Next Month Button (Disabled for future months) */}
      <Tooltip
        title={
          isFuture
            ? "Future months cannot be selected"
            : "Next Month"
        }
        arrow
      >
        <span>
          <IconButton
            size="small"
            onClick={handleNext}
            disabled={isFuture}
            sx={{
              color: isFuture ? "text.disabled" : "text.primary",
              "&:hover": {
                backgroundColor: isFuture ? "transparent" : "action.hover",
                color: isFuture ? "text.disabled" : "primary.main",
              },
            }}
            aria-label="Next month"
          >
            <ChevronRight size={20} />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
};

export default MonthNavigator;
