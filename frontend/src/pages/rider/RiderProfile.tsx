import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Divider,
} from "@mui/material";
import { useEffect, useState } from "react";
import api from "../../api/api";

interface IProfile {
  name: string;
  email: string;
  contactNumber?: string;
  address?: string;
  role: string;
}

export default function RiderProfile() {
  const [profile, setProfile] = useState<IProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    contactNumber: "",
    address: "",
  });

  const token = localStorage.getItem("token");

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
      setForm({
        contactNumber: res.data.contactNumber || "",
        address: res.data.address || "",
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    try {
      await api.put("/auth/me", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Profile updated!");
      setEditing(false);
      fetchProfile();
    } catch (error) {
      console.error(error);
      alert("Failed to update profile.");
    }
  };

  if (loading) return <Typography sx={{ p: 3 }}>Loading...</Typography>;
  if (!profile) return <Typography sx={{ p: 3 }}>Profile not found.</Typography>;

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

          {/* BASIC INFO */}
          <Typography sx={{ fontWeight: "bold", mb: 1 }}>
            Basic Information
          </Typography>

          <Typography variant="body2" color="gray">Name</Typography>
          <Typography sx={{ mb: 1 }}>{profile.name}</Typography>

          <Typography variant="body2" color="gray">Email</Typography>
          <Typography sx={{ mb: 1 }}>{profile.email}</Typography>

          <Typography variant="body2" color="gray">Role</Typography>
          <Typography sx={{ mb: 1, textTransform: "capitalize" }}>
            {profile.role}
          </Typography>

          <Divider sx={{ my: 2 }} />

          {/* EDITABLE INFO */}
          <Typography sx={{ fontWeight: "bold", mb: 1 }}>
            Contact Information
          </Typography>

          {editing ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Contact Number"
                value={form.contactNumber}
                onChange={(e) =>
                  setForm({ ...form, contactNumber: e.target.value })
                }
                fullWidth
              />
              <TextField
                label="Address"
                value={form.address}
                onChange={(e) =>
                  setForm({ ...form, address: e.target.value })
                }
                fullWidth
              />
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button variant="contained" onClick={handleUpdate}>
                  Save
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          ) : (
            <Box>
              <Typography variant="body2" color="gray">
                Contact Number
              </Typography>
              <Typography sx={{ mb: 1 }}>
                {profile.contactNumber || "Not set"}
              </Typography>

              <Typography variant="body2" color="gray">Address</Typography>
              <Typography sx={{ mb: 2 }}>
                {profile.address || "Not set"}
              </Typography>

              <Button variant="outlined" onClick={() => setEditing(true)}>
                Edit Profile
              </Button>
            </Box>
          )}

        </CardContent>
      </Card>
    </Box>
  );
}