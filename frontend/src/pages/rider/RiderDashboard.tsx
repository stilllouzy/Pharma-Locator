import { Box, Typography, Card, CardContent } from "@mui/material";

export default function RiderDashboard() {
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 24, fontWeight: "bold" }}>
          Rider Dashboard
        </Typography>
        <Typography variant="caption" color="gray">
          Overview of your deliveries
        </Typography>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="caption" color="gray">Assigned</Typography>
            <Typography sx={{ fontSize: 28, fontWeight: "bold" }}>0</Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="caption" color="gray">Completed Today</Typography>
            <Typography sx={{ fontSize: 28, fontWeight: "bold" }}>0</Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="caption" color="gray">Cancelled</Typography>
            <Typography sx={{ fontSize: 28, fontWeight: "bold" }}>0</Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}