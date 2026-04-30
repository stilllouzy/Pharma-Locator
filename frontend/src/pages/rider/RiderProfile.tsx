import { Box, Typography, Card, CardContent } from "@mui/material";

export default function RiderProfile() {
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 24, fontWeight: "bold" }}>
          Profile
        </Typography>
        <Typography variant="caption" color="gray">
          Your personal information
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography color="gray">Profile details coming soon.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}