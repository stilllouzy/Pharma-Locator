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
import { useEffect, useState } from "react";
import api from "../../api/api";

export default function SettingsModule() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    password: "",
  });

  const token = localStorage.getItem("token");

  // FETCH ADMIN PROFILE
  const fetchProfile = async () => {
    try {
      const res = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile({
        name: res.data.name,
        email: res.data.email,
        password: "",
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // UPDATE ADMIN PROFILE
  const handleUpdateProfile = async () => {
    try {
      const updateData: any = {
        name: profile.name,
        email: profile.email,
      };

      if (profile.password) {
        updateData.password = profile.password;
      }

      await api.put("/auth/me", updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Profile updated successfully!");
      setProfile({ ...profile, password: "" });
    } catch (error) {
      console.error(error);
      alert("Failed to update profile.");
    }
  };

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

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2,
        }}
      >

        {/* 👤 PROFILE SETTINGS */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography sx={{ fontWeight: "bold", mb: 2 }}>
              Profile Settings
            </Typography>

            <TextField
              fullWidth
              label="Admin Name"
              size="small"
              sx={{ mb: 2 }}
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />

            <TextField
              fullWidth
              label="Email"
              size="small"
              sx={{ mb: 2 }}
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            />

            <TextField
              fullWidth
              label="New Password"
              type="password"
              size="small"
              placeholder="Leave blank to keep current"
              value={profile.password}
              onChange={(e) => setProfile({ ...profile, password: e.target.value })}
            />

            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={handleUpdateProfile}
            >
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

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="body2">Enable Email Notifications</Typography>
              <Switch
                checked={emailNotif}
                onChange={() => setEmailNotif(!emailNotif)}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="body2">Allow User Registration</Typography>
              <Switch
                checked={allowRegistration}
                onChange={() => setAllowRegistration(!allowRegistration)}
              />
            </Box>
          </CardContent>
        </Card>

        {/* ⚙️ SYSTEM CONTROL */}
        <Card sx={{ borderRadius: 3, gridColumn: { md: "span 2" } }}>
          <CardContent>
            <Typography sx={{ fontWeight: "bold", mb: 1 }}>
              System Control
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="body2">Maintenance Mode</Typography>
                <Typography variant="caption" color="gray">
                  Disable system access for users
                </Typography>
              </Box>
              <Switch
                checked={maintenanceMode}
                onChange={() => setMaintenanceMode(!maintenanceMode)}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Button variant="contained" color="error">
              Logout All Users
            </Button>

          </CardContent>
        </Card>

      </Box>
    </Box>
  );
}