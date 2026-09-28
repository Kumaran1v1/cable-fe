import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { LayoutDashboard } from "lucide-react";

export const Dashboard: React.FC = () => {
  return (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <LayoutDashboard size={24} style={{ color: "#0d9488" }} />
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Welcome to the management console.
        </Typography>
      </Box>

      <Card sx={{ minHeight: "350px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CardContent sx={{ textAlign: "center", py: 5 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Empty page ready for metrics and statistics widgets.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
