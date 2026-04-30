import { Box, Typography, Card } from "@mui/material";

export default function DeliveryMapView() {
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 24, fontWeight: "bold" }}>
          Delivery Map
        </Typography>
        <Typography variant="caption" color="gray">
          Navigate to customer location
        </Typography>
      </Box>

      <Card sx={{ height: "70vh", borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography color="gray">Map coming soon.</Typography>
      </Card>
    </Box>
  );
}