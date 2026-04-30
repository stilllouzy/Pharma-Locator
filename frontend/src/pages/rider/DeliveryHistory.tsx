import { Box, Typography, Card, CardContent } from "@mui/material";

export default function DeliveryHistory() {
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 24, fontWeight: "bold" }}>
          Delivery History
        </Typography>
        <Typography variant="caption" color="gray">
          Completed and cancelled deliveries
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography color="gray">No delivery history yet.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}