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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
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

export default function PharmaManagement() {
  const [pharmacies, setPharmacies] = useState<IPharmacy[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔷 MODAL STATE
  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState<INewPharmacy>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<INewPharmacy>>({});
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("token");

  // 🔷 FETCH PHARMACIES
  const fetchPharmacies = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/pharmacies", {
        headers: { Authorization: Bearer ${token} },
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

  // 🔷 TOGGLE ACTIVE STATUS
  const toggleStatus = async (id: string) => {
    try {
      await api.put(
        /admin/pharmacies/${id}/toggle,
        {},
        { headers: { Authorization: Bearer ${token} } }
      );
      fetchPharmacies();
    } catch (error) {
      console.log(error);
    }
  };

  // 🔷 DELETE PHARMACY
  const deletePharmacy = async (id: string) => {
    try {
      await api.delete(/admin/pharmacies/${id}, {
        headers: { Authorization: Bearer ${token} },
      });
      fetchPharmacies();
    } catch (error) {
      console.log(error);
    }
  };

  // 🔷 MODAL HANDLERS
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

  // 🔷 ADD PHARMACY SUBMIT
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
        { headers: { Authorization: Bearer ${token} } }
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

  return (
    <Box sx={{ p: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>

      {/* HEADER */}
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
          <Typography sx={{ fontSize: 24, fontWeight: "bold" }}>
            Pharmacy Management
          </Typography>
          <Typography variant="caption" color="gray">
            Manage all registered pharmacies
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenModal}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: "bold" }}
        >
          Add Pharmacy
        </Button>
      </Box>

      {/* SEARCH */}
      <TextField
        fullWidth
        placeholder="Search pharmacy..."
        onChange={(e) => setSearch(e.target.value)}
        sx={{ backgroundColor: "white", borderRadius: 2, mb: 2 }}
      />

      {/* LOADING */}
      {loading && (
        <Typography color="gray" sx={{ mb: 2 }}>
          Loading pharmacies...
        </Typography>
      )}

      {/* EMPTY STATE */}
      {!loading && pharmacies.length === 0 && (
        <Typography color="gray">No pharmacies found.</Typography>
      )}

      {/* LIST */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2,
        }}
      >
        {pharmacies.map((pharmacy) => (
          <Card key={pharmacy._id} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography sx={{ fontWeight: "bold" }}>
                {pharmacy.name}
              </Typography>
              <Typography variant="body2">{pharmacy.address}</Typography>
              <Typography variant="body2">{pharmacy.phone}</Typography>
              <Typography
                variant="caption"
                sx={{ color: pharmacy.isActive ? "green" : "red" }}
              >
                {pharmacy.isActive ? "ACTIVE" : "INACTIVE"}
              </Typography>

              <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                <Button
                  size="small"
                  variant="contained"
                  color={pharmacy.isActive ? "warning" : "success"}
                  onClick={() => toggleStatus(pharmacy._id)}
                >
                  {pharmacy.isActive ? "Deactivate" : "Activate"}
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  onClick={() => deletePharmacy(pharmacy._id)}
                >
                  Delete
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* ADD PHARMACY MODAL */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: "bold", pr: 6 }}>
          Add New Pharmacy
          <IconButton
            onClick={handleCloseModal}
            sx={{ position: "absolute", right: 12, top: 12 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>

          {/* OWNER ACCOUNT */}
          <Typography variant="caption" color="text.secondary" fontWeight="bold">
            OWNER ACCOUNT
          </Typography>

          <TextField
            label="Owner Full Name"
            name="ownerName"
            value={form.ownerName}
            onChange={handleFormChange}
            error={!!formErrors.ownerName}
            helperText={formErrors.ownerName}
            fullWidth
            size="small"
          />

          <TextField
            label="Owner Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleFormChange}
            error={!!formErrors.email}
            helperText={formErrors.email || "Used to log in as the pharmacy owner."}
            fullWidth
            size="small"
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
            size="small"
          />

          <Divider sx={{ mt: 1 }} />

          {/* PHARMACY DETAILS */}
          <Typography variant="caption" color="text.secondary" fontWeight="bold">
            PHARMACY DETAILS
          </Typography>

          <TextField
            label="Pharmacy Name"
            name="pharmacyName"
            value={form.pharmacyName}
            onChange={handleFormChange}
            error={!!formErrors.pharmacyName}
            helperText={formErrors.pharmacyName}
            fullWidth
            size="small"
          />

          <TextField
            label="Address"
            name="address"
            value={form.address}
            onChange={handleFormChange}
            error={!!formErrors.address}
            helperText={formErrors.address}
            fullWidth
            size="small"
          />

          <TextField
            label="Contact Number"
            name="contactNumber"
            value={form.contactNumber}
            onChange={handleFormChange}
            error={!!formErrors.contactNumber}
            helperText={formErrors.contactNumber}
            fullWidth
            size="small"
          />

          {/* LAT / LNG */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Latitude"
              name="lat"
              value={form.lat}
              onChange={handleFormChange}
              error={!!formErrors.lat}
              helperText={formErrors.lat || "e.g. 14.5995"}
              fullWidth
              size="small"
            />
            <TextField
              label="Longitude"
              name="lng"
              value={form.lng}
              onChange={handleFormChange}
              error={!!formErrors.lng}
              helperText={formErrors.lng || "e.g. 120.9842"}
              fullWidth
              size="small"
            />
          </Box>

        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            onClick={handleCloseModal}
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: "none" }}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddPharmacy}
            variant="contained"
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: "bold" }}
            disabled={submitting}
          >
            {submitting ? "Adding..." : "Add Pharmacy"}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
