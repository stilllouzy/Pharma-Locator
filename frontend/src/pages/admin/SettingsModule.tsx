import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  TextField,
  Button,
  Divider,
  Alert,
  Collapse,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import SecurityIcon from "@mui/icons-material/Security";
import BuildIcon from "@mui/icons-material/Build";
import EmailIcon from "@mui/icons-material/Email";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import LogoutIcon from "@mui/icons-material/Logout";
import SaveIcon from "@mui/icons-material/Save";
import { useEffect, useState } from "react";
import api from "../../api/api";

// ─── Section heading inside a card ───────────────────────────────────────────
function CardSection({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: "10px",
          backgroundColor: "#EEF4FB",
          color: "#0D3B6E",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "text.primary" }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

// ─── Toggle row ───────────────────────────────────────────────────────────────
function ToggleRow({
  icon,
  label,
  description,
  checked,
  onChange,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  checked: boolean;
  onChange: () => void;
  danger?: boolean;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: 1.25,
        gap: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{ color: danger ? "error.main" : "text.secondary", display: "flex" }}>
          {icon}
        </Box>
        <Box>
          <Typography
            variant="body2"
            sx={{ fontWeight: 500, color: danger ? "error.main" : "text.primary" }}
          >
            {label}
          </Typography>
          {description && (
            <Typography variant="caption" color="text.secondary">
              {description}
            </Typography>
          )}
        </Box>
      </Box>
      <Switch
        checked={checked}
        onChange={onChange}
        color={danger ? "error" : "primary"}
        sx={{ flexShrink: 0 }}
      />
    </Box>
  );
}

export default function SettingsModule() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [profile, setProfile] = useState({ name: "", email: "", password: "" });
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("token");

  const fetchProfile = async () => {
    try {
      const res = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile({ name: res.data.name, email: res.data.email, password: "" });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async () => {
    setSaving(true);
    setSaveStatus("idle");
    try {
      const updateData: any = { name: profile.name, email: profile.email };
      if (profile.password) updateData.password = profile.password;

      await api.put("/auth/me", updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSaveStatus("success");
      setProfile({ ...profile, password: "" });
    } catch (error) {
      console.error(error);
      setSaveStatus("error");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveStatus("idle"), 4000);
    }
  };

  return (
    <Box sx={{ p: 3, minHeight: "100vh" }}>

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h2" sx={{ fontSize: "1.4rem", mb: 0.25 }}>
          System Settings
        </Typography>
        <Typography variant="subtitle1" sx={{ fontSize: "0.83rem" }}>
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

        {/* Profile settings */}
        <Card>
          <CardContent sx={{ px: "20px !important", py: "20px !important" }}>
            <CardSection
              icon={<PersonIcon sx={{ fontSize: 18 }} />}
              title="Profile settings"
              subtitle="Update your admin account details"
            />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                fullWidth
                label="Admin name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
              <TextField
                fullWidth
                label="New password"
                type="password"
                placeholder="Leave blank to keep current"
                value={profile.password}
                onChange={(e) => setProfile({ ...profile, password: e.target.value })}
              />
            </Box>

            {/* Inline feedback */}
            <Collapse in={saveStatus !== "idle"}>
              <Alert
                severity={saveStatus === "success" ? "success" : "error"}
                sx={{ mt: 2, borderRadius: "8px", fontSize: "0.82rem" }}
              >
                {saveStatus === "success"
                  ? "Profile updated successfully."
                  : "Failed to update profile. Please try again."}
              </Alert>
            </Collapse>

            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleUpdateProfile}
              disabled={saving}
              sx={{ mt: 2 }}
            >
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </CardContent>
        </Card>

        {/* Security settings */}
        <Card>
          <CardContent sx={{ px: "20px !important", py: "20px !important" }}>
            <CardSection
              icon={<SecurityIcon sx={{ fontSize: 18 }} />}
              title="Security settings"
              subtitle="Control access and notification preferences"
            />

            <ToggleRow
              icon={<EmailIcon sx={{ fontSize: 18 }} />}
              label="Email notifications"
              description="Send system alerts via email"
              checked={emailNotif}
              onChange={() => setEmailNotif(!emailNotif)}
            />
            <Divider />
            <ToggleRow
              icon={<HowToRegIcon sx={{ fontSize: 18 }} />}
              label="Allow user registration"
              description="Let new users create accounts"
              checked={allowRegistration}
              onChange={() => setAllowRegistration(!allowRegistration)}
            />
          </CardContent>
        </Card>

        {/* System control — full width */}
        <Card sx={{ gridColumn: { md: "span 2" } }}>
          <CardContent sx={{ px: "20px !important", py: "20px !important" }}>
            <CardSection
              icon={<BuildIcon sx={{ fontSize: 18 }} />}
              title="System control"
              subtitle="Advanced controls that affect all users"
            />

            <ToggleRow
              icon={<WarningAmberIcon sx={{ fontSize: 18 }} />}
              label="Maintenance mode"
              description="Disables system access for all non-admin users"
              checked={maintenanceMode}
              onChange={() => setMaintenanceMode(!maintenanceMode)}
              danger={maintenanceMode}
            />

            {/* Maintenance warning */}
            <Collapse in={maintenanceMode}>
              <Alert
                severity="warning"
                sx={{ mt: 1, mb: 1.5, borderRadius: "8px", fontSize: "0.82rem" }}
              >
                Maintenance mode is active. Users cannot access the system right now.
              </Alert>
            </Collapse>

            <Divider sx={{ my: 1.5 }} />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Box>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500, color: "error.main" }}
                >
                  Force logout all users
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Immediately ends all active sessions across all roles
                </Typography>
              </Box>
              <Button
                variant="outlined"
                color="error"
                startIcon={<LogoutIcon />}
                sx={{ borderWidth: "0.5px", flexShrink: 0 }}
              >
                Logout all users
              </Button>
            </Box>
          </CardContent>
        </Card>

      </Box>
    </Box>
  );
}