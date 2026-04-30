import { Box, Typography, Card, CardContent } from "@mui/material";

export default function MyDeliveries() {
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 24, fontWeight: "bold" }}>
          My Deliveries
        </Typography>
        <Typography variant="caption" color="gray">
          Active and ongoing deliveries
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography color="gray">No active deliveries yet.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}