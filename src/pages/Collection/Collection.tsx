import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { CreditCard } from "lucide-react";

export const Collection: React.FC = () => {
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
          <CreditCard size={24} style={{ color: "#0d9488" }} />
          Collection
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Payment and collections tracking module.
        </Typography>
      </Box>

      <Card sx={{ minHeight: "350px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CardContent sx={{ textAlign: "center", py: 5 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Collection
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Empty page ready for payment collections, records, and reports.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Collection;
