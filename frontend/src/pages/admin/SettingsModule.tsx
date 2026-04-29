import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  TextField,
  Button,
  Divider,
} from "@mui/material";
import { useState } from "react";

export default function SettingsModule() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [allowRegistration, setAllowRegistration] = useState(true);

  return (
    <Box sx={{ p: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>

      {/* HEADER */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 24, fontWeight: "bold" }}>
          System Settings
        </Typography>
        <Typography variant="caption" color="gray">
          Manage system configuration and preferences
        </Typography>
      </Box>

      {/* GRID LAYOUT */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr",
          },
          gap: 2,
        }}
      >

        {/* 👤 PROFILE SETTINGS */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography sx={{ fontWeight: "bold", mb: 1 }}>
              Profile Settings
            </Typography>

            <TextField
              fullWidth
              label="Admin Name"
              size="small"
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Email"
              size="small"
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="New Password"
              type="password"
              size="small"
            />

            <Button variant="contained" sx={{ mt: 2 }}>
              Update Profile
            </Button>
          </CardContent>
        </Card>

        {/* 🔐 SECURITY SETTINGS */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography sx={{ fontWeight: "bold", mb: 1 }}>
              Security Settings
            </Typography>

            <Typography variant="body2">Enable Email Notifications</Typography>
            <Switch
              checked={emailNotif}
              onChange={() => setEmailNotif(!emailNotif)}
            />

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2">Allow User Registration</Typography>
            <Switch
              checked={allowRegistration}
              onChange={() => setAllowRegistration(!allowRegistration)}
            />
          </CardContent>
        </Card>

        {/* ⚙️ SYSTEM CONTROL */}
        <Card sx={{ borderRadius: 3, gridColumn: "span 2" }}>
          <CardContent>

            <Typography sx={{ fontWeight: "bold", mb: 1 }}>
              System Control
            </Typography>

            <Typography variant="body2">
              Maintenance Mode (Disable system access for users)
            </Typography>

            <Switch
              checked={maintenanceMode}
              onChange={() => setMaintenanceMode(!maintenanceMode)}
            />

            <Divider sx={{ my: 2 }} />

            <Button
              variant="contained"
              color="error"
            >
              Logout All Users
            </Button>

          </CardContent>
        </Card>

      </Box>
    </Box>
  );
}