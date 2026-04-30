import { Box, Typography, Card, CardContent } from "@mui/material";

export default function DeliveryDetails() {
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 24, fontWeight: "bold" }}>
          Delivery Details
        </Typography>
        <Typography variant="caption" color="gray">
          Full order and customer information
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography color="gray">Delivery details coming soon.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}