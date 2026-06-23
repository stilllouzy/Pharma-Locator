import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Skeleton,
} from "@mui/material";
import { useEffect, useState } from "react";
import api from "../../api/api";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";


interface IProfile {
  name: string;
  email: string;
  contactNumber?: string;
  address?: string;
  role: string;
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "10px",
          backgroundColor: "#F4F7FB",
          color: "text.secondary",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography
          variant="caption"
          sx={{
            color: "text.disabled",
            display: "block",
            lineHeight: 1.2,
          }}
        >
          {label}
        </Typography>

        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 500,
            color: "text.primary",
            mt: 0.25,
          }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  );
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

  if (loading) {
  return (
    <Box>
      <Skeleton variant="text" width={180} height={40} />
      <Skeleton variant="rounded" height={120} sx={{ mb: 2 }} />
      <Skeleton variant="rounded" height={180} sx={{ mb: 2 }} />
      <Skeleton variant="rounded" height={180} />
    </Box>
  );
}
  if (!profile) return <Typography sx={{ p: 3 }}>Profile not found.</Typography>;

  return (
    <Box>
      <Box sx={{ mb: 3, }}>
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1,
      mb: 0.5,
      justifyContent: "center",
    }}
  >
    <PersonOutlineIcon
      sx={{
        fontSize: 20,
        color: "primary.main",
      }}
    />

    <Typography
      sx={{
        fontSize: 22,
        fontWeight: 700,
        color: "primary.main",
        alignText: "center"
      }}
    >
      Rider Profile
    </Typography>
  </Box>

  <Typography variant="caption" color="text.disabled">
    Manage your personal information
  </Typography>
</Box>
<Card sx={{ mb: 3 }}>
  <CardContent>
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          backgroundColor: "rgba(13,59,110,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <PersonOutlineIcon
          sx={{
            fontSize: 30,
            color: "primary.main",
          }}
        />
      </Box>

      <Box>
        <Typography
          sx={{
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          {profile.name}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          {profile.email}
        </Typography>
      </Box>
    </Box>
  </CardContent>
</Card>
<Typography
  variant="overline"
  sx={{
    color: "text.disabled",
    mb: 1.25,
    display: "block",
  }}
>
  Account Information
</Typography>

<Card sx={{ mb: 3 }}>
  <CardContent>
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <InfoRow
        icon={<PersonOutlineIcon sx={{ fontSize: 18 }} />}
        label="Full Name"
        value={profile.name}
      />

      <InfoRow
        icon={<EmailOutlinedIcon sx={{ fontSize: 18 }} />}
        label="Email"
        value={profile.email}
      />

      <InfoRow
  icon={<BadgeOutlinedIcon sx={{ fontSize: 18 }} />}
  label="Role"
  value={
    profile.role.charAt(0).toUpperCase() +
    profile.role.slice(1)
  }
/>
    </Box>
  </CardContent>
</Card>
<Typography
  variant="overline"
  sx={{
    color: "text.disabled",
    mb: 1.25,
    display: "block",
  }}
>
  Contact Information
</Typography>

<Card sx={{ mb: 3 }}>
  <CardContent>
    {editing ? (
      // EDIT FORM
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <TextField
          size="small"
          label="Contact Number"
          value={form.contactNumber}
          onChange={(e) =>
            setForm({
              ...form,
              contactNumber: e.target.value,
            })
          }
          fullWidth
        />

        <TextField
          size="small"
          label="Address"
          value={form.address}
          onChange={(e) =>
            setForm({
              ...form,
              address: e.target.value,
            })
          }
          fullWidth
        />

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            onClick={handleUpdate}
            disableElevation
            sx={{
              borderRadius: "8px",
              textTransform: "none",
            }}
          >
            Save Changes
          </Button>

          <Button
            variant="outlined"
            onClick={() => setEditing(false)}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
            }}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    ) : (
      // DISPLAY MODE
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <InfoRow
          icon={<PhoneOutlinedIcon sx={{ fontSize: 18 }} />}
          label="Contact Number"
          value={profile.contactNumber || "Not set"}
        />

        <InfoRow
          icon={<LocationOnOutlinedIcon sx={{ fontSize: 18 }} />}
          label="Address"
          value={profile.address || "Not set"}
        />

        <Button
          variant="contained"
          startIcon={<EditOutlinedIcon />}
          onClick={() => setEditing(true)}
          disableElevation
          sx={{
            mt: 1,
            alignSelf: "flex-start",
            borderRadius: "8px",
            textTransform: "none",
          }}
        >
          Edit Profile
        </Button>
      </Box>
    )}
  </CardContent>
</Card>
 
    </Box>
  );
}