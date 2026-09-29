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
  IconButton,
  InputAdornment,
  Chip,
} from "@mui/material";
import { X, IndianRupee, User as UserIcon, Phone, Building } from "lucide-react";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { useAuth } from "../context/AuthContext";

export interface WhatsAppReminderCustomer {
  _id: string;
  name: string;
  mobile: string;
  amount?: number;
}

interface WhatsAppReminderModalProps {
  open: boolean;
  onClose: () => void;
  customer: WhatsAppReminderCustomer | null;
  month?: string;
}

export const WhatsAppReminderModal: React.FC<WhatsAppReminderModalProps> = ({
  open,
  onClose,
  customer,
}) => {
  const { user } = useAuth();

  const [pendingAmount, setPendingAmount] = useState<string>("");
  const [language, setLanguage] = useState<"tamil" | "english">("tamil");
  const [message, setMessage] = useState<string>("");

  const projectName = user?.companyName || "LOKI";
  const adminName = user?.name || "Administrator";
  const adminMobile = user?.mobile || "";
  const adminEmail = user?.email || "";

  // Initialize or reset pending amount when modal opens with a customer
  useEffect(() => {
    if (open && customer) {
      const initialAmount = customer.amount && customer.amount > 0 ? String(customer.amount) : "300";
      setPendingAmount(initialAmount);
      generateTemplate(initialAmount, language);
    }
  }, [open, customer]);

  // Generate template message in Tamil or English
  const generateTemplate = (amt: string, lang: "tamil" | "english") => {
    if (!customer) return;

    const displayAmount = amt.trim() ? amt.trim() : "0";

    if (lang === "tamil") {
      const tamilMsg = `வணக்கம் ${customer.name},

*${projectName}* கேபிள் டிவி சேவை.

தங்களின் கேபிள் டிவி சந்தா நிலுவை பாக்கி தொகை: *₹${displayAmount}*.

தயவுசெய்து இத்தொகையை விரைவில் செலுத்துமாறு கேட்டுக்கொள்கிறோம்.

நன்றி & வாழ்த்துகள்,
*${adminName}*
${projectName}
${adminMobile ? `தொடர்புக்கு: ${adminMobile}` : ""}${adminEmail ? `\nமின்னஞ்சல்: ${adminEmail}` : ""}`.trim();
      setMessage(tamilMsg);
    } else {
      const engMsg = `Hello ${customer.name},

Greetings from *${projectName}* Cable TV.

Your Cable TV subscription pending balance amount is *₹${displayAmount}*.

Kindly make the payment at your earliest convenience.

Thanks & Regards,
*${adminName}*
${projectName}
${adminMobile ? `Contact: ${adminMobile}` : ""}${adminEmail ? `\nEmail: ${adminEmail}` : ""}`.trim();
      setMessage(engMsg);
    }
  };

  const handleAmountChange = (newAmt: string) => {
    const clean = newAmt.replace(/\D/g, "");
    setPendingAmount(clean);
    generateTemplate(clean, language);
  };

  const handleLanguageChange = (lang: "tamil" | "english") => {
    setLanguage(lang);
    generateTemplate(pendingAmount, lang);
  };

  const handleSend = () => {
    if (!customer?.mobile) return;
    const cleanMobile = customer.mobile.replace(/\D/g, "");
    const phone = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    onClose();
  };

  if (!customer) return null;

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
            maxWidth: "480px !important",
            p: 0,
            backgroundColor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 14px 40px rgba(0,0,0,0.5)",
          },
        },
      }}
    >
      {/* Modal Header */}
      <DialogTitle
        sx={{
          pb: 1,
          pt: 2,
          px: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: "rgba(37, 211, 102, 0.15)",
              color: "#25D366",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <WhatsAppIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              WhatsApp Bill Reminder
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.72rem" }}>
              Send balance reminder to {customer.name}
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}>
          <X size={18} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: { xs: 2, sm: 2.5 }, py: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Customer & Sender Summary Card */}
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            backgroundColor: "action.hover",
            border: "1px solid",
            borderColor: "divider",
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 1.2,
          }}
        >
          {/* Customer Column */}
          <Box>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, textTransform: "uppercase", fontSize: "0.65rem", display: "block", mb: 0.4 }}>
              Customer Details
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
              <UserIcon size={14} style={{ color: "#0d9488" }} />
              <Typography variant="body2" sx={{ fontWeight: 800, fontSize: "0.85rem" }}>
                {customer.name}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mt: 0.2 }}>
              <Phone size={13} style={{ color: "#9ca3af" }} />
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                {customer.mobile}
              </Typography>
            </Box>
          </Box>

          {/* Sourced Sender / Business Details */}
          <Box>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, textTransform: "uppercase", fontSize: "0.65rem", display: "block", mb: 0.4 }}>
              From (Database Profile)
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
              <Building size={14} style={{ color: "#6366f1" }} />
              <Typography variant="body2" sx={{ fontWeight: 800, fontSize: "0.85rem", color: "primary.main" }}>
                {projectName}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mt: 0.2 }}>
              <UserIcon size={13} style={{ color: "#9ca3af" }} />
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                {adminName} {adminMobile ? `(${adminMobile})` : ""}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Amount Input */}
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: "text.primary", display: "block", mb: 0.6 }}>
            Enter Pending Bill Amount
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Enter pending amount (e.g. 300)"
            value={pendingAmount}
            onChange={(e) => handleAmountChange(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <IndianRupee size={16} style={{ color: "#ef4444" }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              "& .MuiInputBase-root": {
                fontWeight: 800,
                fontSize: "1rem",
                borderRadius: 1.5,
              },
            }}
          />
        </Box>

        {/* Language Selection Chips */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
            Message Language:
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Chip
              label="தமிழ் (Default Tamil)"
              size="small"
              onClick={() => handleLanguageChange("tamil")}
              color={language === "tamil" ? "success" : "default"}
              variant={language === "tamil" ? "filled" : "outlined"}
              sx={{ fontWeight: 700, fontSize: "0.75rem", cursor: "pointer" }}
            />
            <Chip
              label="English"
              size="small"
              onClick={() => handleLanguageChange("english")}
              color={language === "english" ? "primary" : "default"}
              variant={language === "english" ? "filled" : "outlined"}
              sx={{ fontWeight: 700, fontSize: "0.75rem", cursor: "pointer" }}
            />
          </Box>
        </Box>

        {/* Message Preview & Edit */}
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", display: "block", mb: 0.6 }}>
            WhatsApp Message Preview (Editable)
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={7}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{
              "& .MuiInputBase-root": {
                fontSize: "0.82rem",
                lineHeight: 1.6,
                borderRadius: 1.5,
                backgroundColor: (theme) => (theme.palette.mode === "dark" ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0.03)"),
                fontFamily: "inherit",
              },
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 2.5,
          py: 1.5,
          borderTop: "1px solid",
          borderColor: "divider",
          justifyContent: "space-between",
        }}
      >
        <Button variant="outlined" color="inherit" size="small" onClick={onClose} sx={{ fontWeight: 700, borderRadius: 1.5 }}>
          Cancel
        </Button>

        <Button
          variant="contained"
          size="small"
          onClick={handleSend}
          startIcon={<WhatsAppIcon />}
          sx={{
            backgroundColor: "#25D366",
            color: "#ffffff",
            fontWeight: 800,
            borderRadius: 1.5,
            px: 2,
            py: 0.8,
            "&:hover": {
              backgroundColor: "#20bd5a",
            },
          }}
        >
          Send on WhatsApp
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WhatsAppReminderModal;
