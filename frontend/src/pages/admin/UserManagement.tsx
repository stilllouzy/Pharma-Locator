import {
  Box,
  Typography,
  Card,
  CardContent,
  Input,
  Button,
  Chip,
  InputAdornment,
  Skeleton,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Collapse,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import PersonIcon from "@mui/icons-material/Person";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import ShieldIcon from "@mui/icons-material/Shield";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EmailIcon from "@mui/icons-material/Email";
import { useEffect, useState } from "react";
import api from "../../api/api";

// ─── Types ────────────────────────────────────────────────────────────────────
type Role = "all" | "user" | "pharmacy" | "rider" | "admin";

interface IUser {
  _id: string;
  name: string;
  email: string;
  role: "user" | "pharmacy" | "rider" | "admin";
}

interface INewAccount {
  name: string;
  email: string;
  password: string;
  role: "rider" | "admin";
}

const emptyForm: INewAccount = {
  name: "",
  email: "",
  password: "",
  role: "rider",
};

// ─── Role config ──────────────────────────────────────────────────────────────
const ROLE_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  admin: {
    label: "Admin",
    color: "#1565C0",
    bg: "#E3F2FD",
    icon: <ShieldIcon sx={{ fontSize: 18 }} />,
  },
  pharmacy: {
    label: "Pharmacy",
    color: "#2E7D32",
    bg: "#E8F5E9",
    icon: <LocalPharmacyIcon sx={{ fontSize: 18 }} />,
  },
  rider: {
    label: "Rider",
    color: "#E65100",
    bg: "#FFF3E0",
    icon: <TwoWheelerIcon sx={{ fontSize: 18 }} />,
  },
  user: {
    label: "Resident",
    color: "#6A1B9A",
    bg: "#F3E5F5",
    icon: <PersonIcon sx={{ fontSize: 18 }} />,
  },
};

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS: { value: Role; label: string; icon: React.ReactNode }[] = [
  { value: "all",      label: "All",      icon: <PeopleAltIcon sx={{ fontSize: 16 }} /> },
  { value: "user",     label: "Residents", icon: <PersonIcon sx={{ fontSize: 16 }} /> },
  { value: "pharmacy", label: "Pharmacy",  icon: <LocalPharmacyIcon sx={{ fontSize: 16 }} /> },
  { value: "rider",    label: "Riders",    icon: <TwoWheelerIcon sx={{ fontSize: 16 }} /> },
  { value: "admin",    label: "Admins",    icon: <ShieldIcon sx={{ fontSize: 16 }} /> },
];

// ─── User card ────────────────────────────────────────────────────────────────
function UserCard({
  user,
  onDelete,
}: {
  user: IUser;
  onDelete: (id: string) => void;
}) {
  const config = ROLE_CONFIG[user.role];

  return (
    <Card>
      <CardContent
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          px: "20px !important",
          py: "14px !important",
        }}
      >
        {/* Avatar icon */}
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: "10px",
            backgroundColor: config.bg,
            color: config.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {config.icon}
        </Box>

        {/* Info */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "0.9rem",
              color: "text.primary",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {user.name}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.25 }}>
            <EmailIcon sx={{ fontSize: 12, color: "text.disabled" }} />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user.email}
            </Typography>
          </Box>
        </Box>

        {/* Role chip */}
        <Chip
          label={config.label}
          size="small"
          sx={{
            backgroundColor: config.bg,
            color: config.color,
            fontWeight: 600,
            fontSize: "0.68rem",
            flexShrink: 0,
          }}
        />

        {/* Delete — not shown for pharmacy (managed in PharmaManagement) */}
        {user.role !== "pharmacy" && (
          <IconButton
            size="small"
            color="error"
            onClick={() => onDelete(user._id)}
            sx={{ flexShrink: 0 }}
          >
            <DeleteIcon sx={{ fontSize: 18 }} />
          </IconButton>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function UserManagement() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<Role>("all");
  const [loading, setLoading] = useState(false);

  // Modal
  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState<INewAccount>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<INewAccount>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [submitMsg, setSubmitMsg] = useState("");

  const token = localStorage.getItem("token");

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
        params: { search },
      });
      setUsers(res.data);
    } catch (error) {
      console.log("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this account?")) return;
    try {
      await api.delete(`/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (error) {
      console.log(error);
    }
  };

  // ── Filter by tab ──────────────────────────────────────────────────────────
  const filtered = users.filter((u) => {
    const matchesTab = activeTab === "all" || u.role === activeTab;
    return matchesTab;
  });

  // Count per role for tab badges
  const countFor = (role: Role) =>
    role === "all" ? users.length : users.filter((u) => u.role === role).length;

  // ── Modal ──────────────────────────────────────────────────────────────────
  const handleOpenModal = () => {
    setForm(emptyForm);
    setFormErrors({});
    setSubmitStatus("idle");
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setForm(emptyForm);
    setFormErrors({});
    setSubmitStatus("idle");
  };

  const handleFormChange = (field: keyof INewAccount, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = (): boolean => {
    const errors: Partial<INewAccount> = {};
    if (!form.name.trim()) errors.name = "Name is required.";
    if (!form.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Enter a valid email address.";
    }
    if (!form.password.trim()) {
      errors.password = "Password is required.";
    } else if (form.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddAccount = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    setSubmitStatus("idle");

    const endpoint =
      form.role === "rider" ? "/admin/create-rider" : "/admin/create-admin";

    try {
      await api.post(
        endpoint,
        { name: form.name.trim(), email: form.email.trim(), password: form.password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmitStatus("success");
      setSubmitMsg(`${form.role === "rider" ? "Rider" : "Admin"} account created successfully.`);
      fetchUsers();
      setTimeout(() => handleCloseModal(), 1500);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to create account.";
      setSubmitStatus("error");
      setSubmitMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 3, minHeight: "100vh" }}>

      {/* Header */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Box>
          <Typography variant="h2" sx={{ fontSize: "1.4rem", mb: 0.25 }}>
            User Management
          </Typography>
          <Typography variant="subtitle1" sx={{ fontSize: "0.83rem" }}>
            {users.length} account{users.length !== 1 ? "s" : ""} registered in the system
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenModal}>
          Add account
        </Button>
      </Box>

      {/* Search */}
      <Input
        fullWidth
        placeholder="Search by name or email..."
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
        slotProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            </InputAdornment>
          ),
        }}
      />

      {/* Role tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        sx={{ mb: 2.5 }}
        variant="scrollable"
        scrollButtons="auto"
      >
        {TABS.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                {tab.icon}
                <span>{tab.label}</span>
                <Chip
                  label={countFor(tab.value)}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    backgroundColor:
                      activeTab === tab.value ? "#0D3B6E" : "rgba(0,0,0,0.07)",
                    color: activeTab === tab.value ? "#fff" : "text.secondary",
                    ml: 0.25,
                  }}
                />
              </Box>
            }
          />
        ))}
      </Tabs>

      {/* Loading skeletons */}
      {loading && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={70} />
          ))}
        </Box>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <Box
          sx={{
            py: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
          }}
        >
          <PeopleAltIcon sx={{ fontSize: 40, color: "text.disabled" }} />
          <Typography variant="body2" color="text.secondary">
            No {activeTab === "all" ? "users" : activeTab === "user" ? "residents" : activeTab + "s"} found.
          </Typography>
          {search && (
            <Typography variant="caption" color="text.disabled">
              Try a different search term.
            </Typography>
          )}
        </Box>
      )}

      {/* User list */}
      {!loading && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {filtered.map((user) => (
            <UserCard key={user._id} user={user} onDelete={deleteUser} />
          ))}
        </Box>
      )}

      {/* Add Account Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle sx={{ pr: 6 }}>
          Add new account
          <IconButton
            onClick={handleCloseModal}
            sx={{ position: "absolute", right: 12, top: 12 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

          {/* Role selector */}
          <FormControl fullWidth>
            <InputLabel>Account role</InputLabel>
            <Select
              value={form.role}
              label="Account role"
              onChange={(e) => handleFormChange("role", e.target.value)}
            >
              <MenuItem value="rider">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TwoWheelerIcon sx={{ fontSize: 16, color: "#E65100" }} />
                  Rider
                </Box>
              </MenuItem>
              <MenuItem value="admin">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <ShieldIcon sx={{ fontSize: 16, color: "#1565C0" }} />
                  Admin
                </Box>
              </MenuItem>
            </Select>
            <FormHelperText>
              {form.role === "rider"
                ? "Rider accounts can accept and manage deliveries."
                : "Admin accounts have full system access. Add with caution."}
            </FormHelperText>
          </FormControl>

          <Divider />

          {/* Account details */}
          <Typography variant="overline" color="text.secondary">
            Account details
          </Typography>

          <Input
            label="Full name"
            value={form.name}
            onChange={(e) => handleFormChange("name", e.target.value)}
            error={!!formErrors.name}
            helperText={formErrors.name}
            fullWidth
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => handleFormChange("email", e.target.value)}
            error={!!formErrors.email}
            helperText={formErrors.email || "This will be used to log in."}
            fullWidth
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => handleFormChange("password", e.target.value)}
            error={!!formErrors.password}
            helperText={formErrors.password || "Minimum 6 characters."}
            fullWidth
          />

          {/* Submit feedback */}
          <Collapse in={submitStatus !== "idle"}>
            <Alert
              severity={submitStatus === "success" ? "success" : "error"}
              sx={{ borderRadius: "8px", fontSize: "0.82rem" }}
            >
              {submitMsg}
            </Alert>
          </Collapse>

        </DialogContent>

        <Divider />

        <DialogActions>
          <Button onClick={handleCloseModal} variant="outlined" disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleAddAccount}
            variant="contained"
            disabled={submitting || submitStatus === "success"}
          >
            {submitting ? "Creating..." : "Create account"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}