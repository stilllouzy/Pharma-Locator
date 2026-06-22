import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Chip,
  InputAdornment,
  Skeleton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import DeleteIconfrom "@mui/icons-material/DeleteOutline";
import { useEffect, useState } from "react";
import api from "../../api/api";

interface IPharmacy {
  _id: string;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
  ownerId?: string;
}

interface INewPharmacy {
  ownerName: string;
  email: string;
  password: string;
  pharmacyName: string;
  address: string;
  contactNumber: string;
  lat: string;
  lng: string;
}

const emptyForm: INewPharmacy = {
  ownerName: "",
  email: "",
  password: "",
  pharmacyName: "",
  address: "",
  contactNumber: "",
  lat: "",
  lng: "",
};

// ─── Section label inside modal ───────────────────────────────────────────────
function ModalSection({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      variant="overline"
      sx={{ color: "text.secondary", display: "block", mt: 0.5, mb: -0.5 }}
    >
      {children}
    </Typography>
  );
}

export default function PharmaManagement() {
  const [pharmacies, setPharmacies] = useState<IPharmacy[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState<INewPharmacy>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<INewPharmacy>>({});
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("token");

  const fetchPharmacies = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/pharmacies", {
        headers: { Authorization: `Bearer ${token}` },
        params: { search },
      });
      setPharmacies(res.data);
    } catch (error) {
      console.log("Error fetching pharmacies:", error);
      setPharmacies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacies();
  }, [search]);

  const toggleStatus = async (id: string) => {
    try {
      await api.put(
        `/admin/pharmacies/${id}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPharmacies();
    } catch (error) {
      console.log(error);
    }
  };

  const deletePharmacy = async (id: string) => {
    try {
      await api.delete(`/admin/pharmacies/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPharmacies();
    } catch (error) {
      console.log(error);
    }
  };

  const handleOpenModal = () => {
    setForm(emptyForm);
    setFormErrors({});
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setForm(emptyForm);
    setFormErrors({});
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = (): boolean => {
    const errors: Partial<INewPharmacy> = {};
    if (!form.ownerName.trim()) errors.ownerName = "Owner name is required.";
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
    if (!form.pharmacyName.trim()) errors.pharmacyName = "Pharmacy name is required.";
    if (!form.address.trim()) errors.address = "Address is required.";
    if (!form.contactNumber.trim()) errors.contactNumber = "Contact number is required.";
    if (!form.lat.trim()) {
      errors.lat = "Latitude is required.";
    } else if (isNaN(Number(form.lat))) {
      errors.lat = "Must be a valid number.";
    }
    if (!form.lng.trim()) {
      errors.lng = "Longitude is required.";
    } else if (isNaN(Number(form.lng))) {
      errors.lng = "Must be a valid number.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddPharmacy = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      await api.post(
        "/admin/create-pharmacy",
        {
          name: form.ownerName.trim(),
          email: form.email.trim(),
          password: form.password,
          pharmacyName: form.pharmacyName.trim(),
          address: form.address.trim(),
          contactNumber: form.contactNumber.trim(),
          lat: Number(form.lat),
          lng: Number(form.lng),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      handleCloseModal();
      fetchPharmacies();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to add pharmacy.";
      setFormErrors((prev) => ({ ...prev, email: msg }));
    } finally {
      setSubmitting(false);
    }
  };

  const activeCount = pharmacies.filter((p) => p.isActive).length;

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
            Pharmacy Management
          </Typography>
          <Typography variant="subtitle1" sx={{ fontSize: "0.83rem" }}>
            {pharmacies.length} registered · {activeCount} active
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenModal}
        >
          Add pharmacy
        </Button>
      </Box>

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search by name or address..."
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2.5 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            </InputAdornment>
          ),
        }}
      />

      {/* Loading */}
      {loading && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2,
          }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={130} />
          ))}
        </Box>
      )}

      {/* Empty state */}
      {!loading && pharmacies.length === 0 && (
        <Box
          sx={{
            py: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
          }}
        >
          <LocalPharmacyIcon sx={{ fontSize: 40, color: "text.disabled" }} />
          <Typography variant="body2" color="text.secondary">
            No pharmacies found.
          </Typography>
          {search && (
            <Typography variant="caption" color="text.disabled">
              Try a different search term.
            </Typography>
          )}
        </Box>
      )}

      {/* Pharmacy grid */}
      {!loading && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2,
          }}
        >
          {pharmacies.map((pharmacy) => (
            <Card key={pharmacy._id}>
              <CardContent sx={{ px: "20px !important", py: "16px !important" }}>

                {/* Top row: name + status */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: "10px",
                        backgroundColor: pharmacy.isActive ? "#E8F5E9" : "#F5F5F5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: pharmacy.isActive ? "#2E7D32" : "#9E9E9E",
                        flexShrink: 0,
                      }}
                    >
                      <LocalPharmacyIcon sx={{ fontSize: 18 }} />
                    </Box>
                    <Typography
                      sx={{ fontWeight: 600, fontSize: "0.9rem", color: "text.primary" }}
                    >
                      {pharmacy.name}
                    </Typography>
                  </Box>
                  <Chip
                    label={pharmacy.isActive ? "Active" : "Inactive"}
                    color={pharmacy.isActive ? "success" : "default"}
                    size="small"
                  />
                </Box>

                {/* Details */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mb: 1.5, pl: "50px" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <LocationOnIcon sx={{ fontSize: 13, color: "text.disabled" }} />
                    <Typography variant="caption" color="text.secondary">
                      {pharmacy.address || "—"}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <PhoneIcon sx={{ fontSize: 13, color: "text.disabled" }} />
                    <Typography variant="caption" color="text.secondary">
                      {pharmacy.phone || "—"}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb: 1.5 }} />

                {/* Actions */}
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    color={pharmacy.isActive ? "warning" : "success"}
                    onClick={() => toggleStatus(pharmacy._id)}
                    sx={{ borderRadius: "8px", fontSize: "0.75rem", borderWidth: "0.5px", px: 1.5 }}
                  >
                    {pharmacy.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon sx={{ fontSize: "15px !important" }} />}
                    onClick={() => deletePharmacy(pharmacy._id)}
                    sx={{ borderRadius: "8px", fontSize: "0.75rem", borderWidth: "0.5px", px: 1.5 }}
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Add Pharmacy Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle sx={{ pr: 6 }}>
          Add new pharmacy
          <IconButton
            onClick={handleCloseModal}
            sx={{ position: "absolute", right: 12, top: 12 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

          <ModalSection>Owner account</ModalSection>

          <TextField
            label="Owner full name"
            name="ownerName"
            value={form.ownerName}
            onChange={handleFormChange}
            error={!!formErrors.ownerName}
            helperText={formErrors.ownerName}
            fullWidth
          />
          <TextField
            label="Owner email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleFormChange}
            error={!!formErrors.email}
            helperText={formErrors.email || "Used to log in as the pharmacy owner."}
            fullWidth
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleFormChange}
            error={!!formErrors.password}
            helperText={formErrors.password || "Minimum 6 characters."}
            fullWidth
          />

          <Divider />

          <ModalSection>Pharmacy details</ModalSection>

          <TextField
            label="Pharmacy name"
            name="pharmacyName"
            value={form.pharmacyName}
            onChange={handleFormChange}
            error={!!formErrors.pharmacyName}
            helperText={formErrors.pharmacyName}
            fullWidth
          />
          <TextField
            label="Address"
            name="address"
            value={form.address}
            onChange={handleFormChange}
            error={!!formErrors.address}
            helperText={formErrors.address}
            fullWidth
          />
          <TextField
            label="Contact number"
            name="contactNumber"
            value={form.contactNumber}
            onChange={handleFormChange}
            error={!!formErrors.contactNumber}
            helperText={formErrors.contactNumber}
            fullWidth
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Latitude"
              name="lat"
              value={form.lat}
              onChange={handleFormChange}
              error={!!formErrors.lat}
              helperText={formErrors.lat || "e.g. 14.3294"}
              fullWidth
            />
            <TextField
              label="Longitude"
              name="lng"
              value={form.lng}
              onChange={handleFormChange}
              error={!!formErrors.lng}
              helperText={formErrors.lng || "e.g. 120.9367"}
              fullWidth
            />
          </Box>

        </DialogContent>

        <Divider />

        <DialogActions>
          <Button onClick={handleCloseModal} variant="outlined" disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleAddPharmacy}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? "Adding..." : "Add pharmacy"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}